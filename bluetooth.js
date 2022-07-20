import { v4 } from 'uuid'

import * as ipc from './ipc.js'
import { EventEmitter } from './events.js'

//
// const bt = new Bluetooth('chat')
//
// await bt.subscribe('messages')
//
// bt.on('messages', data => {
//   // assert(data === '{"value":"hello, world"}')
// })
//
// await bt.publish('messages', {
//   value: 'hello, world'
// })
//
export class Bluetooth extends EventEmitter {
  static isInitalized = false;

  constructor (opts = {}) {
    this.keys = {}

    this.serviceId = v4()
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
      this.emit(this.keys[e.detail.params.characteristicId], e.detail.data)
    })
  }

  subscribe (key) {
    return this.set(key)
  }

  publish (key, value = '') {
    const id = v4()
    this.keys[id] = key

    const params = {
      characteristicId: id,
      serviceId: this.serviceId
    }

    if (value.constructor.name !== 'Object') {
      value = JSON.stringify(value)
    }

    if (typeof value === 'string') {
      const enc = new TextEncoder().encode(value)
      value = enc.data
      params.length = enc.length
    }

    return ipc.write('bluetooth-set', params, value)
  }
}
