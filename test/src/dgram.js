import * as io from '@socketsupply/io'
import { test } from 'tapzero'

const makePayload = () => Array(Math.floor(Math.random() * 1024 * 1024)).fill(0).join('')

test('sanity', t => {
  t.ok(true, 'sane')
})

test('sanity', async t => {
  t.ok(true, 'sane')
})

/* test('udp bind, send', async t => {
  const server = io.dgram.createSocket({
    type: 'udp4',
    reuseAddr: false
  })

  t.ok(!!server, 'server exists')
  const client = io.dgram.createSocket('udp4')

  const msg = new Promise((resolve, reject) => {
    server.on('message', resolve)
    server.on('error', reject)
  })

  const payload = makePayload()
  t.ok(payload.length > 0, `${payload.length} bytes prepared`)

  server.on('listening', () => {
    client.send(io.Buffer.from(payload), 41234)
  })

  t.ok(server.bind(41234) === server, 'server returned this')

  try {
    const r = (await msg).toString()
    t.ok(r === payload, `${payload.length} bytes match`)
  } catch (err) {
    console.log(err)
    t.fail(err, err.message)
  }
}) */

test('udp bind, connect, send', async t => {
  const server = io.dgram.createSocket({
    type: 'udp4',
    reuseAddr: false
  })

  const client = io.dgram.createSocket('udp4')

  const msg = new Promise((resolve, reject) => {
    server.on('message', resolve)
    server.on('error', reject)
  })

  const payload = makePayload()

  server.on('listening', () => {
    client.connect(41235, '0.0.0.0', (err) => {
      if (err) return t.fail(err.message)
      client.send(io.Buffer.from(payload))
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
