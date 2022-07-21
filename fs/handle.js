import {
  InvertedPromise,
  isBufferLike,
  isTypedArray,
  splitBuffer,
  rand64
} from '../util.js'

import { ReadStream, WriteStream } from './stream.js'
import { normalizeFlags } from './flags.js'
import { EventEmitter } from '../events.js'
import { AbortError } from '../errors.js'
import { Buffer } from 'buffer'
import { Stats } from './stats.js'
import { F_OK } from './constants.js'
import * as ipc from '../ipc.js'
import fds from './fds.js'

const kOpening = Symbol.for('fs.FileHandle.opening')
const kClosing = Symbol.for('fs.FileHandle.closing')

/**
 * A container for a descriptor tracked in `fds` and opened in the native layer.
 * This class implements the Node.js `FileHandle` interface
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#class-filehandle}
 */
export class FileHandle extends EventEmitter {
  static get DEFAULT_ACCESS_MODE () { return F_OK }
  static get DEFAULT_OPEN_FLAGS () { return 'r' }
  static get DEFAULT_OPEN_MODE () { return 0o666 }

  /**
   * Creates a `FileHandle` from a given `id` or `fd`
   * @param {string|number|FileHandle|object} id
   * @return {FileHandle}
   */
  static from (id) {
    if (id?.id) {
      return this.from(id.id)
    } else if (id?.fd) {
      return this.from(id.fd)
    }

    let fd = fds.get(id)

    // `id` could actually be an `fd`
    if (!fd) {
      id = fds.to(id)
      fd = fds.get(id)
    }

    if (!fd || !id) {
      throw new Error('Invalid file descriptor.')
    }

    return new this({ fd, id })
  }

  /**
   * Determines if access to `path` for `mode` is possible.
   * @param {string} path
   * @param {(number)} [mode = 0o666]
   * @return {boolean}
   */
  static async access (path, mode) {
    if (mode === undefined) {
      mode = FileHandle.DEFAULT_ACCESS_MODE
    }

    const result = await ipc.request('fsAccess', {
      mode,
      path
    })

    if (result.err) {
      throw result.err
    }

    return result.data.mode === mode
  }

  /**
   * Asynchronously open a file calling `callback` upon success or error.
   * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesopenpath-flags-mode}
   * @param {string | Buffer | URL} path
   * @param {?(string)} [flags = 'r']
   * @param {?(string)} [mode = 0o666]
   */
  static async open (path, flags, mode) {
    if (flags === undefined) {
      flags = FileHandle.DEFAULT_OPEN_FLAGS
    }

    if (mode === undefined) {
      mode = FileHandle.DEFAULT_OPEN_MODE
    }

    const handle = new this({ path, flags, mode })

    if (typeof handle.path !== 'string') {
      throw new TypeError('Expecting path to be a string, Buffer, or URL.')
    }

    await handle.open()

    return handle
  }

  /**
   * `FileHandle` class constructor
   * @private
   * @param {object} options
   */
  constructor (options) {
    super()

    // String | Buffer | URL | { toString(): String }
    if (options?.path && typeof options.path.toString === 'function') {
      options.path = options.path.toString()
    }

    this[kOpening] = null
    this[kClosing] = null

    this.flags = normalizeFlags(options?.flags)
    this.path = options?.path || null
    this.mode = options?.mode || FileHandle.DEFAULT_ACCESS_MODE

    // this id will be used to identify the file handle that is a
    // reference stored in the native side
    this.id = options.id || String(rand64())
    this.fd = options.fd || null // internal file descriptor
  }

  /**
   * `true` if the `FileHandle` instance has been opened.
   * @type {boolean}
   */
  get opened () {
    return this.fd !== null && this.fd === fds.get(this.id)
  }

  /**
   * `true` if the `FileHandle` is opening.
   * @type {boolean}
   */
  get opening () {
    const opening = this[kOpening]
    return opening?.value !== true
  }

  /**
   * `true` if the `FileHandle` is closing.
   * @type {boolean}
   */
  get closing () {
    const closing = this[kClosing]
    return closing?.value !== true
  }

