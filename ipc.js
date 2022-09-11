/**
 * @module IPC
 *
 * This is a low level API which you don't need unless you are implementing
 * a library on top of Socket SDK. A Socket SDK app has two or three processes.
 *
 * - The `Render` process, the UI where the HTML, CSS and JS is run.
 * - The `Bridge` process, the thin layer of code that managers everything.
 * - The `Main` processs, for apps that need to run heavier compute jobs. And
 *   unlike electron it's optional.
 *
 * The Bridge process manages the Render and Main process, it may also broker
 * data between them.
 *
 * The Binding process uses standard input and output as a way to communicate.
 * Data written to the write-end of the pipe is buffered by the OS until it is
 * read from the read-end of the pipe.
 *
 * The IPC protocol uses a simple URI-like scheme. Data is passed as ArrayBuffers.
 *
 * ```uri
 * ipc://command?key1=value1&key2=value2...
 * ```
 */

/* global window */
import {
  AbortError,
  InternalError,
  TimeoutError
} from './errors.js'

import { isBufferLike, isPlainObject, format } from './util.js'
import * as errors from './errors.js'
import { Buffer } from './buffer.js'

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
    err = new errors[type](error.message || '')
  } else {
    for (const E of Object.values(errors)) {
      if ((E.code && type === E.code) || (code && code === E.code)) {
        err = new E(error.message || '')
        break
      }
    }
  }

  if (!err) {
    err = new Error(error.message || '')
  }

  // assign extra data to `err` like an error `code`
  for (const key in error) {
    try {
      err[key] = error[key]
    } catch (_) {
      void _
    }
  }

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
 * @param {object=} [options]
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

debug.log = () => void 0

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
 * A container for a IPC message based on a `ipc://` URI scheme.
 */
export class Message extends URL {

  /**
   * The expected protocol for an IPC message.
   */
  static get PROTOCOL () {
    return 'ipc:'
  }

  /**
   * Creates a `Message` instance from a variety of input.
   * @param {string|URL|Message|Buffer|object} input
   * @param {(object|string|URLSearchParams)=} [params]
   * @return {Message}
   */
  static from (input, params) {
    const protocol = this.PROTOCOL

    if (isBufferLike(input)) {
      input = Buffer.from(input).toString()
    }

    if (input instanceof Message) {
      const message = new this(String(input))

      if (typeof params === 'object') {
        const entries = params.entris ? params.entries() : Object.entries(params)

        for (const [key, value] of entries) {
          message.set(key, value)
        }
      }

      return message
    } else if (isPlainObject(input)) {
      return new this(
        `${input.protocol || protocol}//${input.command}?${new URLSearchParams({ ...input.params, ...params })}`
      )
    }

    if (typeof input === 'string' && params) {
      return new this(`${protocol}//${input}?${new URLSearchParams(params)}`)
    }

    // coerce input into a string
    const string = String(input)

    if (string.startsWith(`${protocol}//`)) {
      return new this(string)
    }

    return new this(`${protocol}//${input}`)
  }

  /**
   * Predicate to determine if `input` is valid for constructing
   * a new `Message` instance.
   * @param {string|URL|Message|Buffer|object} input
   * @return {boolean}
   */
  static isValidInput (input) {
    const protocol = this.PROTOCOL
    const string = String(input)

    return (
      string.startsWith(`${protocol}//`) &&
      string.length > protocol.length + 2
    )
  }

  /**
   * `Message` class constructor.
   * @protected
   * @param {string|URL} input
   */
  constructor (input) {
    super(input)
    if (this.protocol !== this.constructor.PROTOCOL) {
      throw new TypeError(format(
        'Invalid protocol in input. Expected \'%s\' but got \'%s\'',
        this.constructor.PROTOCOL, this.protocol
      ))
    }
  }

  /**
   * Computed command for the IPC message.
   */
  get command () {
    return this.hostname || this.host || this.pathname.slice(2)
  }

  /**
   * Computed `id` value for the command.
   */
  get id () {
    return this.has('id') ? this.get('id') : null
  }

  /**
   * Computed `seq` (sequence) value for the command.
   */
  get seq () {
    return this.has('seq') ? this.get('seq') : null
  }

  /**
   * Computed message value potentially given in message parameters.
   * This value is automatically decoded, but not treated as JSON.
   */
  get value () {
    return this.has('value') ? this.get('value') : null
  }

  /**
   * Computed `index` value for the command potentially referring to
   * the window index the command is scoped to or originating from. If not
   * specified in the message parameters, then this value defaults to `-1`.
   */
  get index () {
    const index = this.get('index')

    if (index !== undefined) {
      const value = parseInt(index)
      if (Number.isFinite(value)) {
        return value
      }
    }

    return -1
  }

