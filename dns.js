'use strict'

const lookup = async (hostname, cb) => {
  const params = {
    hostname
  }

  const { err, data } = await window._ipc.send('dnsLookup', params)

  if (err && cb) return cb(err)
  if (cb) return cb(null, data)

  return { err, data }
}

module.exports = {
  lookup
}
