'use strict'

const dgram = require('./dgram')
const dns = require('./dns')
const events = require('./events')
const fs = require('./fs')
const ipc = require('./ipc')
const net = require('./net')
const os = require('./os')

module.exports = {
  dgram,
  dns,
  events,
  fs,
  ipc,
  net,
  os
}
