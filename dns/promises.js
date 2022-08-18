import * as ipc from '../ipc.js'
import { rand64 } from '../util.js'
/*
 * @param {string} hostname - The host name to resolve.
 * @param {Object} opts - An options object.
 * @param {number|string} opts.family - The record family. Must be 4, 6, or 0. For backward compatibility reasons,'IPv4' and 'IPv6' are interpreted as 4 and 6 respectively. The value 0 indicates that IPv4 and IPv6 addresses are both returned. Default: 0.
 * @param {function} callback - The function to call after the method is complete.
 * @returns {Promise}
 */
export async function lookup(hostname, opts) {
  if (typeof hostname !== 'string') {
    const err = new TypeError(`The "hostname" argument must be of type string. Received type ${typeof hostname} (${hostname})`)
    err.code = 'ERR_INVALID_ARG_TYPE'
    throw err
  }

  if (typeof opts === 'number') {
    opts = { family: opts }
  }

  if (typeof opts !== 'object') {
    opts = {}
  }

  const { err, data } = await ipc.send('dnsLookup', { ...opts, id: rand64(), hostname })

  if (err) {
    const e = new Error(`getaddrinfo ENOTFOUND ${hostname}`)
    e.code = 'ENOTFOUND'
    e.syscall = 'getaddrinfo'
    e.hostname = hostname
    // e.errno = -3008, // lib_uv constant?
    return e
  }
  return data
}
