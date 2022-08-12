import * as io from '@socketsupply/io'
import { test } from 'tapzero'

test('udp bind, send', async t => {
  const server = io.dgram.createSocket({
    type: 'udp4',
    reuseAddr: false
  })

  const client = io.dgram.createSocket('udp4')

  const msg = new Promise((resolve, reject) => {
    server.on('message', resolve)
    server.on('error', reject)
  })

  server.on('listening', () => {
    client.send(io.Buffer.from('xxx'), 41234)
  })

  t.ok(server.bind(41234) === server)
  t.ok((await msg).toString() === 'xxx')
})

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

  server.on('listening', () => {
    client.connect(41234, '0.0.0.0', (err) => {
      if (err) return t.fail(err.message)
      client.send(io.Buffer.from('xxx'))
    })
  })

  t.ok(server.bind(41234) === server)
  t.ok((await msg).toString() === 'xxx')
})
