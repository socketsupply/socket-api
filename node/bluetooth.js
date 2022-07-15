'use strict'
const ipc = require('../ipc')
const { EventEmitter } = require('./events')

class Bluetooth extends EventEmitter {
  static isInitalized = false;

  constructor () {
    window.addEventListener('bluetooth', e => {
      const { err, data } = e.detail.params

      if (err) {
        return this.emit('error', err)
      }

      this.emit(data.event, data)
    })

    window.addEventListener('data', e => {
      if (e.detail.params.source === 'bluetooth') {
        this.emit('data', e.detail.data)
      }
    })
  }

  init (uuid = '') {
    if (Bluetooth.isInitialized) {
      throw new Error('Bluetooth already initialized')
    }

    window.external.invoke(`ipc://bluetooth-subscribe?uuid=${uuid}`)
  }

  advertise (data, params = {}) {
    if (typeof data === 'string') {
      const enc = new TextEncoder().encode(data)
      data = enc.data
      params.length = enc.length
    }
    return ipc.send('bluetooth-advertise', params, data)
  }
}

module.exports = Bluetooth
