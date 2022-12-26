/**
 * @module FS.promises
 */
import { DirectoryHandle, FileHandle } from './handle.js'
import { Dir, sortDirectoryEntries } from './dir.js'

async function visit (path, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  const { flags, flag, mode } = options || {}

  // just visit `FileHandle`, without closing if given
  if (path instanceof FileHandle) {
    return await callback(handle)
  } else if (path?.fd) {
    return await callback(FileHandle.from(path.fd))
  }

  const handle = await FileHandle.open(path, flags || flag, mode, options)
  const value = await callback(handle)
  await handle.close(options)

  return value
}

/**
 * Asynchronously check access a file.
 * @see {@link https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesaccesspath-mode}
 * @param {string | Buffer | URL} path
 * @param {string=} [mode]
 * @param {object=} [options]
 */
export async function access (path, mode, options) {
  return await FileHandle.access(path, mode, options)
}

/**
 * @TODO
 * @ignore
 */
export async function appendFile (path, data, options) {
}

/**
 * @TODO
 * @ignore
 */
export async function chmod (path, mode) {
}

/**
 * @TODO
 * @ignore
 */
export async function chown (path, uid, gid) {
}

/**
 * @TODO
 * @ignore
 */
export async function copyFile (src, dst, mode) {
}

/**
 * @TODO
 * @ignore
 */
export async function lchmod (path, mode) {
}

/**
 * @TODO
 * @ignore
 */
export async function lchown (path, uid, gid) {
}

/**
 * @TODO
 * @ignore
 */
export async function lutimes (path, atime, mtime) {
}

/**
 * @TODO
 * @ignore
 */
export async function link (existingPath, newPath) {
}

/**
 * @TODO
 * @ignore
 */
export async function lstat (path, options) {
}

/**
 * @TODO
 * @ignore
 */
export async function mkdir (path, options) {
}

/**
 * Asynchronously open a file.
 * @see {@link https://nodejs.org/api/fs.html#fspromisesopenpath-flags-mode }
 *
 * @param {string | Buffer | URL} path
 * @param {string} flags - default: 'r'
 * @param {string} mode - default: 0o666
 * @return {Promise<FileHandle>}
 */
export async function open (path, flags, mode) {
  return await FileHandle.open(path, flags, mode)
}

/**
 * @see {@link https://nodejs.org/api/fs.html#fspromisesopendirpath-options}
 * @param {string | Buffer | URL} path
 * @param {object=} [options]
 * @param {string=} [options.encoding = 'utf8']
 * @param {number=} [options.bufferSize = 32]
 * @return {Promise<FileSystem,Dir>}
 */
export async function opendir (path, options) {
  const handle = await DirectoryHandle.open(path, options)
  return new Dir(handle, options)
}

/**
 * @see {@link https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesreaddirpath-options}
 * @param {string | Buffer | URL} path
 * @param {object=} options
 * @param {string=} [options.encoding = 'utf8']
 * @param {boolean=} [options.withFileTypes = false]
 */
export async function readdir (path, options) {
  options = { entries: DirectoryHandle.MAX_ENTRIES, ...options }

  const entries = []
  const handle = await DirectoryHandle.open(path, options)
  const dir = new Dir(handle, options)

  for await (const entry of dir.entries(options)) {
    entries.push(entry)
  }

  if (!dir.closing && !dir.closed) {
    try {
      await dir.close()
    } catch (err) {
      if (!/not opened/i.test(err.message)) {
        console.warn(err)
      }
    }
  }

  return entries.sort(sortDirectoryEntries)
}

/**
 * @see {@link https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesreadfilepath-options}
 * @param {string} path
 * @param {object=} [options]
 * @param {(string|null)=} [options.encoding = null]
 * @param {string=} [options.flag = 'r']
 * @param {AbortSignal=} [options.signal]
 * @return {Promise<Buffer | string>}
 */
export async function readFile (path, options) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }
  options = {
    flags: 'r',
    ...options
  }
  return await visit(path, options, async (handle) => {
    return await handle.readFile(options)
  })
}

/**
 * @TODO
 * @ignore
 */
export async function readlink (path, options) {
}

/**
 * @TODO
 * @ignore
 */
export async function realpath (path, options) {
}

/**
 * @TODO
 * @ignore
 */
export async function rename (oldPath, newPath) {
}

/**
 * @TODO
 * @ignore
 */
export async function rmdir (path, options) {
}

/**
 * @TODO
 * @ignore
 */
export async function rm (path, options) {
}

/**
 * @see {@link https://nodejs.org/api/fs.html#fspromisesstatpath-options}
 * @param {string | Buffer | URL} path
 * @param {object=} [options]
 * @param {boolean=} [options.bigint = false]
 * @return {Promise<Stats>}
 */
export async function stat (path, options) {
  return await visit(path, {}, async (handle) => {
    return await handle.stat(options)
  })
  
}

/**
 * @TODO
 * @ignore
 */
export async function symlink (target, path, type) {
}

/**
 * @TODO
 * @ignore
 */
export async function truncate (path, length) {
}

/**
 * @TODO
 * @ignore
 */
export async function unlink (path) {
}

/**
 * @TODO
 * @ignore
 */
export async function utimes (path, atime, mtime) {
}

/**
 * @TODO
 * @ignore
 */
export async function watch (path, options) {
}

/**
 * @see {@link https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromiseswritefilefile-data-options}
 * @param {string | Buffer | URL | FileHandle} path - filename or FileHandle
 * @param {string|Buffer|Array|DataView|TypedArray|Stream} data
 * @param {object=} [options]
 * @param {string|null} [options.encoding = 'utf8']
 * @param {number} [options.mode = 0o666]
 * @param {string} [options.flag = 'w']
 * @param {AbortSignal=} [options.signal]
 * @return {Promise<void>}
 */
// FIXME: truncate file by default (support flags). Currently it fails if file exists
export async function writeFile (path, data, options) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }
  options = { flag: 'w', mode: 0o666, ...options }
  return await visit(path, options, async (handle) => {
    return await handle.writeFile(data, options)
  })
}

import * as exports from './promises.js'
export * as constants from './constants.js'
export default exports
