const { isBufferLike, isTypedArray, rand64 } = require('../util')
const { normalizeFlags } = require('./flags')
const { EventEmitter } = require('../events')
const { Buffer } = require('../buffer')
const { Stats } = require('./stats')
const constants = require('./constants')
const ipc = require('../ipc')
const fds = require('./fds')

/**
 * @TODO
 */
class FileHandle extends EventEmitter {
  static get DEFAULT_ACCESS_MODE () { return constants.F_OK }
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

    const handle = new this({ fd, id })

    handle.flags = null
    handle.path = null
    handle.mode = null

    return handle
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

    const request = await ipc.request('fsOpen', {
      id: handle.id,
      flags: handle.flags,
      mode: handle.mode,
      path: handle.path
    })

    handle.fd = request.fd

    fds.set(handle.id, handle.fd)

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

    this.flags = normalizeFlags(options?.flags)
    this.path = options?.path || null
    this.mode = options?.mode || FileHandle.DEFAULT_ACCESS_MODE
    // this id will be used to identify the file handle that is a reference
    // stored in a map container on the objective-c side of the bridge.
    this.id = options.id || String(rand64())
    this.fd = options.fd || null // internal file descriptor
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
    await ipc.request('fsClose', { id: this.id })
    fds.release(this.id)
    this.fd = null
    this.emit('close')
  }

  /**
   * @TODO
   */
  createReadStream (options) {
  }

  /**
   * @TODO
   */
  createWriteStream (options) {
  }

  /**
   * @TODO
   */
  async datasync () {
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
      offset
    })

    if (response instanceof ArrayBuffer) {
      bytesRead = response.byteLength
      Buffer.from(response).copy(buffer, 0, offset)
    } else {
      throw new TypeError('Invalid response buffer from `fsRead`.')
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
    const { id } = this
    const response = await ipc.request('fsFStat', { id })
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

module.exports = {
  FileHandle
}
