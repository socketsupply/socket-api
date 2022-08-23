import { EventEmitter } from '@socketsupply/io/events.js'
import crypto from '@socketsupply/io/crypto.js'
import Buffer from '@socketsupply/io/buffer.js'
import dgram from '@socketsupply/io/dgram.js'
import util from '@socketsupply/io/util.js'

import { test } from 'tapzero'

// node compat
//import { EventEmitter } from 'node:events'
//import crypto from 'node:crypto'
//import { Buffer } from 'node:buffer'
//import dgram from 'node:dgram'
//import util from 'node:util'

const MTU = 1518

const makePayload = () => {
  const r = Math.random() * MTU
  return Array(Math.floor(r)).fill(0).join('')
}

test('dgram exports', t => {
  t.ok(dgram, 'dgram is available')
  t.ok(dgram.Socket.prototype instanceof EventEmitter, 'dgram.Socket is an EventEmitter')
  t.ok(dgram.Socket.length === 2, 'dgram.Socket accepts two arguments')
  t.ok(dgram.createSocket, 'dgram.createSocket is available')
  t.ok(dgram.createSocket.length === 2, 'dgram.createSocket accepts two arguments')
})

test('Socket creation', t => {
  t.throws(
    () => dgram.createSocket(),
    RegExp('Bad socket type specified. Valid types are: udp4, udp6'),
    'throws on missing type for dgram.createSocket'
  )
  t.throws(
    () => new dgram.Socket(),
    RegExp('Bad socket type specified. Valid types are: udp4, udp6'),
    'throws on  missing type for new dgram.Socket'
  )
  t.throws(
    () => dgram.createSocket('udp5'),
    RegExp('Bad socket type specified. Valid types are: udp4, udp6'),
    'throws on invalid string type for dgram.createSocket'
  )
  t.throws(
    () => dgram.createSocket({ type: 'udp5' }),
    RegExp('Bad socket type specified. Valid types are: udp4, udp6'),
    'throws on invalid object entry type for dgram.createSocket'
  )
  t.throws(
    () => new dgram.Socket('udp5'),
    RegExp('Bad socket type specified. Valid types are: udp4, udp6'),
    'throws on invalid string type for new dgram.Socket'
  )
  t.throws(
    () => new dgram.Socket({ type: 'udp5' }),
    RegExp('Bad socket type specified. Valid types are: udp4, udp6'),
    'throws on invalid object entry type for new dgram.Socket'
  )
  t.ok(dgram.createSocket('udp4'), 'works for dgram.createSocket with string type udp4')
  t.ok(dgram.createSocket('udp6'), 'works for dgram.createSocket with string type udp6')
  t.ok(dgram.createSocket({ type: 'udp4' }), 'works for dgram.createSocket with string type udp4')
  t.ok(dgram.createSocket({ type: 'udp6' }), 'works for dgram.createSocket with object entry type udp6')
  t.ok(new dgram.Socket('udp4'), 'works for new dgram.Socket with string type udp4')
  t.ok(new dgram.Socket('udp6'), 'works for new dgram.Socket with string type udp6')
  t.ok(new dgram.Socket({ type: 'udp4' }), 'works for new dgram.Socket with string type udp4')
  t.ok(new dgram.Socket({ type: 'udp6' }), 'works for new dgram.Socket with object entry type udp6')
})

test('dgram createSocket, address, bind, close', async t => {
  const server = dgram.createSocket({ type: 'udp4' })
  t.ok(server instanceof dgram.Socket, 'dgram.createSocket returns a dgram.Socket')
  t.throws(
    () => server.address(),
    RegExp('getsockname EBADF'),
    'server.address() throws an error if the socket is not bound'
  )
  t.ok(server.bind(41233) === server, 'dgram.bind returns the socket')
  await new Promise((done) => {
    server.once('listening', () => {
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
      t.equal(server.close(), server, 'server.close() returns instance')
      t.throws(
        () => server.close(),
        RegExp('Not running'),
        'server.close() throws an error is the socket is already closed'
      )

      done()
    })
  })
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
    t.ok(true, 'listening')
    client.send(Buffer.from(payload), 41234, '0.0.0.0')
  })

  server.bind(41234)

  try {
    const r = Buffer.from(await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    t.fail(err, err.message)
  }

  server.close()
  client.close()
})

