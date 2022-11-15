/**
 * @module Backend
 *
 * Provides methods for the backend process management
 */

 import ipc from './ipc.js'

/**
 * @param {object} opts - an options object
 * @param {boolean} [opts.force = false] - whether to force existing process to close
 * @return {Promise<ipc.Result>}
 */
export async function open ({ force } = { force: false }) {
  return ipc.send('process.open', { force })
}

/**
 * @return {Promise<ipc.Result>}
 */ 
export async function close () {
  return ipc.send('process.kill')
}
