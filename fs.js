'use strict'

const { isBufferLike } = require('./util')
const { Buffer } = require('./buffer')
const ipc = require('./ipc')

const { FileHandle } = require('./fs/handle')
const constants = require('./fs/constants')
const promises = require('./fs/promises')

function defaultCallback (err) {
  if (err) throw err
}

/**
 * Asynchronously open a file calling `callback` upon success or error.
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fsopenpath-flags-mode-callback}
 * @param {string | Buffer | URL} path
 * @param {?(string)} [flags = 'r']
 * @param {?(string)} [mode = 0o666]
 * @param {function(err, fd)} callback
 */
function open (path, flags, mode, callback) {
  if (typeof flags === 'function') {
    callback = flags
    flags = FileHandle.DEFAULT_OPEN_FLAGS
    mode = FileHandle.DEFAULT_OPEN_MODE
  }

  if (typeof mode === 'function') {
    callback = mode
    mode = FileHandle.DEFAULT_OPEN_MODE
  }

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }

  try {
    FileHandle.open(path, flags, mode)
      .then((handle) => callback(null, handle.fd))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

/**
 * Asynchronously close a file descriptor calling `callback` upon success or error.
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fsclosefd-callback}
 * @param {number} fd
 * @param {function(err)} callback
 */
function close (fd, callback) {
  if (typeof callback !== 'function') {
    callback = defaultCallback
  }

  try {
    FileHandle.from(fd).close()
      .then(() => callback(null))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

function fstat (fd, callback) {
  if (typeof callback !== 'function') {
    callback = defaultCallback
  }

  try {
    FileHandle.from(fd).stat()
      .then(() => callback(null))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

function lstat (path, options, callback) {
  // @TODO
}

/**
 * Asynchronously read from an open file descriptor.
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fsreadfd-buffer-offset-length-position-callback}
 * @param {number} fd
 * @param {object | Buffer | TypedArray} buffer
 */
function read (fd, buffer, offset, length, position, callback) {
  if (typeof buffer === 'object' && !isBufferLike(buffer)) {
    offset = buffer.offset
    length = buffer.length
    position = buffer.position
    buffer = buffer.buffer
    callback = offset
  }

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }

  try {
    FileHandle.from(fd).read(buffer, offset, length, position)
      .then(({ bytesRead, buffer }) => callback(null, bytesRead, buffer))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

/**
 * @param {string | Buffer | URL | number } path
 * @param {object} [options]
 * @param {function(err, buffer)} callback
 */
function readFile (path, options, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }
}

module.exports = {
  close,
  constants,
  FileHandle,
  promises,
  open,
  read,
  readFile
}
