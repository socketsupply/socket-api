import { test } from 'tapzero'
import * as dgram from '@socketsupply/io/dgram.js'
import { Buffer } from '@socketsupply/io/buffer.js'
import { EventEmitter } from '@socketsupply/io/events.js'

const MTU = 1518

const makePayload = () => {
  const random = Math.random() * MTU
  return Array(Math.floor(MTU)).fill(0).join('')
}

test('dgram exports', t => {
  t.ok(dgram, 'dgram is available')
  t.ok(dgram.Socket.prototype instanceof EventEmitter, 'dgram.Socket is an EventEmitter')
  t.ok(dgram.Socket.length === 2, 'dgram.Socket accepts two arguments')
  t.ok(dgram.createSocket, 'dgram.createSocket is available')
  t.ok(dgram.createSocket.length === 2, 'dgram.createSocket accepts two arguments')
})

test('dgram createSocket, address, bind, close', async t => {
  const server = dgram.createSocket({ type: 'udp4' })
  t.ok(server instanceof dgram.Socket, 'dgram.createSocket returns a dgram.Socket')
  t.ok(server.type === 'udp4', 'dgram.createSocket sets the socket type')
  t.throws(
    () => server.address(),
    RegExp('getsockname EBADF'),
    'server.address() throws an error if the socket is not bound'
  )
  t.ok(server.bind(41233) === server, 'dgram.bind returns the socket')
  // FIXME:
  // t.throws(
  //   () => server.bind(41233),
  //   RegExp('bind EADDRINUSE 0.0.0.0:41233'),
  //   'server.bind throws an error if the socket is already bound'
  // )
  t.deepEqual(
    server.address(),
    { address: '0.0.0.0', port: 41233, family: 'IPv4' },
    'server.address() returns the bound address'
  )
  t.equal(server.close(), void 0, 'server.close() returns undefined')
  t.throws(
    () => server.close(),
    RegExp('ERR_SOCKET_DGRAM_NOT_RUNNING'),
    'server.close() throws an error is the socket is already closed'
  )
})

test('udp bind, send, remoteAddress', async t => {
  const server = dgram.createSocket({
    type: 'udp4',
    reuseAddr: false
  })

  const client = dgram.createSocket('udp4')

  const msg = new Promise((resolve, reject) => {
    server.on('message', resolve)
    server.on('error', reject)
  })

  const payload = makePayload()
  t.ok(payload.length > 0, `${payload.length} bytes prepared`)

  server.on('listening', () => {
    client.send(Buffer.from(payload), 41234, '0.0.0.0')
  })

  server.bind(41234)

  try {
    const r = Buffer.from(await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    t.fail(err, err.message)
  }
})

test('udp bind, connect, send', async t => {
  const server = dgram.createSocket({
    type: 'udp4',
    reuseAddr: false
  })

  const client = dgram.createSocket('udp4')

  const msg = new Promise((resolve, reject) => {
    server.on('message', resolve)
    server.on('error', reject)
  })

  const payload = makePayload()

  t.throws(
    () => client.remoteAddress(),
    RegExp('Not connected'),
    'client.remoteAddress() throws an error if the socket is not connected'
  )

  server.on('listening', () => {
    client.connect(41235, '0.0.0.0', (err) => {
      t.deepEqual(
        client.remoteAddress(),
        { address: '127.0.0.1', port: 41235, family: 'IPv4' },
        'client.remoteAddress() returns the remote address'
      )
      if (err) return t.fail(err.message)
      client.send(Buffer.from(payload))
    })
  })

  server.bind(41235)

  try {
    const r = Buffer.from(await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    t.fail(err, err.message)
  }
})
