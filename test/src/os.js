import * as os from '@socketsupply/io/os'
import { test } from 'tapzero'

const archs = ['x64', 'ia32', 'arm64', 'unknown']

test('os.arch()', (t) => {
  t.ok(archs.includes(os.arch()), 'os.arch() value is valid')
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
