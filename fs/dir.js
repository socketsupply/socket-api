'use strict'

import { Stats } from './stats'

/**
 * @TODO
 */
class Dir {
  /**
   * @TODO
   */
  constructor (options) {
    this.path = options?.path || null
  }

  /**
   * @TODO
   */
  async close (callback) {
  }

  /**
   * @TODO
   */
  async read (callback) {
  }

  /**
   * @TODO
   */
  [Symbol.asyncIterator] () {
  }
}

/**
 * @TODO
 */
class Dirent extends Stats {
  /**
   * @TODO
   */
  static from (stat, fromBigInt) {
    const stats = super.from(stat, fromBigInt)
    return new this({
      name: stat.name,
      ...stats
    })
  }

  /**
   * @TODO
   */
  constructor (options) {
    super(options)

    this.name = options?.name || null
  }
}

export {
  Dir,
  Dirent
}
