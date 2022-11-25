/**
 * @module Backend
 *
 * Provides methods for the backend process management
 */

 import ipc from './ipc.js'
 import { args, currentWindow } from './runtime.js'

/**
 * @param {object} opts - an options object
 * @param {boolean} [opts.force = false] - whether to force existing process to close
 * @return {Promise<ipc.Result>}
 */
export async function open (opts = {}) {
  opts.index = currentWindow.index
  opts.force ??= false
  return await ipc.send('process.open', opts)
}

/**
 * @return {Promise<ipc.Result>}
 */ 
export async function close () {
  return await ipc.send('process.kill', { index: currentWindow.index })
}
