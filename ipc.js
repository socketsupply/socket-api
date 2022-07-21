/* global window */

void ready()

export const OK = 0
export const ERROR = 1

export let debug = null

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
    if (result instanceof Error) {
      return new this(null, result)
    }

    return new this(
      result?.data || result || null,
      result?.err ? new Error(result.err.message) :  null
    )
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

    this[0] = this.data
    this[1] = this.err
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

  if (debug === null) {
    debug = Boolean(
      typeof window === 'undefined' ? false : window.process?.debug
    )
  }
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
    if (debug) {
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

  if (debug) {
    console.debug('io: ipc.sendSync: %s', uri + query)
  }

  request.open('GET', uri + query, false)
  request.send(null)

  try {
    return Result.from(JSON.parse(request.response))
  } catch (err) {
    if (debug) {
      console.warn(err.message || err)
    }
  }

  return Result.from(request.response)
}

export async function emit (...args) {
  await ready()

  if (debug) {
    console.debug('io: ipc.emit:', ...args)
  }

  return await window._ipc.emit(...args)
}

export async function resolve (...args) {
  await ready()

  if (debug) {
    console.debug('io: ipc.resolve:', ...args)
  }

  return await window._ipc.resolve(...args)
}

export async function send (...args) {
  await ready()

  if (debug) {
    console.debug('io: ipc.send:', ...args)
  }

  return await window._ipc.send(...args)
}

export async function write (command, params, buffer) {
  if (typeof window === 'undefined') {
    console.warn('Global window object is not defined')
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

  if (debug) {
    console.debug('io: ipc.write:', uri + query, buffer || null)
  }

  request.open('PUT', uri + query, true)
  request.send(buffer || null)

  return await new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      if (request.readyState === window.XMLHttpRequest.DONE) {
        try {
          return resolve(Result.from(JSON.parse(request.response)))
        } catch (err) {
          if (debug) {
            console.warn(err.message || err)
          }
        }

        resolve(Result.from(request.response))
      }
    }

    request.onerror = () => {
      resolve(Result.from(new Error(request.responseText)))
    }
  })
}

export async function request (command, data) {
  await ready()

  const params = { ...data }

  for (const key in params) {
    if (params[key] === undefined) {
      delete params[key]
    }
  }

  if (debug) {
    console.debug('io: ipc.request:', command, data)
  }

  const parent = typeof window === 'object' ? window : globalThis
  const promise = parent._ipc.send(command, params)

  const { seq, index } = promise
  const resolved = promise.then((result) => {
    if (result?.data instanceof ArrayBuffer) {
      return Result.from(new Uint8Array(result.data))
    }

    return Result.from(result)
  })

  // handle async resolution from IPC over XHR
  parent.addEventListener('data', ondata)

  return Object.assign(resolved, { seq, index })

  function ondata (event) {
    if (event.detail?.data) {
      const { data, params } = event.detail
      if (parseInt(params.seq) === parseInt(seq)) {
        window.removeEventListener('data', ondata)
        resolve(seq, OK, { data })
      }
    }
  }
}
