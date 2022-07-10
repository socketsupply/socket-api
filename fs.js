'use strict'

const { ReadStream, WriteStream } = require('./fs/stream')
const { isBufferLike } = require('./util')
const { Dir, Dirent } = require('./fs/dir')
const { FileHandle } = require('./fs/handle')
const { Stats } = require('./fs/stats')
const constants = require('./fs/constants')
const promises = require('./fs/promises')

function defaultCallback (err) {
  if (err) throw err
}

async function visit (path, flags, mode, callback) {
  if (typeof flags === 'function') {
    callback = flags
    flags = undefined
    mode = undefined
  }

  if (typeof mode === 'function') {
    callback = mode
    mode = undefined
  }

  let handle = null
  try {
    handle = await FileHandle.open(path, flags, mode)
  } catch (err) {
    return callback(err)
  }

  if (handle) {
    await callback(null, handle)

    try {
      await handle.close()
    } catch (err) {
      console.warn(err.message || err)
    }
  }
}

/**
 * Asynchronously check access a file for a given mode calling `callback`
 * upon success or error.
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fsopenpath-flags-mode-callback}
 * @param {string | Buffer | URL} path
 * @param {?(string)} [mode = F_OK(0)]
 * @param {function(err, fd)} callback
 */
function access (path, mode, callback) {
  if (typeof mode === 'function') {
    callback = mode
    mode = FileHandle.DEFAULT_ACCESS_MODE
  }

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }

  try {
    FileHandle.access(path, mode)
      .then((mode) => callback(null, mode))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

/**
 * @TODO
 */
function appendFile (path, data, options, callback) {
}

/**
 * @TODO
 */
function chmod (path, mode, callback) {
}

/**
 * @TODO
 */
function chown (path, uid, gid, callback) {
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

/**
 * @TODO
 */
function copyFile (src, dest, mode, callback) {
}

function fstat (fd, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }

  try {
    FileHandle.from(fd).stat(options)
      .then(() => callback(null))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

/**
 * @TODO
 */
function lchmod (path, mode, callback) {
}

/**
 * @TODO
 */
function lchown (path, uid, gid, callback) {
}

/**
 * @TODO
 */
function lutimes (path, atime, mtime, callback) {
}

/**
 * @TODO
 */
function link (existingPath, newPath, callback) {
}

/**
 * @TODO
 */
function lstat (path, options, callback) {
}

/**
 * @TODO
 */
function mkdir (path, options, callback) {
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
 * @TODO
 */
function opendir (path, options, callback) {
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
    FileHandle.from(fd).read({ buffer, offset, length, position })
      .then(({ bytesRead, buffer }) => callback(null, bytesRead, buffer))
      .catch((err) => callback(err))
  } catch (err) {
    callback(err)
  }
}

/**
 * @TODO
 */
function readdir (path, options, callback) {
}

/**
 * @param {string | Buffer | URL | number } path
 * @param {object} [options]
 * @param {function(err, buffer)} callback
 */
function readFile (path, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }

  visit(path, options?.flag, async (err, handle) => {
    let buffer = null

    if (err) {
      callback(err)
      return
    }

    try {
      buffer = await handle.readFile(options)
    } catch (err) {
      callback(err)
      return
    }

    callback(null, buffer)
  })
}

/**
 * @TODO
 */
function readlink (path, options, callback) {
}

/**
 * @TODO
 */
function realpath (path, options, callback) {
}

/**
 * @TODO
 */
function rename (oldPath, newPath, callback) {
}

/**
 * @TODO
 */
function rmdir (path, options, callback) {
}

/**
 * @TODO
 */
function rm (path, options, callback) {
}

/**
 * @TODO
 */
function stat (path, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function.')
  }

  visit(path, async (err, handle) => {
    let stats = null

    if (err) {
      callback(err)
      return
    }

    try {
      stats = await handle.stat(options)
    } catch (err) {
      callback(err)
      return
    }

    callback(null, stats)
  })
}

/**
 * @TODO
 */
function symlink (target, path, type, callback) {
}

/**
 * @TODO
 */
function truncate (path, length, callback) {
}

/**
 * @TODO
 */
function unlink (path, callback) {
}

/**
 * @TODO
 */
function utimes (path, atime, mtime, callback) {
}

/**
 * @TODO
 */
function watch (path, options, callback) {
}

/**
 * @TODO
 */
function write (fd, buffer, offset, length, position, callback) {
}

/**
 * @TODO
 */
function writeFile (file, data, options, callback) {
}

/**
 * @TODO
 */
function writev (fd, buffers, position, callback) {
}

module.exports = {
  constants,
  Dir,
  Dirent,
  FileHandle,
  promises,
  ReadStream,
  Stats,
  WriteStream,

  access,
  appendFile,
  chmod,
  chown,
  close,
  copyFile,
  fstat,
  lchmod,
  lchown,
  lutimes,
  link,
  lstat,
  mkdir,
  open,
  opendir,
  read,
  readdir,
  readFile,
  readlink,
  realpath,
  rename,
  rmdir,
  rm,
  stat,
  symlink,
  truncate,
  unlink,
  utimes,
  watch,
  write,
  writeFile,
  writev
}
