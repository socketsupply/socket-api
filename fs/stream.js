'use strict'

const { Readable, Writable } = require('../stream')

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

    this.path = options?.path || null
    this.pending = false
    this.bytesRead = 0
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

    this.path = options?.path || null
    this.pending = false
    this.bytesWritten = 0
  }
}

module.exports = {
  ReadStream,
  WriteStream
}
