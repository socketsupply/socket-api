/**
 * @module Backend
 *
 * Provides methods for the backend process management
 */

 import ipc from './ipc.js'
 import { args } from './runtime.js'

/**
 * @param {object} opts - an options object
 * @param {boolean} [opts.force = false] - whether to force existing process to close
 * @return {Promise<ipc.Result>}
 */
export async function open (opts = {}) {
  opts.index = args.index
  opts.force ??= false
  return ipc.send('process.open', opts)
}

/**
 * @return {Promise<ipc.Result>}
 */ 
export async function close () {
  return ipc.send('process.kill', { index: args.index })
}
