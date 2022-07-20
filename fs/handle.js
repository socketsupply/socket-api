/* global atob, escape */
import { InvertedPromise, isBufferLike, isTypedArray, rand64 } from '../util.js'
import { ReadStream, WriteStream } from './stream.js'
import { normalizeFlags } from './flags.js'
import { EventEmitter } from '../events.js'
import { Buffer } from 'buffer'
import { Stats } from './stats.js'
import { F_OK } from './constants.js'
import * as ipc from '../ipc.js'
import fds from './fds.js'

const kFileHandleOpening = Symbol.for('fs.FileHandle.opening')
const kFileHandleClosing = Symbol.for('fs.FileHandle.closing')

/**
 * @TODO
 */
export class FileHandle extends EventEmitter {
  static get DEFAULT_ACCESS_MODE () { return F_OK }
  static get DEFAULT_OPEN_FLAGS () { return 'r' }
  static get DEFAULT_OPEN_MODE () { return 0o666 }

  /**
   * @TODO
   */
  static from (id) {
    let fd = fds.get(id)

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
   * @TODO
   */
  static async access (path, mode) {
    if (mode === undefined) {
      mode = FileHandle.DEFAULT_ACCESS_MODE
    }

    const request = await ipc.request('fsAccess', {
      mode,
      path
    })

    return request.mode === mode
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

    this[kFileHandleOpening] = null
    this[kFileHandleClosing] = null

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
    const opening = this[kFileHandleOpening]
    return opening?.value !== true
  }

  /**
   * `true` if the `FileHandle` is closing.
   * @type {boolean}
   */
  get closing () {
    const closing = this[kFileHandleClosing]
    return closing?.value !== true
  }

  /**
   * @TODO
   */
  async appendFile (data, options) {
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
    if (this[kFileHandleOpening]) {
      await this[kFileHandleOpening]
    }

    if (this[kFileHandleClosing]) {
      return this[kFileHandleClosing]
    }

    if (!this.fd || !this.id) {
      throw new Error('FileHandle is not opened')
    }

    this[kFileHandleClosing] = new InvertedPromise()

    try {
      await ipc.request('fsClose', { id: this.id })
    } catch (err) {
      return this[kFileHandleClosing].reject(err)
    }

    fds.release(this.id)

    this.fd = null

    this[kFileHandleClosing].resolve(true)

    this.emit('close')

    this[kFileHandleOpening] = null
    this[kFileHandleClosing] = null

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

    if (this[kFileHandleOpening]) {
      return this[kFileHandleOpening]
    }

    const { flags, mode, path, id } = this

    this[kFileHandleOpening] = new InvertedPromise()

    try {
      const request = await ipc.request('fsOpen', {
        id: id,
        flags: flags,
        mode: mode,
        path: path
      })

      this.fd = request.fd
    } catch (err) {
      return this[kFileHandleOpening].reject(err)
    }

    fds.set(this.id, this.fd)

    this[kFileHandleOpening].resolve(true)

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

    const response = await ipc.request('fsRead', {
      id,
      size: length,
      offset: position
    })

    if (response instanceof ArrayBuffer) {
      bytesRead = response.byteLength
      Buffer.from(response).copy(buffer, 0, offset)
    } else {
      throw new TypeError('Invalid response buffer from `fs.read`.')
    }

    return { bytesRead, buffer }
  }

  /**
   * @TODO
   */
  async readFile (options) {
    const stats = await this.stat()
    const buffer = Buffer.alloc(stats.size)

    await this.read({ buffer })

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
    const response = await ipc.request('fsFStat', { id: this.id })
    const stats = Stats.from(response, Boolean(options?.bigint))
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

    const response = await ipc.write('fsWrite', params, data)

    return {
      buffer: data,
      bytesWritten: parseInt(response.result)
    }
  }

  /**
   * @TODO
   */
  async writeFile (data, options) {
  }

  /**
   * @TODO
   */
  async writev (buffers, position) {
  }
}
