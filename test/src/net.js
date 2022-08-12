import { test } from 'tapzero'
import { EventEmitter } from '../../events.js'
import * as net from '../../net.js'
import { Duplex } from '../../stream'
import { rand64 } from '../../util.js'

test('net exports', t => {
  t.ok(net.Server.prototype instanceof EventEmitter, 'net.Server is an EventEmitter')
  t.ok(net.Socket.prototype instanceof Duplex, 'net.Socket is a Duplex')
  t.ok(net.connect instanceof Function, 'net.connect is a function')
  t.ok(net.createServer() instanceof net.Server, 'net.createServer() returns a net.Server')
  t.ok(net.getNetworkInterfaces instanceof Function, 'net.getNetworkInterfaces is a function')
  t.ok(net.isIPv4 instanceof Function, 'net.isIPv4 is a function')
})

// // TODO: uncomment when https://github.com/socketsupply/socket-sdk/issues/360 is fixed
// // createServer, call listen, close server
// test('net.createServer', async t => {
//   return new Promise((resolve) => {
//     const server = net.createServer(() => {
//       // no actual connections on this test
//     })

//     // unref does nothing, but returns self
//     t.equal(server.unref(), server)

//     // the default behaviour seems to be to listen on IPv6,
//     // guessing that probably depends on the system though.
//     server.listen(9000, '127.0.0.1', function () {
//       t.deepEqual(
//         server.address(),
//         { port: 9000, address: '127.0.0.1', family: 'IPv4' }
//       )

//       server.close(resolve)
//     })

//     server.on('error', t.fail)
//     server.on('listening', t.fail)
//   })
// })

// // net.connect returns socket, write data, receive data, end stream
// test('net.connect', async t => {
//   return new Promise((resolve) => {
//     const HELLO = 'Hello, World!\n'

//     const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
//       t.equal(_stream, stream)
//       t.equal(err, null)
//       t.equal(stream.allowHalfOpen, false)

//       // using setTimeout here is a sign we don't understand something.
//       //
//       // setTimeout(() => {
//         stream.__write('')

//         stream.end()
//         stream.on('close', () => {
//           resolve()
//         })
//       // }, 100)
//       stream.write(HELLO)
//     })

//     t.ok(_stream)
//   })
// })
