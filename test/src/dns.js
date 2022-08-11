import { test } from 'tapzero'
import { lookup } from '../../dns.js'

test('dns', async t => {
  t.ok(lookup, 'lookup is available')
  lookup('sockets.sh', (err, address) => {
    if (err) return t.fail(err)
    t.ok(typeof address == 'string', 'lookup returns an address')
  })
})
