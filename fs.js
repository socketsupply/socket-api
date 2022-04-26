'use strict'
const EventEmitter = require('./events')

const rand64 = () => {
  const method = globalThis.crypto ? globalThis.crypto : require('crypto')
  return method.getRandomValues(new BigUint64Array(1))[0]
}

class FileHandle extends EventEmitter {
  constructor (id) {
    super()
    // this id will be used to identify the file handle that is a reference
    // stored in a map container on the objective-c side of the bridge.
    this.id = id
  }

  async close () {
    const { err } = await window._ipc.send('fsClose', { id: this.fd })
    if (err) throw err
  }

  async read (options) {
    const {
      buffer,
      offset,
      length,
      position
    } = options

    const params = {
      id: this.fd,
      offset,
      length,
      position
    }

    const { err, data } = await window._ipc.send('fsRead', params)
    if (err) throw err

    Buffer.from(data.buffer).copy(buffer)

    return {
      bytesRead: data.bytesRead,
      buffer: buffer
    }
  }

  async write (buffer, offset, length, position) {
    if (typeof buffer !== 'string' && buffer.toString) {
      buffer = buffer.toString()
    }

    const params = {
      id: this.fd,
      data: buffer,
      offset,
      length,
      position
    }

    const { err } = await window._ipc.send('fsWrite', params)
    if (err) throw err
  }

  async stat (opts) {
    const { err } = await window._ipc.send('fsStat', { bigint: opts.bigint })
    if (err) throw err
  }
}

const copy = async (src, dest, options) => {
  const {
    recursive // TODO support on the objective-c++ side
  } = options

  const { err } = await window._ipc.send('fsCopy', { src, dest, recursive })
  if (err) throw err
}

const mkdir = async (path, options) => {
  const {
    recursive, // TODO support on the objective-c++ side
    mode
  } = options

  const { err } = await window._ipc.send('fsMkDir', { path, mode, recursive })
  if (err) throw err
}

const open = async (path, flags, mode) => {
  const id = rand64()

  // this id will be the key in the map that stores the file handle on the
  // objective-c side of the bridge.
  const { err } = await window._ipc.send('fsOpen', { id, path, flags, mode })

  if (err) throw err

  return new FileHandle(id)
}

const readdir = async (path, _) => {
  // TODO document that "options" (arg at index=1) is unused
  const { err, data } = await window._ipc.send('fsReadDir', { path })
  if (err) throw err
  return data
}

const rename = async (oldPath, newPath) => {
  const { err } = await window._ipc.send('fsRename', { oldPath, newPath })
  if (err) throw err
}

const rmdir = async (path, options) => {
  const {
    recursive // TODO support on the objective-c++ side
  } = options

  const { err } = await window._ipc.send('fsRmDir', { path, recursive })
  if (err) throw err
}

const unlink = async (path) => {
  const { err } = await window._ipc.send('fsUnlink', { path })
  if (err) throw err
}

module.exports = {
  copy,
  mkdir,
  open,
  rand64,
  readdir,
  rename,
  rmdir,
  unlink
}
