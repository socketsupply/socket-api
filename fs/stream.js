import { Readable, Writable } from '../stream.js'
import { Buffer } from 'buffer'

export const DEFAULT_HIGH_WATER_MARK = 16 * 1024

/**
 * A `Readable` stream for a `FileHandle`.
 */
export class ReadStream extends Readable {
  /**
   * `ReadStream` class constructor
   * @private
   */
  constructor (options) {
    super(options)

    if (typeof options?.highWaterMark !== 'number') {
      this._readableState.highWaterMark = this.constructor.highWaterMark
    }

    this.end = typeof options?.end === 'number' ? options.end : Infinity
    this.start = typeof options?.start === 'number' ? options.start : 0
    this.handle = null
    this.buffer = Buffer.alloc(this._readableState.highWaterMark)
    this.bytesRead = 0
    this.shouldEmitClose = options?.emitClose !== false

    if (this.start < 0) {
      this.start = 0
    }

    if (this.end < 0) {
      this.end = Infinity
    }

    if (options?.handle) {
      this.setHandle(options.handle)
    }
  }

  /**
   * Sets file handle for the ReadStream.
   * @param {FileHandle} handle
   */
  setHandle (handle) {
    setHandle(this, handle)
  }

  /**
   * Relative or absolute path of the underlying `FileHandle`.
   */
  get path () {
    return this.handle?.path || null
  }

  /**
   * `true` if the stream is in a pending state.
   */
  get pending () {
    return this.handle?.opened !== true
  }

  /**
   * Handles `shouldEmitClose` setting from `options.emitClose` in constructor.
   * @protected
   */
  emit (event, ...args) {
    if (event === 'close' && this.shouldEmitClose === false) {
      return false
    }

    return super.emit(event, ...args)
  }

  async _open (callback) {
    if (!this.handle) {
      return callback(new Error('Handle not set in ReadStream'))
    }

    if (this.handle?.opened) {
      return callback(null)
    }

    this.once('ready', () => callback(null))

    // open if not opening already
    if (!this.handle.opening) {
      try {
        await this.handle.open()
      } catch (err) {
        return callback(err)
      }
    }
  }

  async _read (callback) {
    const { buffer, handle } = this

    if (!handle || !handle.opened) {
      return callback(new Error('File handle not opened'))
    }

    buffer.fill(0)

    const position = Math.max(0, this.start) + this.bytesRead
    const length = Math.max(0, this.end) < Infinity
      ? Math.min(this.end - position, buffer.length)
      : buffer.length

    try {
      const result = await handle.read(buffer, 0, length, position)

      if (typeof result.bytesRead === 'number' && result.bytesRead > 0) {
        this.bytesRead += result.bytesRead
        this.push(buffer.slice(0, result.bytesRead))

        if (this.bytesRead >= this.end) {
          this.push(null)
        }
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
 * A `Writable` stream for a `FileHandle`.
 */
export class WriteStream extends Writable {
  /**
   * `WriteStream` class constructor
   * @private
   */
  constructor (options) {
    super(options)

    if (typeof options?.highWaterMark !== 'number') {
      this._writableState.highWaterMark = this.constructor.highWaterMark
    }

    this.start = typeof options?.start === 'number' ? options.start : 0
    this.handle = null
    this.bytesWritten = 0
    this.shouldEmitClose = options?.emitClose !== false

    if (this.start < 0) {
      this.start = 0
    }

    if (options?.handle) {
      this.setHandle(options.handle)
    }
  }

  /**
   * Sets file handle for the WriteStream.
   * @param {FileHandle} handle
   */
  setHandle (handle) {
    setHandle(this, handle)
  }

  /**
   * Relative or absolute path of the underlying `FileHandle`.
   */
  get path () {
    return this.handle?.path || null
  }

  /**
   * `true` if the stream is in a pending state.
   */
  get pending () {
    return this.handle?.opened !== true
  }

  async _open (callback) {
    if (!this.handle) {
      return callback(new Error('Handle not set in WriteStream'))
    }

    if (this.handle?.opened) {
      return callback(null)
    }

    this.once('ready', () => callback(null))

    // open if not opening already
    if (!this.handle.opening) {
      try {
        await this.handle.open()
      } catch (err) {
        return callback(err)
      }
    }
  }

  /**
   * Handles `shouldEmitClose` setting from `options.emitClose` in constructor.
   * @protected
   */
  emit (event, ...args) {
    if (event === 'close' && this.shouldEmitClose === false) {
      return false
    }

    return super.emit(event, ...args)
  }

  async _write (buffer, callback) {
    const { handle } = this

    if (!handle || !handle.opened) {
      return callback(new Error('File handle not opened'))
    }

    try {
      const position = this.start + this.bytesWritten
      const result = await handle.write(buffer, 0, buffer.length, position)

      if (typeof result.bytesWritten === 'number' && result.bytesWritten > 0) {
        this.bytesWritten += result.bytesWritten

        if (result.bytesWritten !== buffer.length) {
          return await this._write(buffer.slice(result.bytesWritten), callback)
        }
      }
    } catch (err) {
      return callback(err)
    }

    callback(null)
  }
}

function setHandle (stream, handle) {
  if (!handle) return

  if (stream.handle) {
    throw new Error('Stream handle already set.')
  }

  stream.handle = handle

  if (handle.opened) {
    queueMicrotask(() => stream.emit('ready'))
  } else {
    handle.once('open', (fd) => {
      if (stream.handle === handle) {
        stream.emit('open', fd)
        stream.emit('ready')
      }
    })
  }

  stream.once('ready', () => {
    handle.once('close', () => {
      stream.emit('close')
    })
  })
}

ReadStream.highWaterMark = DEFAULT_HIGH_WATER_MARK
WriteStream.highWaterMark = DEFAULT_HIGH_WATER_MARK
