export const ABORT_ERR = 20
export const TIMEOUT_ERR = 23

/**
 * An `AbortError` is an error type thrown in an `onabort()` level 0
 * event handler on an `AbortSignal` instance.
 */
export class AbortError extends Error {
  /**
   * The code given to an `ABORT_ERR` `DOMException`
   * @see {https://developer.mozilla.org/en-US/docs/Web/API/DOMException}
   */
  static get code () { return ABORT_ERR }

  /**
   * `AbortError` class constructor.
   * @param {AbortSignal|string} reasonOrSignal
   * @param {?(AbortSignal)} [signal]
   * @param {?(number)} [code]
   */
  constructor (reason, signal, code) {
    if (reason?.reason) {
      signal = reason
      reason = signal.reason
    }

    super(reason || signal?.reason || 'The operation was aborted')

    this.name = 'AbortError'
    this.code = 'ABORT_ERR'
    this.signal = signal || null

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, AbortError)
    }
  }
}

/**
 * An `TimeoutError` is an error type thrown when an operation timesout.
 */
export class TimeoutError extends Error {
  /**
   * The code given to an `TIMEOUT_ERR` `DOMException`
   * @see {https://developer.mozilla.org/en-US/docs/Web/API/DOMException}
   */
  static get code () { return TIMEOUT_ERR }

  /**
   * `TimeoutError` class constructor.
   * @param {string} message
   * @param {?(number)} [code]
   */
  constructor (message, code, ...args) {
    super(message, ...args)

    this.name = 'TimeoutError'
    this.code = 'TIMEOUT_ERR'
    this.signal = signal || null

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, TimeoutError)
    }
  }
}

/**
 * An `InternalError`  is an error type thrown when an internal exception
 * has occurred, such as in the native IPC layer.
 */
export class InternalError extends Error {

  /**
   * `InternalError` class constructor.
   * @param {string} message
   * @param {number} [code]
   */
  constructor (message, code) {
    super(message, code)

    this.name = 'InternalError'

    if (code) {
      this.code = code
    }

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InternalError)
    }
  }
}
