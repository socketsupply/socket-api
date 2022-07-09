'use strict'

const { FileHandle } = require('./handle')

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

module.exports = {
  open
}
