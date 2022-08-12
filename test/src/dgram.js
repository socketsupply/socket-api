import { test } from 'tapzero'
import * as dgram from '../../dgram.js'
import * as dns from '../../dns.js'
import { Buffer } from '../../buffer.js'
import { EventEmitter } from '../../events.js'

test('dgram ', async t => {
  t.ok(dgram, 'dgram is available')
  t.ok(dgram.Socket.prototype instanceof EventEmitter, 'dgram.Socket is an EventEmitter')
  t.ok(dgram.Socket.length === 2, 'dgram.Socket accepts two arguments')
  t.ok(dgram.createSocket, 'dgram.createSocket is available')
  t.ok(dgram.createSocket.length === 2, 'dgram.createSocket accepts two arguments')
  const server = dgram.createSocket({
    type: 'udp4'
  })
  t.ok(server instanceof dgram.Socket, 'dgram.createSocket returns a dgram.Socket')
  t.ok(server.type === 'udp4', 'dgram.createSocket sets the socket type')
  t.throws(server.address, /^Error: getsockname EBADF$/, 'server.address() throws an error if the socket is not bound')
  t.ok(server.bind(41234) === server, 'dgram.bind returns the socket')
  t.ok(server.address(), 'server.address() doesn\'t throw')
  t.equal(server.close(), void 0, 'server.close() returns undefined')
  t.throws(server.close, /ERR_SOCKET_DGRAM_NOT_RUNNING/, 'server.close() throws an error is the socket is already closed')
})

const makePayload = () => Array(Math.floor(Math.random() * 1024 * 1024)).fill(0).join('')

test('udp bind, send', async t => {
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
    client.send(Buffer.from(payload), 41234)
  })

  t.ok(server.bind(41234) === server, 'server returned this')

  try {
    const r = (await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    console.log(err)
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

  server.on('listening', () => {
    client.connect(41235, '0.0.0.0', (err) => {
      if (err) return t.fail(err.message)
      client.send(Buffer.from(payload))
    })
  })

  t.ok(server.bind(41235) === server)

  try {
    const r = (await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    console.log(err)
    t.fail(err, err.message)
  }

})
