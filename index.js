'use strict'

const events = require('./events')
const net = require('./net')
const dgram = require('./dgram')
const udx = require('./udx')
const streams = require('./streams')

module.exports = {
  events,
  net,
  udx,
  dgram,
  streams
}
