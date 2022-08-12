import { test } from 'tapzero'
import { lookup } from '../../dns.js'

test('dns', async t => {
  await new Promise (resolve => {
    lookup('sockets.sh', (err, address) => {
      if (err) return t.fail(err)
      console.log(JSON.stringify(address))
      t.ok(address.ip.length > 0, 'lookup returns an address')
      resolve()
    })
  })
})
