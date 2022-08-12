import { test } from 'tapzero'
import { EventEmitter } from '../../events.js'
import * as net from '../../net.js'
import { Duplex } from '../../stream'

test('net exports', t => {
  t.ok(net.Server.prototype instanceof EventEmitter, 'net.Server is an EventEmitter')
  t.ok(net.Socket.prototype instanceof Duplex, 'net.Socket is a Duplex')
  t.ok(net.connect instanceof Function, 'net.connect is a function')
  t.ok(net.createServer() instanceof net.Server, 'net.createServer() returns a net.Server')
  t.ok(net.getNetworkInterfaces instanceof Function, 'net.getNetworkInterfaces is a function')
  t.ok(net.isIPv4 instanceof Function, 'net.isIPv4 is a function')
})
