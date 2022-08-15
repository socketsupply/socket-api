import * as ipc from './ipc.js'
import { rand64 } from './util.js'
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

/*
 * @param {string} hostname - The host name to resolve.
 * @param {Object} opts - An options object.
 * @param {number|string} opts.family - The record family. Must be 4, 6, or 0. For backward compatibility reasons,'IPv4' and 'IPv6' are interpreted as 4 and 6 respectively. The value 0 indicates that IPv4 and IPv6 addresses are both returned. Default: 0.
 * @param {function} callback - The function to call after the method is complete.
 * @returns {Promise}
 */
export const lookup = async (hostname, opts, cb) => {
  let params = {
    serverId: opts.serverId ?? rand64(),
    hostname,
  }

  if (typeof opts === 'function') {
    cb = opts
  }

  if (typeof opts === 'object') {
    params = {
      ...params,
      ...opts
    }
  }

  if (typeof opts === 'number') {
    params.family = opts
  }

  const { err, data } = await ipc.send('dnsLookup', params)

  if (err && cb) return cb(err)
  if (cb) return cb(null, data)

  return { err, data }
}

export default {
  lookup
}
