'use strict'

import { FileHandle } from './handle'

/**
 * Asynchronously check access a file.
 * @see {https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesaccesspath-mode}
 * @param {string | Buffer | URL} path
 * @param {?(string)} [mode = F_OK(0)]
 */
async function access (path, mode) {
  return await FileHandle.access(path, mode)
}

/**
 * @TODO
 */
async function appendFile (path, data, options) {
}

/**
 * @TODO
 */
async function chmod (path, mode) {
}

/**
 * @TODO
 */
async function chown (path, uid, gid) {
}

/**
 * @TODO
 */
async function copyFile (src, dest, mode) {
}

/**
 * @TODO
 */
async function lchmod (path, mode) {
}

/**
 * @TODO
 */
async function lchown (path, uid, gid) {
}

/**
 * @TODO
 */
async function lutimes (path, atime, mtime) {
}

/**
 * @TODO
 */
async function link (existingPath, newPath) {
}

/**
 * @TODO
 */
async function lstat (path, options) {
}

/**
 * @TODO
 */
async function mkdir (path, options) {
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
async function open (path, flags, mode) {
  return await FileHandle.open(path, flags, mode)
}

/**
 * @TODO
 */
async function opendir (path, options) {
}

/**
 * @TODO
 */
async function readdir (path, options) {
}

/**
 * @TODO
 */
async function readFile (path, options) {
}

/**
 * @TODO
 */
async function readlink (path, options) {
}

/**
 * @TODO
 */
async function realpath (path, options) {
}

/**
 * @TODO
 */
async function rename (oldPath, newPath) {
}

/**
 * @TODO
 */
async function rmdir (path, options) {
}

/**
 * @TODO
 */
async function rm (path, options) {
}

/**
 * @TODO
 */
async function stat (path, options) {
}

/**
 * @TODO
 */
async function symlink (target, path, type) {
}

/**
 * @TODO
 */
async function truncate (path, length) {
}

/**
 * @TODO
 */
async function unlink (path) {
}

/**
 * @TODO
 */
async function utimes (path, atime, mtime) {
}

/**
 * @TODO
 */
async function watch (path, options) {
}

/**
 * @TODO
 */
async function writeFile (file, data, options) {
}

export {
  access,
  appendFile,
  chmod,
  chown,
  copyFile,
  lchmod,
  lchown,
  lutimes,
  link,
  lstat,
  mkdir,
  open,
  opendir,
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
  writeFile
}
