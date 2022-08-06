/* global window */

/*
 * @module IPC
 *
 * There are three important concepts for an application built with the Socket
 * SDK. The `Render` process, the `Main` process, and the `Bridge` process.
 *
 * `IPC` is an acronym for Inter Process Communication. It's the method for
 * which these [processes][processes] work together.
 *
 * The Bridge process handles communication between the Render and Main
 * processes. For Desktop apps, the Render process is the user interface, and
 * the Main process, which is optional, is strictly for computing and IO.
 *
 * When an applicaiton starts, the Bridge process will spawn a child process
 * if one is specified.
 *
 * The Binding process uses standard input and output as a way to communicate.
 * Data written to the write-end of the pipe is buffered by the OS until it is
 * read from the read-end of the pipe.
 *
 * The IPC protocol uses a simple URI-like scheme.
 *
 * ```uri
 * ipc://command?key1=value1&key2=value2...
 * ```
 *
 * The query is encoded with `encodeURIComponent`.
 *
 * Here is a reference [implementation][0] if you would like to use a language
 * that does not yet have one.
 */

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
    IndexSizeError: getErrorClass('IndexSizeError'),
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
    for (const E of Object.values(errors)) {
      if ((E.code && type === E.code) || (code && code === E.code)) {
        err = new E(error.message || '', error)
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

/**
 * Symbol for the `ipc.debug.enabled` property
 */
export const kDebugEnabled = Symbol.for('ipc.debug.enabled')

/**
 * Parses `seq` as integer value
 * @param {string|number} seq
 * @param {?(object)} [options]
 * @param {boolean} [options.bigint = false]
 */
export function parseSeq (seq, options) {
  const value = String(seq).replace(/^R/i, '').replace(/n$/, '')
  return options?.bigint === true ? BigInt(value) : parseInt(value)
}

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
      return typeof window === 'undefined'
        ? false
        : Boolean(window.process?.debug)
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
      : result?.err ? null : result

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
      get: () => this.data,
      enumerable: false,
      configurable: false
    })

    Object.defineProperty(this, 1, {
      get: () => this.err,
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
  params.set('seq', 'R' + seq)

  const query = `?${params}`

  if (debug.enabled) {
    console.debug('io.ipc.sendSync: %s', uri + query)
  }

  request.open('GET', uri + query, false)
  request.send()

  const response = request.response || request.responseText

  try {
    return Result.from(JSON.parse(response))
  } catch (err) {
    if (debug.enabled) {
      console.warn('ipc.sendSync: error:', err.message || err)
    }
  }

  return Result.from(response)
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

export async function send (command, ...args) {
  await ready()

  if (debug.enabled) {
    console.debug('io.ipc.send:', command, ...args)
  }

  const response = await window._ipc.send(command, ...args)
  const result = Result.from(response)

  if (debug.enabled) {
    console.debug('io.ipc.send: (resolved)', command, result)
  }

  return result
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
  params.set('seq', 'R' + seq)

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
  const resolved = promise.then((response) => {
    cleanup()

    let result = response

    if (result?.data instanceof ArrayBuffer) {
      result = Result.from(new Uint8Array(result.data))
    } else {
      result = Result.from(result)
    }

    if (debug.enabled) {
      console.debug('io.ipc.request: (resolved)', command, result)
    }

    return result
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
      if (parseSeq(params.seq) === parseSeq(seq)) {
        cleanup()
        resolve(seq, OK, { data })
      }
    }
  }
}

/**
 * Factory for creating a proxy based IPC API.
 * @param {string} domain
 * @param {?(function|object)} ctx
 * @param {?(string)} [ctx.default]
 * @return {Proxy}
 */
export function createBinding (domain, ctx) {
  const dispatchable = {
    emit,
    ready,
    resolve,
    request,
    send,
    sendSync,
    write
  }

  if (domain && typeof domain === 'object') {
    ctx = domain
    domain = null
  }

  if (typeof ctx !== 'function') {
    ctx = Object.assign(function () {}, ctx)
  }

  const proxy = new Proxy(ctx, {
    apply (target, bound, args) {
      const chain = [...target.chain]
      const domain = chain.shift()
      const path = chain.join('.')

      target.chain = new Set()

      const method = (ctx[path]?.method || ctx[path]) || ctx.default || 'send'
      return dispatchable[method](path, ...args)
    },

    get (target, key, receiver) {
      if (key === '__proto__') return null
      (ctx.chain ||= new Set()).add(key)
      return new Proxy(ctx, this)
    }
  })

  if (typeof domain === 'string') {
    return proxy[domain]
  }

  return domain
}

export default {
  OK,
  ERROR,
  TIMEOUT,

  createBinding,
  debug,
  emit,
  ready,
  resolve,
  request,
  send,
  sendSync,
  write
}
