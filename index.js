'use strict'

const events = require('./events')
const net = require('./net')
const dgram = require('./dgram')
const fs = require('./fs')
const dns = require('./dns')

module.exports = {
  events,
  net,
  dgram,
  fs,
  dns
}
