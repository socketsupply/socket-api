import * as os from '@socketsupply/io/os'
import { test } from 'tapzero'

const archs = ['arm64', 'ia32', 'x64',  'unknown']
const platforms = ['android', 'cygwin', 'freebsd', 'linux', 'mac', 'openbsd', 'win32', 'unknown']
const types = ['CYGWIN_NT', 'Darwin', 'FreeBSD', 'Linux', 'OpenBSD', 'Windows_NT', 'Unknown']

test('os.arch()', (t) => {
  t.ok(archs.includes(os.arch()), 'os.arch() value is valid')
})

test('os.platform()', (t) => {
  t.ok(platforms.includes(os.platform()), 'os.platform()')
})

test('os.type()', (t) => {
  t.ok(types.includes(os.type()), 'os.type()')
})

test('os.networkInterfaces()', (t) => {
  const networkInterfaces = os.networkInterfaces()
  t.ok(networkInterfaces, 'os.networkInterfaces()')
  t.ok(Object.keys(networkInterfaces).length > 0, 'os.networkInterfaces() not empty')
})

test('os.EOL', (t) => {
  if (/windows/i.test(os.type())) {
    t.equal(os.EOL, '\r\n')
  } else {
    t.equal(os.EOL, '\n')
  }
})