  /**
   * Appends to a file, if handle was opened with `O_APPEND`, otherwise this
   * method is just an alias to `FileHandle#writeFile()`.
   * @param {string|Buffer|TypedArray|Array} data
   * @param {?(object)} [options]
   * @param {?(string)} [options.encoding = 'utf8']
   * @param {?(object)} [options.signal]
   */
  async appendFile (data, options) {
    return await this.writeFile(data, options)
  }

  /**
   * @TODO
   */
  async chmod (mode) {
  }

  /**
   * @TODO
   */
  async chown (uid, gid) {
  }

  /**
   * @TODO
   */
  async close () {
    // wait for opening to finish before proceeding to close
    if (this[kOpening]) {
      await this[kOpening]
    }

    if (this[kClosing]) {
      return this[kClosing]
    }

    if (!this.fd || !this.id) {
      throw new Error('FileHandle is not opened')
    }

    this[kClosing] = new InvertedPromise()

    const result = await ipc.request('fsClose', { id: this.id })

    if (result.err) {
      return this[kClosing].reject(result.err)
    }

    fds.release(this.id)

    this.fd = null

    this[kClosing].resolve(true)

    this.emit('close')

    this[kOpening] = null
    this[kClosing] = null

    return true
  }

  /**
   * @TODO
   */
  createReadStream (options) {
    const stream = new ReadStream({
      autoClose: options?.autoClose === true,
      ...options,
      handle: this
    })

    stream.once('end', async () => {
      if (options?.autoClose === true) {
        try {
          await this.close()
        } catch (err) {
          stream.emit('error', err)
        }
      }
    })

    return stream
  }

  /**
   * @TODO
   */
  createWriteStream (options) {
    const stream = new WriteStream({
      autoClose: options?.autoClose === true,
      ...options,
      handle: this
    })

    stream.once('finish', async () => {
      if (options?.autoClose === true) {
        try {
          await this.close()
        } catch (err) {
          stream.emit('error', err)
        }
      }
    })

    return stream
  }

  /**
   * @TODO
   */
  async datasync () {
  }

  async open () {
    if (this.opened) {
      return true
    }

    if (this[kOpening]) {
      return this[kOpening]
    }

    const { flags, mode, path, id } = this

    this[kOpening] = new InvertedPromise()

    const result = await ipc.request('fsOpen', {
      id: id,
      flags: flags,
      mode: mode,
      path: path
    })

    if (result.err) {
      return this[kOpening].reject(result.err)
    }

    this.fd = result.data.fd

    fds.set(this.id, this.fd)

    this[kOpening].resolve(true)

    this.emit('open', this.fd)

    return true
  }

  /**
   * @TODO
   */
  async read (buffer, offset, length, position) {
    const { id } = this

    let bytesRead = 0

    if (typeof buffer === 'object' && !isBufferLike(buffer)) {
      offset = buffer.offset
      length = buffer.length
      position = buffer.position
      buffer = buffer.buffer
    }

    if (!isBufferLike(buffer)) {
      throw new TypeError('Expecting buffer to be a Buffer or TypedArray.')
    }

    if (offset === undefined) {
      offset = 0
    }

    if (length === undefined) {
      length = buffer.byteLength - offset
    }

    if (position === null) {
      position = -1
    }

    if (typeof position !== 'number') {
      position = 0
    }

    if (typeof offset !== 'number') {
      throw new TypeError(`Expecting offset to be a number. Got ${typeof offset}`)
    }

    if (typeof length !== 'number') {
      throw new TypeError(`Expecting length to be a number. Got ${typeof length}`)
    }

    if (offset < 0) {
      throw new RangeError(
        `Expecting offset to be greater than or equal to 0: Got ${offset}`
      )
    }

    if (offset + length > buffer.length) {
      throw new RangeError('Offset + length cannot be larger than buffer length.')
    }

    if (length < 0) {
      throw new RangeError(
        `Expecting length to be greater than or equal to 0: Got ${length}`
      )
    }

    if (isTypedArray(buffer)) {
      buffer = Buffer.from(buffer.buffer) // from ArrayBuffer
    }

    if (length > buffer.byteLength - offset) {
      throw new RangeError(
        `Expecting length to be less than or equal to ${buffer.byteLength - offset}: Got ${length}`
      )
    }

    const result = await ipc.request('fsRead', {
      id,
      size: length,
      offset: position
    })

    if (result.err) {
      throw result.err
    }

    if (isTypedArray(result.data) || result.data instanceof ArrayBuffer) {
      bytesRead = result.data.byteLength
      Buffer.from(result.data).copy(buffer, 0, offset)
    } else {
      throw new TypeError('Invalid response buffer from `fs.read`.')
    }

    return { bytesRead, buffer }
  }

