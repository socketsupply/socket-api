import * as os from '@socketsupply/io/os'
import { test } from 'tapzero'

test('os.arch()', (t) => {
  t.ok(os.arch(), 'os.arch()')
})

test('os.platform()', (t) => {
  t.ok(os.platform(), 'os.platform()')
})

test('os.type()', (t) => {
  t.ok(os.type(), 'os.type()')
})

test('os.networkInterfaces()', (t) => {
})

test('os.EOL', (t) => {
  if (/windows/i.test(os.type())) {
    t.equal(os.EOL, '\r\n')
  } else {
    t.equal(os.EOL, '\n')
  }
})
