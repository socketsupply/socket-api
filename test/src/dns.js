import { test } from 'tapzero'
import { lookup } from '../../dns.js'

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
test('dns', async t => {
  if (globalThis?.navigator?.onLine) {
    await new Promise (resolve => {
      lookup('sockets.sh', (err, info) => {
        if (err) return t.fail(err)
        t.ok(info && typeof info === 'object')
        t.equal(4, info.family, 'is IPv4 family')
        t.ok(IPV4_REGEX.test(info.address), 'is IPv4 address')
        resolve()
      })
    })
  }
})
