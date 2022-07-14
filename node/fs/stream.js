'use strict'

const { Readable, Writable } = require('../stream')
const { Buffer } = require('../buffer')

function setHandle (stream, handle) {
  if (!handle) return

  stream.handle = handle

  if (handle.opened) {
    queueMicrotask(() => stream.emit('ready'))
  } else {
    handle.once('open', (fd) => {
      stream.emit('open', fd)
      stream.emit('ready')
    })
  }

  stream.once('ready', () => {
    handle.once('close', () => stream.emit('close'))
  })
}

/**
 * @TODO
 */
class ReadStream extends Readable {
  /**
   * `ReadStream` class constructor
   * @private
   */
  constructor (options) {
    super(options)

    this.handle = null
    this.buffer = Buffer.alloc(this._readableState.highWaterMark)
    this.bytesRead = 0

    if (options?.handle) {
      this.setHandle(options.handle)
    }
  }

  /**
   * @TODO
   */
  setHandle (handle) {
    setHandle(this, handle)
  }

  /**
   * @TODO
   */
  get path () {
    return this.handle?.path || null
  }

  get pending () {
    return Boolean(this.handle?.opened)
  }

  _open (callback) {
    if (this.handle?.opened) {
      return callback(null)
    }

    this.once('ready', () => callback())
  }

  async _read (callback) {
    if (!this.handle || !this.handle.opened) {
      return callback(new Error('File handle not opened'))
    }

    const { buffer, handle, bytesRead } = this

    buffer.fill(0)

    try {
      const result = await handle.read(buffer, 0, buffer.length, bytesRead)

      if (result.bytesRead > 0) {
        this.bytesRead += result.bytesRead
        this.push(buffer.slice(0, result.bytesRead))
      } else {
        this.push(null)
      }
    } catch (err) {
      return callback(err)
    }

    callback(null)
  }
}

/**
 * @TODO
 */
class WriteStream extends Writable {
  /**
   * `WriteStream` class constructor
   * @private
   */
  constructor (options) {
    super(options)

    this.pending = false
    this.bytesWritten = 0

    if (options?.handle) {
      this.setHandle(options.handle)
    }
  }

  /**
   * @TODO
   */
  setHandle (handle) {
    setHandle(this, handle)
  }

  /**
   * @TODO
   */
  get path () {
    return this.handle?.path || null
  }

  /**
   * @TODO
   */
  get pending () {
    return Boolean(this.handle?.opened)
  }

  _open (callback) {
    if (this.handle?.opened) {
      return callback(null)
    }

    this.once('ready', () => callback())
  }

  _write (callback) {
    callback(null)
  }
}

module.exports = {
  ReadStream,
  WriteStream
}
