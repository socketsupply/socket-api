'use strict'

const events = require('./events')
const net = require('./net')
const dgram = require('./dgram')
const utp = require('./utp')
const streams = require('./streams')

module.exports = {
  events,
  net,
  utp,
  dgram,
  streams
}
