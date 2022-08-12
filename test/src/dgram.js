
import * as dgram from '@socketsupply/io/dgram.js'
//import dgram from 'dgram' //uncomment to tests the tests, should pass running node
import { test } from 'tapzero'

test('bind a dgram port and send a packet to it', function (t) {
  var resolve
  var socket = dgram.createSocket('udp4'), socket2
//  var p = ~~(Math.random()*0xffff)
  socket.on('message', function (b) {
    t.equal(b.toString(), 'hello!')
    socket.close(function () {})
    resolve()
  })
  t.equal(socket.bind(), socket, 'bind returns this') //any port

  socket.on('listening', function () {
    var addr = socket.address()
    var p = addr.port
    t.equal(addr.address, '0.0.0.0')
    t.ok(Number.isInteger(addr.port))
    socket.send(Buffer.from('hello!'), p, '127.0.0.1') //any port
  })
  return new Promise(_resolve => resolve = _resolve)
})

test('error if port is already bound', function (t) {
  var resolve
  var socket = dgram.createSocket('udp4')
  var socket2 = dgram.createSocket('udp4')
  var received = []
  socket.on('message', function (b) {
    console.log('receive:', b)
    socket.close(function () {})
    resolve()
  })
  t.equal(socket.bind(), socket, 'bind returns this') //any port

  socket.on('listening', function () {
    var addr = socket.address()
    var p = addr.port
    t.equal(addr.address, '0.0.0.0')
    t.ok(Number.isInteger(addr.port))
    socket2.on('error', function (err) {
      t.equal(err.code, 'EADDRINUSE', 'address in use err')
      socket.close()
      resolve()
    })
    t.equal(socket2.bind(p), socket2)
  })
  return new Promise(_resolve => resolve = _resolve)
})