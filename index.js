'use strict'

const { Buffer } = require('./buffer')
const dgram = require('./dgram')
const dns = require('./dns')
const events = require('./events')
const fs = require('./fs')
const ipc = require('./ipc')
const net = require('./net')
const os = require('./os')
const stream = require('./stream')

module.exports = {
  dgram,
  dns,
  events,
  fs,
  ipc,
  net,
  os,
  stream
}
