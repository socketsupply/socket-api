'use strict'
const EventEmitter = require('./events')

class FileHandle extends EventEmitter {
  constructor (fd) {
    super()
    this.fd = fd
  }

  async close (cb) {
    const { err } = await window._ipc.send('fsClose', { id: this.fd })
    if (err) throw err

    cb()
  }
}

const open = async (...args) => {
  const id = BigInt(Number.MAX_SAFE_INTEGER)
  const { err } = await window._ipc.send('fsOpen', args)
  if (err) throw err
  return new FileHandle(id)
}

module.exports = {
  open
}