  /**
   * Computed value parsed as JSON. This value is `null` if the value is not present
   * or it is invalid JSON.
   */
  get json () {
    try {
      return JSON.parse(this.value)
    } catch (err) {
      void err
      return null
    }
  }

  /**
   * Computed readonly object of message parameters.
   */
  get params () {
    return Object.fromEntries(this.entries())
  }

  /**
   * Returns computed parameters as entries
   * @return {Array<Array<string,mixed>>}
   */
  entries () {
    return Array.from(this.searchParams.entries()).map(([ key, value ]) => {
      try {
        return [key, JSON.parse(value)]
      } catch (err) {
        void err
        return [key, value]
      }
    })
  }

  /**
   * Set a parameter `value` by `key`.
   * @param {string} key
   * @param {mixed} value
   */
  set (key, value) {
    if (value && typeof value === 'object') {
      value = JSON.stringify(value)
    }

    return this.searchParams.set(key, value)
  }

  /**
   * Get a parameter value by `key`.
   * @param {string} key
   * @param {mixed} defaultValue
   * @return {mixed}
   */
  get (key, defaultValue) {
    if (!this.has(key)) {
      return defaultValue
    }

    const value = this.searchParams.get(key)

    try {
      return JSON.parse(value)
    } catch (err) {
      void err
      return value
    }
  }

  /**
   * Delete a parameter by `key`.
   * @param {string} key
   * @return {boolean}
   */
  delete (key) {
    if (this.has(key)) {
      return this.searchParams.delete(key)
    }

    return false
  }

  /**
   * Computed parameter keys.
   * @return {Array<string>}
   */
  keys () {
    return Array.from(this.searchParams.keys())
  }

  /**
   * Computed parameter values.
   * @return {Array<mixed>}
   */
  values () {
    return Array.from(this.searchParams.values()).map((value) => {
      try {
        return JSON.parse(value)
      } catch (err) {
        void err
        return value
      }
    })
  }

  /**
   * Predicate to determine if parameter `key` is present in parameters.
   * @param {string} key
   * @return {boolean}
   */
  has (key) {
    return this.searchParams.has(key)
  }

