'use strict'

const buffer = require('./node/buffer')
const dgram = require('./node/dgram')
const dns = require('./node/dns')
const events = require('./node/events')
const fs = require('./node/fs')
const net = require('./node/net')
const stream = require('./node/stream')

module.exports = {
  buffer,
  dgram,
  dns,
  events,
  fs,
  net,
  stream
}
