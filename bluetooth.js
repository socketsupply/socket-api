import * as ipc from './ipc.js'
import { EventEmitter } from './events.js'

/// Provides a high level api over bluetooth
/// A pub-sub of key-value pairs
export class Bluetooth extends EventEmitter {
  static isInitalized = false;

  /// Creates a new service with key-value pairs
  constructor (
    /// Required - The id of the service (must be a valid UUID)
    serviceId = 0 // given a default value to determine the type
  ) {
    super()

    if (!serviceId || serviceId.length !== 36) {
      throw new Error('expected serviceId of length 36')
    }

    this.serviceId = serviceId

    window.addEventListener('data', e => {
      if (!e.detail.params) return
      const { err, data } = e.detail.params

      if (err) return this.emit('error', err)

      if (data?.serviceId === this.serviceId) {
        this.emit(data.characteristicId, data, e.detail.data)
      }
    })

    window.addEventListener('bluetooth', e => {
      if (typeof e.detail !== 'object') return
      const { err, data } = e.detail

      if (err) {
        return this.emit('error', err)
      }

      this.emit(data.event, data)
    })
  }

  start () {
    return ipc.send('bluetooth-start', { serviceId: this.serviceId })
  }

  subscribe (id) {
    return ipc.send('bluetooth-subscribe', {
      characteristicId: id,
      serviceId: this.serviceId
    })
  }

  async publish (characteristicId, value = '') {
    if (!characteristicId || characteristicId.length !== 36) {
      throw new Error('expected characteristicId of length 36')
    }

    const params = {
      characteristicId: characteristicId,
      serviceId: this.serviceId
    }

    if (!(value instanceof ArrayBuffer) && typeof value === 'object') {
      value = JSON.stringify(value)
    }

    if (typeof value === 'string') {
      const enc = new TextEncoder().encode(value)
      value = enc
      params.length = enc.length
    }

    const res = await ipc.write('bluetooth-publish', params, value)

    if (res.err) {
      throw new Error(res.err.message)
    }
  }
}
