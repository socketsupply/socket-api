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
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesaccesspath-mode}
 * @param {string | Buffer | URL} path
 * @param {string=} [mode = F_OK(0)]
 * @param {object=} [options]
 */
export async function access (path, mode, options) {
  return await FileHandle.access(path, mode, options)
}

/**
 * @TODO
 */
export async function appendFile (path, data, options) {
}

/**
 * @TODO
 */
export async function chmod (path, mode) {
}

/**
 * @TODO
 */
export async function chown (path, uid, gid) {
}

/**
 * @TODO
 */
export async function copyFile (src, dst, mode) {
}

/**
 * @TODO
 */
export async function lchmod (path, mode) {
}

/**
 * @TODO
 */
export async function lchown (path, uid, gid) {
}

/**
 * @TODO
 */
export async function lutimes (path, atime, mtime) {
}

/**
 * @TODO
 */
export async function link (existingPath, newPath) {
}

/**
 * @TODO
 */
export async function lstat (path, options) {
}

/**
 * @TODO
 */
export async function mkdir (path, options) {
}

/**
 * Asynchronously open a file.
 * https://nodejs.org/api/fs.html#fspromisesopenpath-flags-mode
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
 * @TODO
 */
export async function opendir (path, options) {
  const handle = await DirectoryHandle.open(path, options)
  return new Dir(handle, options)
}

/**
 * @TODO
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
 * @TODO
 * @param {string} path
 * @param {object=} [options]
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
 */
export async function readlink (path, options) {
}

/**
 * @TODO
 */
export async function realpath (path, options) {
}

/**
 * @TODO
 */
export async function rename (oldPath, newPath) {
}

/**
 * @TODO
 */
export async function rmdir (path, options) {
}

/**
 * @TODO
 */
export async function rm (path, options) {
}

/**
 * @TODO
 */
export async function stat (path, options) {
}

/**
 * @TODO
 */
export async function symlink (target, path, type) {
}

/**
 * @TODO
 */
export async function truncate (path, length) {
}

/**
 * @TODO
 */
export async function unlink (path) {
}

/**
 * @TODO
 */
export async function utimes (path, atime, mtime) {
}

/**
 * @TODO
 */
export async function watch (path, options) {
}

/**
 * @TODO
 * @param {string} path
 * @param {string|Buffer|Array|TypedArray} data
 * @param {object=} [options]
 */
export async function writeFile (path, data, options) {
  if (typeof options === 'string') {
    options = { encoding: options }
  }
  options = { flag: 'w', mode: 0o666, ...options }
  return await visit(path, options, async (handle) => {
    return await handle.writeFile(data, options)
  })
}

import * as exports from './index.js'
export default exports
