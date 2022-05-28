'use strict'

const lookup = async (hostname, opts, cb) => {
  const params = {
    hostname
  }

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  const { err, data } = await window._ipc.send('dnsLookup', params)

  if (err && cb) return cb(err)
  if (cb) return cb(null, data)

  return { err, data }
}

module.exports = {
  lookup
}