  /**
   * @TODO
   */
  async readFile (options) {
    const buffers = []
    const stream = this.createReadStream(options)

    if (options?.signal instanceof AbortSignal) {
      options.signal.onabort = () => {
        stream.destroy(new AbortError(options.signal))
      }
    }

    // collect
    await new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('data', (buffer) => buffers.push(buffer))
      stream.on('error', reject)
    })

    const buffer = Buffer.concat(buffers)

    if (typeof options?.encoding === 'string') {
      return buffer.toString(options.encoding)
    }

    return buffer
  }

  /**
   * @TODO
   */
  async readv (buffers, position) {
  }

  /**
   * @TODO
   */
  async stat (options) {
    const result = await ipc.request('fsFStat', { id: this.id })

    if (result.err) {
      throw result.err
    }

    const stats = Stats.from(result.data, Boolean(options?.bigint))
    stats.handle = this
    return stats
  }

  /**
   * @TODO
   */
  async sync () {
  }

  /**
   * @TODO
   */
  async truncate (length) {
  }

  /**
   * @TODO
   */
  async utimes (atime, mtime) {
  }

  /**
   * @TODO
   */
  async write (buffer, offset, length, position) {
    if (typeof buffer === 'object' && !isBufferLike(buffer)) {
      offset = buffer.offset
      length = buffer.length
      position = buffer.position
      buffer = buffer.buffer
    }

    if (typeof buffer !== 'string' && !isBufferLike(buffer)) {
      throw new TypeError('Expecting buffer to be a string or Buffer.')
    }

    if (offset === undefined) {
      offset = 0
    }

    if (length === undefined) {
      length = buffer.length
    }

    if (position === null) {
      position = -1
    }

    if (typeof position !== 'number') {
      position = 0
    }

    if (length > buffer.length) {
      throw new RangeError('Length cannot be larger than buffer length.')
    }

    if (offset > buffer.length) {
      throw new RangeError('Offset cannot be larger than buffer length.')
    }

    if (offset + length > buffer.length) {
      throw new RangeError('Offset + length cannot be larger than buffer length.')
    }

    const data = Buffer.from(buffer).slice(offset, offset + length)
    const params = { id: this.id, offset: position }

    const result = await ipc.write('fsWrite', params, data)

    if (result.err) {
      throw result.err
    }

    return {
      buffer: data,
      bytesWritten: parseInt(result.data.result)
    }
  }

  /**
   * Writes `data` to file.
   * @param {string|Buffer|TypedArray|Array} data
   * @param {?(object)} [options]
   * @param {?(string)} [options.encoding = 'utf8']
   * @param {?(object)} [options.signal]
   */
  async writeFile (data, options) {
    const stream = this.createWriteStream(options)
    const buffer = Buffer.from(data, options?.encoding || 'utf8')
    const buffers = splitBuffer(buffer, stream.highWaterMark)

    if (options?.signal instanceof AbortSignal) {
      options.signal.onabort = () => {
        stream.destroy(new AbortError(options.signal))
      }
    }

    queueMicrotask(async () => {
      while (buffers.length) {
        const buffer = buffers.shift()
        if (!stream.write(buffer)) {
          // block until drain
          await new Promise((resolve) => stream.once('drain', resolve))
        }
      }
    })

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }

  /**
   * @TODO
   */
  async writev (buffers, position) {
  }
}
