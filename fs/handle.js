const { isBufferLike, isTypedArray, rand64 } = require('../util')
const { normalizeFlags } = require('./flags')
const { EventEmitter } = require('../events')
const { Buffer } = require('../buffer')
const ipc = require('../ipc')
const fds = require('./fds')

class FileHandle extends EventEmitter {
  static get DEFAULT_OPEN_FLAGS () { return 'r' }
  static get DEFAULT_OPEN_MODE () { return 0o666 }

  static async open (path, flags, mode) {
    if (flags === undefined) {
      flags = FileHandle.DEFAULT_OPEN_FLAGS
    }

    if (mode === undefined) {
      mode = FileHandle.DEFAULT_OPEN_MODE
    }

    const handle = new this({ path, flags, mode })

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

  constructor (opts) {
    super()

    // String | Buffer | URL | { toString(): String }
    if (opts?.path && typeof opts.path.toString === 'function') {
      opts.path = opts.path.toString()
    }

    this.flags = normalizeFlags(opts?.flags)
    this.path = opts?.path || null
    this.mode = opts?.mode || null
    // this id will be used to identify the file handle that is a reference
    // stored in a map container on the objective-c side of the bridge.
    this.id = opts.id || String(rand64())
    this.fd = opts.fd || null // internal file descriptor
  }

  async close () {
    await ipc.request('fsClose', { id: this.id })
    fds.release(this.id)
    this.fd = null
    this.emit('close')
  }

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
}

module.exports = {
  FileHandle
}