  /**
   * Converts a `Message` instance into a plain JSON object.
   */
  toJSON () {
    const { protocol, command, params } = this
    return { protocol, command, params }
  }
}

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
   * @param {(object|Error|mixed)=} result
   * @param {?(Error)} [maybeError]
   * @param {?(string)} [maybeSource
   * @return {Result}
   */
  static from (result, maybeError, maybeSource, ...args) {
    if (result instanceof Result) {
      if (!result.source && maybeSource) {
        result.source = maybeSource
      }

      if (!result.err && maybeError) {
        result.err = maybeError
      }

      return result
    }

    if (result instanceof Error) {
      return this.from({ err: result }, maybeError, maybeSource, ...args)
    }

    const err = maybeMakeError(result?.err || maybeError || null, Result.from)
    const data = !err && result?.data !== null && result?.data !== undefined
      ? result.data
      : (!err ? result : null)
     const source = result?.source || maybeSource || null

    return new this(data, err, source, ...args)
  }

  /**
   * `Result` class constructor.
   * @private
   * @param {?(object)} data
   * @param {?(Error)} err
   * @param {?(string)} source
   */
  constructor (data, err, source) {
    this.data = typeof data !== 'undefined' ? data : null
    this.err = typeof err !== 'undefined' ? err : null
    this.source = typeof source === 'string' && source.length
      ? source
      : undefined

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

    Object.defineProperty(this, 2, {
      get: () => this.source,
      enumerable: false,
      configurable: false
    })
  }

  /**
   * Computed result length.
   */
  get length () {
    const { data, err, source } = this
    return [data, err, source].filter((v) => v !== undefined).length
  }

  /**
   * Generator for an `Iterable` interface over this instance.
   */
  *[Symbol.iterator]() {
    yield this.data
    yield this.err
    yield this.source
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
 * @param {(object|string)=} params
 * @return {Result}
 */
export function sendSync (command, params) {
  if (typeof window === 'undefined') {
    if (debug.enabled) {
      debug.log('Global window object is not defined')
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
    debug.log('ipc.sendSync: %s', uri + query)
  }

  request.open('GET', uri + query, false)
  request.send()

  let response = request.response || request.responseText
  let result = null

  if (!response) {
    if (
      request.status === 404 ||
      (request.readyState === XMLHttpRequest.DONE && request.status === 0)
    ) {
      result = Result.from({
        err: {
          url: uri + query,
          code: 'NOT_FOUND_ERR',
          type: 'NotFoundError',
          message: request.statusText || 'Not found'
        }
      })
    }
  }

  if (!response && request.statusText) {
    response = JSON.stringify({ data: { status: request.statusText } })
  }

  if (!result && typeof response === 'string') {
    try {
      result = Result.from(JSON.parse(response))
    } catch (err) {
      if (debug.enabled) {
        debug.log('ipc.sendSync (error):', err.message || err)
      }
    }
  }

  if (!result) {
    result = Result.from(response)
  }

  if (!result.source) {
    result.source = command
  }

  debug.log('ipc.sendSync: (resolved)', command, result)
  return result
}

/**
 * Emit event to be dispatched on `window` object.
 * @param {string} name
 * @param {..Mixed} ...args
 */
export async function emit (name, ...args) {
  await ready()

  if (debug.enabled) {
    debug.log('ipc.emit:', name, ...args)
  }

  return await window._ipc.emit(name, ...args)
}

/**
 * Resolves a request by `seq` with possible value.
 * @param {string} seq
 * @param {..Mixed} ...args
 */
export async function resolve (seq, ...args) {
  await ready()

  if (debug.enabled) {
    debug.log('ipc.resolve:', seq, ...args)
  }

  return await window._ipc.resolve(seq, ...args)
}

/**
 * Sends an async IPC command request with parameters.
 * @param {string} command
 * @param {..Mixed} ...args
 */
export async function send (command, ...args) {
  await ready()

  if (debug.enabled) {
    debug.log('ipc.send:', command, ...args)
  }

  const response = await window._ipc.send(command, ...args)
  const result = Result.from(response)

  if (debug.enabled) {
    debug.log('ipc.send: (resolved)', command, result)
  }

  if (!result.source) {
    result.source = command
  }

  return result
}

/**
 * Sends an async IPC command request with parameters and buffered bytes.
 * @param {string} command
 * @param {?(object)} params
 * @param {?(Buffer|TypeArray|ArrayBuffer|string|Array)} buffer
 * @param {?(object)} options
 */
export async function write (command, params, buffer, options) {
  if (typeof window === 'undefined') {
    debug.log('Global window object is not defined')
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
      return Result.from(null, new AbortError(signal), command)
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
  await request.send(buffer || null)

  if (debug.enabled) {
    debug.log('ipc.write:', uri + query, buffer || null)
  }

  return await new Promise((resolve) => {
    if (options?.timeout) {
      timeout = setTimeout(() => {
        resolve(Result.from(null, new TimeoutError('ipc.write timedout'), command))
        request.abort()
      }, typeof options.timeout === 'number' ? options.timeout : TIMEOUT)
    }

    request.onabort = () => {
      aborted = true
      if (options?.timeout) {
        clearTimeout(timeout)
      }
      resolve(Result.from(null, new AbortError(signal), command))
    }

    request.onreadystatechange = () => {
      if (aborted) {
        return
      }

      if (request.readyState === window.XMLHttpRequest.DONE) {
        resolved = true
        clearTimeout(timeout)

        const response = request.response ?? request.responseText ?? 'null'
        let data = response
        try {
          data = JSON.parse(response)
        } catch (err) {
          if (debug.enabled) {
            debug.log('ipc.write (error):', err.message || err)
          }
        }

        const result = Result.from(data)

        if (debug.enabled) {
          debug.log('ipc.write: (resolved)', command, result)
        }

        if (!result.source) {
          result.source = command
        }

        return resolve(data)
      }
    }

    request.onerror = () => {
      resolved = true
      clearTimeout(timeout)
      resolve(Result.from(null, new Error(request.responseText), command))
    }
  })
}

/**
 * Sends an async IPC command request with parameters requesting a response
 * with buffered bytes.
 * @param {string} command
 * @param {?(object)} params
 * @param {?(object)} options
 */
export async function request (command, params, options) {
  await ready()

  const signal = options?.signal
  params = { ...params }

  for (const key in params) {
    if (params[key] === undefined) {
      delete params[key]
    }
  }

  if (debug.enabled) {
    debug.log('ipc.request:', command, params)
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
      debug.log('ipc.request: (resolved)', command, result)
    }

    if (!result.source) {
      result.source = command
    }

    return result
  })

  const onabort = () => {
    aborted = true
    cleanup()
    resolve(seq, ERROR, {
      source: command,
      err: new TimeoutError('ipc.request  timedout')
    })
  }

  if (signal) {
    if (signal.aborted) {
      return Result.from(null, new AbortError(signal), command)
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
 * @param {(function|object)=} ctx
 * @param {string=} [ctx.default]
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
