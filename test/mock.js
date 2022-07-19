import { EventEmitter } from 'events'

const methods = {}

const CustomEventDispatched = Symbol.for('CustomEvent.dispatched')

class XMLHttpRequest {
  constructor () {
    this.response = null
  }

  open (method, url, isAsync) {
  }

  send (data) {
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

const create = (t, name, args, result) => {
  methods[name] = methods[name] || []

  methods[name].push((_args) => {
    for (const k in args) {
      t.equal(_args[k], args[k], `property: ${k}`)
    }

    return Promise.resolve(result)
  })
}

module.exports = {
  create,
  methods
}
