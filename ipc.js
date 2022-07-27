/* global window */

import {
  AbortError,
  InternalError,
  TimeoutError
} from './errors.js'

import * as errors from './errors.js'

function getErrorClass (type, fallback) {
  if (typeof window !== 'undefined' && typeof window[type] === 'function') {
    return window[type]
  }

  if (typeof errors[type] === 'function') {
    return errors[type]
  }

  return fallback || Error
}

function maybeMakeError (error, caller) {
  const errors = {
    AbortError: getErrorClass('AbortError'),
    AggregateError: getErrorClass('AggregateError'),
    EncodingError: getErrorClass('EncodingError'),
    InternalError: getErrorClass('IndexSizeError'),
    InternalError: InternalError,
    InvalidAccessError: getErrorClass('InvalidAccessError'),
    NetworkError: getErrorClass('NetworkError'),
    NotAllowedError: getErrorClass('NotAllowedError'),
    NotFoundError: getErrorClass('NotFoundError'),
    NotSupportedError: getErrorClass('NotSupportedError'),
    OperationError: getErrorClass('OperationError'),
    RangeError: getErrorClass('RangeError'),
    TimeoutError: TimeoutError,
    TypeError: getErrorClass('TypeError'),
    URIError: getErrorClass('URIError')
  }

  if (!error) {
    return null
  }

  if (error instanceof Error) {
    return error
  }

  error = { ...error }
  const type = error.type || 'Error'
  const code = error.code
  let err = null

  delete error.type

  if (type in errors) {
    err = new errors[type](error.message || '', error)
  } else {
    for (const E of errors) {
      if (type === E.code || code === E.code) {
        err = new errors[type](error.message || '', error)
      }
    }
  }

  if (!err) {
    err = new Error(error.message || '', error)
  }

  // assign extra data to `err` like an error `code`
  Object.assign(err, error)

  if (
    typeof Error.captureStackTrace === 'function' &&
    typeof caller === 'function'
  ) {
    Error.captureStackTrace(err, caller)
  }

  return err
}

/**
 * Represents an OK IPC status.
 */
export const OK = 0

/**
 * Represents an ERROR IPC status.
 */
export const ERROR = 1

/**
 * Timeout in milliseconds for IPC requests.
 */
export const TIMEOUT = 32 * 1000

const kDebugEnabled = Symbol.for('ipc.debug.enabled')

/**
 * If `debug.enabled === true`, then debug output will be printed to console.
 * @param {(boolean)} [enable]
 * @return {boolean}
 */
export function debug (enable) {
  if (enable === true) {
    debug.enabled = true
  } else if (enable === false) {
    debug.enabled = false
  }

  return debug.enabled
}

Object.defineProperty(debug, 'enabled', {
  enumerable: false,
  set (value) {
    debug[kDebugEnabled] = Boolean(value)
  },
  get () {
    if (debug[kDebugEnabled] === undefined) {
      return typeof window === 'undefined' ? false : Boolean(window.process?.debug)
    }

    return debug[kDebugEnabled]
  }
})

/**
 * A result type used internally for handling
 * IPC result values from the native layer that are in the form
 * of `{ err?, data? }`. The `data` and `err` properties on this
 * type of object are in tuple form and be accessed at `[data?,err?]`
 */
export class Result {

  /**
   * Creates a `Result` instance from input that may be an object
   * like `{ err?, data? }`, an `Error` instance, or just `data`.
   * @param {?(object|Error|mixed)} result
   * @return {Result}
   */
  static from (result) {
    if (result instanceof Result) {
      return result
    }

    if (result instanceof Error) {
      return new this(null, result)
    }

    const err = maybeMakeError(result?.err, Result.from)
    const data = result?.data !== null && result?.data !== undefined
      ? result.data
      : result

    return new this(data, err)
  }

  /**
   * `Result` class constructor.
   * @private
   * @param {?(object)} data
   * @param {?(Error)} err
   */
  constructor (data, err) {
    this.data = data || null
    this.err = err || null

    Object.defineProperty(this, 0, {
      value: data,
      enumerable: false,
      configurable: false
    })

    Object.defineProperty(this, 1, {
      value: err,
      enumerable: false,
      configurable: false
    })
  }

  get length () {
    if (this.data !== null && this.err !== null) {
      return 2
    }
  }

  *[Symbol.iterator]() {
    yield this.data
    yield this.err
  }
}

/**
 * Waits for the native IPC layer to be ready and exposed on the
 * global window object.
 */
export async function ready () {
  await new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new TypeError('Global window object is not defined.'))
    }

    return loop()

    function loop () {
      if (window._ipc) {
        return resolve()
      }

      queueMicrotask(loop)
    }
  })
}

/**
 * Sends a synchronous IPC command over XHR returning a `Result`
 * upon success or error.
 * @param {string} command
 * @param {?(object|string)} params
 * @return {Result}
 */
