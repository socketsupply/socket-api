import * as ipc from '../ipc.js'
/**
 * @module DNS
 *
 * This module enables name resolution. For example, use it to look up IP
 * addresses of host names. Although named for the Domain Name System (DNS),
 * it does not always use the DNS protocol for lookups. dns.lookup() uses the
 * operating system facilities to perform name resolution. It may not need to
 * perform any network communication. To perform name resolution the way other
 * applications on the same system do, use dns.lookup().
 */

import { rand64, isFunction } from '../util.js'
import * as promises from './promises.js'

/*
 * @param {string} hostname - The host name to resolve.
 * @param {Object} opts - An options object.
 * @param {number|string} opts.family - The record family. Must be 4, 6, or 0. For backward compatibility reasons,'IPv4' and 'IPv6' are interpreted as 4 and 6 respectively. The value 0 indicates that IPv4 and IPv6 addresses are both returned. Default: 0.
 * @param {function} callback - The function to call after the method is complete.
 * @returns {Promise}
 */
const lookup = (hostname, opts, cb) => {
  if (typeof hostname !== 'string') {
    const err = new TypeError(`The "hostname" argument must be of type string. Received type ${typeof hostname} (${hostname})`)
    err.code = 'ERR_INVALID_ARG_TYPE'
    throw err
  }

  if (typeof opts === 'function') {
    cb = opts
  }

  if (typeof cb !== 'function') {
    const err = new TypeError(`The "callback" argument must be of type function. Received type ${typeof cb} undefined`)
    err.code = 'ERR_INVALID_ARG_TYPE'
    throw err
  }

  if (typeof opts === 'number') {
    opts = { family: opts }
  }

  if (typeof opts !== 'object') {
    opts = {}
  }

  const { err, data } = ipc.sendSync('dnsLookup', { ...opts, id: rand64(), hostname })

  if (err) {
    const e = new Error(`getaddrinfo ENOTFOUND ${hostname}`)
    e.code = 'ENOTFOUND'
    e.syscall = 'getaddrinfo'
    e.hostname = hostname
    // e.errno = -3008, // lib_uv constant?
    return cb(e)
  }
  return cb(null, data)
}

export {
  lookup,
  promises
}

import * as exports from './index.js'

for (const key in exports) {
  const value = exports[key]
  if (key in promises && isFunction(value) && isFunction(promises[key])) {
    value[Symbol.for('nodejs.util.promisify.custom')] = promises[key]
  }
}
