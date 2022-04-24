'use strict'

const lookup = async (address, cb) => {
  const params = {
    address
  }

  const { err, data } = await window._ipc.send('dnsLookup', params)

  if (err && cb) return cb(err)
  if (cb) return cb(null, data)

  return { err, data }
}

module.exports = {
  lookup
}
