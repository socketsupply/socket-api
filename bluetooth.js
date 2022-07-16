'use strict'

import uuid from 'uuid'

import ipc from './ipc.js'
import { EventEmitter } from './events.js'

class Bluetooth extends EventEmitter {
  static isInitalized = false;

  constructor (opts = {}) {
    this.keys = {}

    this.serviceId = uuid.v4()
    window.external.invoke(`ipc://bluetooth-start?uuid=${this.serviceId}`)

    window.addEventListener('bluetooth', e => {
      const { err, data } = e.detail.params

      if (err) {
        return this.emit('error', err)
      }

      this.emit(data.event, data)
    })

    window.addEventListener('data', e => {
      if (e.detail.params.serviceId !== this.serviceId) return

      this.emit('data', {
        key: e.detail.params.key,
        value: e.detail.data
      })
    })
  }

  subscribe (key) {
    return this.set(key)
  }

  publish (key, value = '') {
    const id = uuid.v4()
    this.keys[key] = id

    const params = { key: id }

    if (typeof value === 'string') {
      const enc = new TextEncoder().encode(value)
      value = enc.data
      params.length = enc.length
    }

    return ipc.write('bluetooth-set', params, value)
  }
}

export {
  Bluetooth
}
