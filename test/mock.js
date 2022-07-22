import { EventEmitter } from 'node:events'
import { webcrypto } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'

Object.assign(globalThis, {
  crypto: webcrypto
})

export const methods = {}

const CustomEventDispatched = Symbol.for('CustomEvent.dispatched')

class XMLHttpRequest {
  static get UNSENT () { return 0 }
  static get OPENED () { return 1 }
  static get HEADERS_RECEIVED () { return 2 }
  static get LOADING () { return 3 }
  static get DONE () { return 4 }

  constructor () {
    this.aborted = false
    this.response = null
    this.responseText = null
    this.readyState = XMLHttpRequest.UNSENT
  }

  abort () {
    this.aborted = true
    if (typeof this.onabort === 'function') {
      this.onabort(new Event('abort'))
    }
  }

  open (method, url, isAsync) {
    if (this.aborted) {
      return
    }

    this.url = url
    this.method = method
    this.isAsync = isAsync
    this.readyState = XMLHttpRequest.OPENED
  }

  send (value) {
    if (this.aborted) {
      return
    }

    const { host: name } = new URL(this.url)
    let mock

    console.log('call XHR mock:', name, value)

    if (methods[name] && methods[name].length) {
      if (Array.isArray(methods[name])) {
        mock = methods[name].shift()

        if (methods[name].length === 0) {
          delete methods[name]
        }
      } else {
        mock = methods[name]
      }
    }

    return send(this)

    function updateReadyState (request, value) {
      if (request.aborted) {
        return
      }

      if (typeof request.onreadystatechange === 'function') {
        request.readyState = value
        request.onreadystatechange(new Event('readystatechange'))
      }
    }

    function send (request) {
      if (!request.isAsync) {
        return done(request)
      }

      process.nextTick(() => {
        updateReadyState(request, XMLHttpRequest.HEADERS_RECEIVED)
      })

      process.nextTick(() => {
        updateReadyState(request, XMLHttpRequest.LOADING)
      })

      process.nextTick(() => {
        done(request)
      })
    }

    function done (request) {
      const response = typeof mock === 'function' ? mock(value) : null

      request.response = response

      if (typeof response === 'string') {
        request.responseText = response
      } else {
        request.responseText = JSON.stringify(response)
      }

      updateReadyState(request, XMLHttpRequest.DONE)
    }
  }
}

class Event {
  constructor (type, options) {
    if (this.constructor === Event) {
      throw new TypeError('Illegal constructor')
    }

    this.type = type.toLowerCase()
    this.bubbles = options?.bubbles || false
    this.composed = options?.composed || false
    this.cancelable = options?.cancelable || false
  }
}

class CustomEvent extends Event {
  constructor (type, options) {
    super(type, options)
    this.detail = options?.detail !== undefined ? options.detail : null
    this[CustomEventDispatched] = false
  }

  initCustomEvent (type, bubbles, cancelable, detail) {
    this.type = type
    this.detail = detail !== undefined ? detail : null
    this.bubbles = bubbles || false
    this.cancelable = cancelable || false
  }
}

global.window = Object.assign(new EventEmitter(), {
  XMLHttpRequest,
  CustomEvent,
  Event,
  crypto: webcrypto,

  addEventListener (event, fn, opts) {
    if (opts?.once) {
      this.once(event.toLowerCase(), fn)
    } else {
      this.on(event.toLowerCase(), fn)
    }
  },

  removeEventListener (event, fn) {
    this.off(event.toLowerCase(), fn)
  },

  dispatchEvent (event) {
    this.emit(event.type.toLowerCase(), event)
  },

  process: {
    index: 0
  },

  _ipc: {
    nextSeq: 1,
    streams: {},
    send (name, value) {
      let mock
      console.log('call mock:', name, value)

      if (methods[name] === null || methods[name].length === 0) {
        throw new Error('unexpected: ' + name + ', ' + JSON.stringify(value))
      }

      if (Array.isArray(methods[name])) {
        mock = methods[name].shift()

        if (methods[name].length === 0) {
          delete methods[name]
        }
      } else {
        mock = methods[name]
      }
      return mock(value)
    },

    async resolve (seq, status, value) {
      if (typeof value === 'string') {
        let didDecodeURIComponent = false
        try {
          value = decodeURIComponent(value)
          didDecodeURIComponent = true
        } catch (err) {
          console.error(`${err.message} (${value})`)
          return
        }

        try {
          value = JSON.parse(value)
        } catch (err) {
          if (!didDecodeURIComponent) {
            console.error(`${err.message} (${value})`)
            return
          }
        }
      }

      if (!window._ipc[seq]) {
        console.error('inbound IPC message with unknown sequence:', seq, value)
        return
      }

      if (status === 0) {
        await window._ipc[seq].resolve(value)
      } else {
        const err = new Error(typeof value === 'string' ? value : JSON.stringify(value))
        await window._ipc[seq].reject(err)
      }

      delete window._ipc[seq]
    }
  }
})

export function create (t, name, args, result, isAsync = true) {
  methods[name] = methods[name] || []

  methods[name].push((_args) => {
    for (const k in args) {
      t.equal(_args[k], args[k], `property: ${k}`)
    }

    if (isAsync) {
      return Promise.resolve(result)
    }

    return result
  })
}

import * as exports from './mock.js'
export default exports

