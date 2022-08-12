import * as dgram from '@socketsupply/io/dgram'
import { test } from 'tapzero'

test('udp kitchen client-server', async t => {
  const server = dgram.createSocket({
    type: 'udp4',
    reuseAddr: false
  })

  const client = dgram.createSocket('udp4')

  const msg = new Promise((resolve, reject) => {
    server.on('message', resolve)
    server.on('error', reject)
  })

  server.on('listening', () => {
    client.connect(41234, '0.0.0.0', (err) => {
      if (err) return t.fail(err.message)
      client.send(Buffer.from('xxx'))
    })
  })
  t.ok(server.bind(41234) === server)
  t.ok((await msg).toString() === 'xxx')
})
