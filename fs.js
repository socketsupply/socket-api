'use strict'
const EventEmitter = require('./events')

const rand64 = () => BigInt(
  ((Math.random() * Number.MAX_SAFE_INTEGER) >>> 0).toString(2) +
  ((Math.random() * Number.MAX_SAFE_INTEGER) >>> 0).toString(2)
)

class FileHandle extends EventEmitter {
  constructor (id) {
    super()
    // this id will be used to identify the file handle that is a reference
    // stored in a map container on the objective-c side of the bridge.
    this.id = id
  }

  async close (cb) {
    const { err } = await window._ipc.send('fsClose', { id: this.fd })
    if (err) throw err

    cb()
  }
}

const write = async () => {

}

const open = async (path, flags, mode) => {
  const id = rand64()

  // this id will be the key in the map that stores the file handle on the
  // objective-c side of the bridge.
  const { err } = await winow._ipc.send('fsOpen', { id, path, flags, mode })

  if (err) throw err

  return new FileHandle(id)
}

module.exports = {
  open,
  write
}
