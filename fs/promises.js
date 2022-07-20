import { FileHandle } from './handle.js'

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

  const handle = await FileHandle.open(path, flags, mode)
  const value = await callback(handle)
  await handle.close()
  return value
}

/**
 * Asynchronously check access a file.
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesaccesspath-mode}
 * @param {string | Buffer | URL} path
 * @param {?(string)} [mode = F_OK(0)]
 */
export async function access (path, mode) {
  return await FileHandle.access(path, mode)
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
export async function copyFile (src, dest, mode) {
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
}

/**
 * @TODO
 */
export async function readdir (path, options) {
}

/**
 * @TODO
 */
export async function readFile (path, options) {
  return await visit(path, options?.flag, async (handle) => {
    return handle.readFile(options)
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
 */
export async function writeFile (path, data, options) {
  return await visit(path, options?.flag || 'w', async (handle) => {
    return handle.writeFile(data, options)
  })
}