export function sendSync (command, params) {
  if (typeof window === 'undefined') {
    if (debug.enabled) {
      console.debug('Global window object is not defined')
    }

    return {}
  }

  const request = new window.XMLHttpRequest()
  const index = window.process ? window.process.index : 0
  const seq = window._ipc ? window._ipc.nextSeq++ : 0
  const uri = `ipc://${command}`

  params = new URLSearchParams(params)
  params.set('index', index)
  params.set('seq', seq)

  const query = `?${params}`

  if (debug.enabled) {
    console.debug('io.ipc.sendSync: %s', uri + query)
  }

  request.open('GET', uri + query, false)
  request.send(null)

  try {
    return Result.from(JSON.parse(request.response))
  } catch (err) {
    if (debug.enabled) {
      console.warn(err.message || err)
    }
  }

  return Result.from(request.response)
}

export async function emit (...args) {
  await ready()

  if (debug.enabled) {
    console.debug('io.ipc.emit:', ...args)
  }

  return await window._ipc.emit(...args)
}

export async function resolve (...args) {
  await ready()

  if (debug.enabled) {
    console.debug('io.ipc.resolve:', ...args)
  }

  return await window._ipc.resolve(...args)
}

export async function send (...args) {
  await ready()

  if (debug.enabled) {
    console.debug('io.ipc.send:', ...args)
  }

  return await window._ipc.send(...args)
}

export async function write (command, params, buffer, options) {
  if (typeof window === 'undefined') {
    console.warn('Global window object is not defined')
    return {}
  }

  const signal = options?.signal
  const request = new window.XMLHttpRequest()
  const index = window.process ? window.process.index : 0
  const seq = window._ipc ? window._ipc.nextSeq++ : 0
  const uri = `ipc://${command}`

  let resolved = false
  let aborted = false
  let timeout = null

  if (signal) {
    if (signal.aborted) {
      return Result.from(new AbortError(signal))
    }

    signal.addEventListener('abort', () => {
      if (!aborted && !resolved) {
        aborted = true
        request.abort()
      }
    })
  }

  params = new URLSearchParams(params)
  params.set('index', index)
  params.set('seq', seq)

  const query = `?${params}`

  request.open('PUT', uri + query, true)
  request.send(buffer || null)

  if (debug.enabled) {
    console.debug('io.ipc.write:', uri + query, buffer || null)
  }

  return await new Promise((resolve) => {
    if (options?.timeout) {
      timeout = setTimeout(() => {
        resolve(Result.from(new TimeoutError('ipc.write timedout')))
        request.abort()
      }, typeof options.timeout === 'number' ? options.timeout : TIMEOUT)
    }

    request.onabort = () => {
      aborted = true
      if (options?.timeout) {
        clearTimeout(timeout)
      }
      resolve(Result.from(new AbortError(signal)))
    }

    request.onreadystatechange = () => {
      if (aborted) {
        return
      }

      if (request.readyState === window.XMLHttpRequest.DONE) {
        resolved = true
        clearTimeout(timeout)

        let data = request.response
        try {
          data = JSON.parse(request.response)
        } catch (err) {
          if (debug.enabled) {
            console.warn(err.message || err)
          }
        }

        const result = Result.from(data)

        if (debug.enabled) {
          console.debug('io.ipc.write: (resolved)', command, result)
        }

        return resolve(data)
      }
    }

    request.onerror = () => {
      resolved = true
      clearTimeout(timeout)
      resolve(Result.from(new Error(request.responseText)))
    }
  })
}

export async function request (command, data, options) {
  await ready()

  const signal = options?.signal
  const params = { ...data }

  for (const key in params) {
    if (params[key] === undefined) {
      delete params[key]
    }
  }

  if (debug.enabled) {
    console.debug('io.ipc.request:', command, data)
  }

  let aborted = false
  let timeout = null

  const parent = typeof window === 'object' ? window : globalThis
  const promise = parent._ipc.send(command, params)

  const { seq, index } = promise
  const resolved = promise.then((result) => {
    cleanup()

    if (debug.enabled) {
      console.debug('io.ipc.request: (resolved)', command, result)
    }

    if (result?.data instanceof ArrayBuffer) {
      return Result.from(new Uint8Array(result.data))
    }

    return Result.from(result)
  })

  const onabort = () => {
    aborted = true
    cleanup()
    resolve(seq, ERROR, {
      err: new TimeoutError('ipc.request  timedout')
    })
  }

  if (signal) {
    if (signal.aborted) {
      return Result.from(new AbortError(signal))
    }

    signal.addEventListener('abort', onabort)
  }

  if (options?.timeout !== false) {
    timeout = setTimeout(
      onabort,
      typeof options?.timeout === 'number' ? options.timeout : TIMEOUT
    )
  }

  // handle async resolution from IPC over XHR
  parent.addEventListener('data', ondata)

  return Object.assign(resolved, { seq, index })

  function cleanup () {
    window.removeEventListener('data', ondata)

    if (timeout) {
      clearTimeout(timeout)
    }
  }

  function ondata (event) {
    if (aborted) {
      cleanup()

      return resolve(seq, ERROR, {
        err: new AbortError(signal)
      })
    }

    if (event.detail?.data) {
      const { data, params } = event.detail
      if (parseInt(params.seq) === parseInt(seq)) {
        cleanup()
        resolve(seq, OK, { data })
      }
    }
  }
}
