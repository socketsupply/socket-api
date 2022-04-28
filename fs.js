'use strict'
const EventEmitter = require('./events')
const Buffer = require('./buffer')

const _require = typeof require !== 'undefined' && require

// so this is re-used instead of creating new one each rand64() call
const bui64arr = new BigUint64Array(1)
const rand64 = () => {
  const method = globalThis.crypto ? globalThis.crypto : _require('crypto').webcrypto
  return method.getRandomValues(bui64arr)[0]
}

class FileHandle extends EventEmitter {
  constructor () {
    super()
    // this id will be used to identify the file handle that is a reference
    // stored in a map container on the objective-c side of the bridge.
    this.fd = rand64()
  }

  async close () {
    const { err } = await window._ipc.send('fsClose', { id: this.fd })
    if (err) throw err

    this.emit('close')
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
  const fd = new FileHandle()

  // this id will be the key in the map that stores the file handle on the
  // objective-c side of the bridge.
  const { err } = await window._ipc.send('fsOpen', { id: fd.fd, path, flags, mode })

  if (err) throw err

  return fd
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

// Node.js-like API below

/**
 * https://nodejs.org/api/fs.html#filehandlewritefiledata-options
 *
 * @param {string | FileHandle} file - filename or FileHandle
 * @param {string | Buffer} data
 * @param {Object} options
 * @param {string} options.encoding - default: 'utf8'
 * @param {number} options.mode - default: 0o666
 * @param {string} options.flag - default: 'w'
 * @param {AbortSignal} options.signal
 * @returns {Promise<undefined>}
 */
const writeFile = async (file, data, { encoding = 'utf8', mode = 0o666, flag = 'w', signal }) => {
  // TODO: implement AbortSignal support

  const { fd } = new FileHandle()

  // open a file
  const { err: fsOpenErr } = await window._ipc.send('fsOpen', { id: fd, path: file, flags: flag })
  if (fsOpenErr) throw fsOpenErr

  // `data` is one of <string> | <Buffer> | <TypedArray> | <DataView> | <AsyncIterable> | <Iterable> | <Stream>
  // TODO: we support only <string> and <Buffer>  at the moment
  let ipcEncodedData
  if (typeof data === 'string') {
    ipcEncodedData = data
  } else if (Buffer.isBuffer(data)) {
    ipcEncodedData = data.toString()
  } else {
    throw new Error('Unsupported data type ', typeof data)
  }
  // write to a file
  const { err: fsWriteErr } = await window._ipc.send('fsWrite', { id: fd, data: ipcEncodedData, offset: 0 })
  if (fsOpenErr) throw fsWriteErr
  // close a file
  const { err: fsCloseErr } = await window._ipc.send('fsCloseErr', { id: fd })
  if (fsCloseErr) throw fsCloseErr
}
/**
 * https://nodejs.org/api/fs.html#fspromisesopenpath-flags-mode
 *
 * @param {string | Buffer} path
 * @param {string} flags - default: 'r'
 * @param {string} mode - default: 0o666
 * @returns {Promise<FileHandle>}
 */
const fsPromisesOpen = async (path, flags, mode) => {
  const { fd } = new FileHandle()

  const { err: fsOpenErr } = await window._ipc.send('fsOpen', { id: fd, path, flags })
  if (fsOpenErr) throw fsOpenErr

  return fd
}
/**
 * https://nodejs.org/api/fs.html#fspromisesreadfilepath-options
 *
 * @param {string | FileHandle} file - filename or FileHandle
 * @param {Object} options
 * @param {string} options.encoding - default: 'utf8'
 * @param {string} options.flag - default: 'r'
 * @param {AbortSignal} options.signal
 * @returns {Promise<string>}
 */
const readFile = async (file, { encoding = 'utf8', flag = 'r', signal }) => {
  // TODO: implement AbortSignal support

  const { fd } = new FileHandle()

  // open a file
  const { err: fsOpenErr } = await window._ipc.send('fsOpen', { id: fd, path: file, flags: flag })
  if (fsOpenErr) throw fsOpenErr

  const { err: fsStatErr, result } = await window._ipc.send('fsStat', { path: file })
  if (fsStatErr) throw fsStatErr

  const { err: fsReadErr, data } = await window._ipc.send('fsRead', { id: fd, offset: 0, length: result.st_size })
  if (fsReadErr) throw fsReadErr

  return data
}
/**
 * https://nodejs.org/api/fs.html#fspromisesrmpath-options
 *
 * @param {string} path
 * @param {Object} options
 * @param {boolean} options.force - default: false
 * @param {number} options.maxRetries - default: 0
 * @param {boolean} options.recursive - default: false
 * @param {number} options.retryDelay - default: 100
 * @returns {Promise<undefined>}
 */
const rm = async (path, { force = false, maxRetries = 0, recursive = false, retryDelay = 100 }) => {
  // TODO: use params?
  const { err } = await window._ipc.send('fsUnlink', { path })
  if (err) throw err
}

// End of Node.js-like API

module.exports = {
  copy,
  mkdir,
  open,
  rand64,
  readdir,
  rename,
  rmdir,
  unlink,

  // Node.js-like API exposed below
  fsPromises: {
    writeFile,
    open: fsPromisesOpen,
    readFile,
    rm,
    unlink: rm // alias for now
  }
}