test('udp socket message and bind callbacks', async t => {
  let server
  const msgCbResult = new Promise(resolve => {
    server = dgram.createSocket({
      type: 'udp4',
      reuseAddr: false
    }, (msg, rinfo) => {
      resolve({ msg, rinfo })
    })
  })

  const client = dgram.createSocket('udp4')

  server.on('listening', () => {
    client.send('payload', 41235, '0.0.0.0')
  })

  const listeningCbResult = new Promise(resolve => {
    server.bind(41235, '0.0.0.0', resolve)
  })

  const [{ msg, rinfo }] = await Promise.all([msgCbResult, listeningCbResult])
  t.ok(true, 'listening callback called')
  t.equal(Buffer.from(msg).toString(), 'payload', 'message matches')
  t.equal(rinfo.address, '127.0.0.1', 'rinfo.address is correct')
  t.ok(Number.isInteger(rinfo.port), 'rinfo.port is correct')
  t.equal(rinfo.family, 'IPv4', 'rinfo.family is correct')

  server.close()
  client.close()
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
    client.connect(41236, '0.0.0.0', (err) => {
      t.deepEqual(
        client.remoteAddress(),
        { address: '127.0.0.1', port: 41236, family: 'IPv4' },
        'client.remoteAddress() returns the remote address'
      )
      if (err) return t.fail(err.message)
      client.send(Buffer.from(payload))
    })
  })

  server.bind(41236)

  try {
    const r = Buffer.from(await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    t.fail(err, err.message)
  }

  server.close()
  client.close()
})

test('udp send callback', async t => {
  const message = Buffer.from('Some bytes');
  const client = dgram.createSocket('udp4');
  const result = await new Promise(resolve => {
    client.send(message, 41237, '0.0.0.0', (err) => {
      client.close()
      resolve(true)
    })
  })
  t.ok(result, 'send callback called')
})

test('udp createSocket AbortSignal', async t => {
  const controller = new AbortController();
  const { signal } = controller;
  const server = dgram.createSocket({ type: 'udp4', signal });
  let isSocketClosed = false;
  await new Promise(resolve => {
    server.bind(44444)
    server.once('listening', () => {
      controller.abort()
      isSocketClosed = true

      t.throws(
        () => server.close(),
        RegExp('Not running'),
        'server.close() throws an error is the socket is already closed'
      )

      resolve()
    })
  })
  t.ok(isSocketClosed, 'socket is closed after abort, close event is emitted')
})

test('client ~> server (1k messages)', async (t) => {
  const buffers = Array.from(Array(1024), () => crypto.randomBytes(1024))
  const server = dgram.createSocket('udp4')
  const client = dgram.createSocket('udp4')

  await new Promise((resolve) => {
    server.bind(3000, '0.0.0.0', () => {
      let i = 0
      server.on('message', (message) => {
        const buffer = buffers[i++]
        if (Buffer.compare(buffer, Buffer.from(message)) != 0) {
          t.fail('Mismatched buffer received')
          return resolve()
        }

        if (i === buffers.length) {
          t.ok(true, `all ${buffers.length} messages received`)
          resolve()
        }
      })

      client.connect(3000, '0.0.0.0', async () => {
        for (const buffer of buffers) {
          await new Promise((resolve) => {
            setTimeout(() => client.send(buffer, resolve))
          })
        }
      })
    })
  })

  await Promise.all([
    util.promisify(server.close.bind(server))(),
    util.promisify(client.close.bind(client))()
  ])
})
