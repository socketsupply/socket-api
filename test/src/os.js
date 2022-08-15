import * as os from '@socketsupply/io/os.js'
//import os from 'os' //uncomment to tests the tests, should pass running node
import { test } from 'tapzero'

const archs = ['arm64', 'ia32', 'x64',  'unknown']
const platforms = ['android', 'cygwin', 'freebsd', 'linux', 'darwin', 'openbsd', 'win32', 'unknown']
const types = ['CYGWIN_NT', 'Mac', 'FreeBSD', 'Linux', 'OpenBSD', 'Windows_NT', 'Unknown']

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
  var int = os.networkInterfaces()
  function isAddress (i) {
    if(i.family === 4 || i.family === 'IPv4') {
      t.ok(/\d+\.\d+\.\d+\.\d+/.test(i.address), 'matches the format')
    } else {
      t.ok(i.family === 6 || i.family === 'IPv6')
    }

    t.ok(i.netmask, 'has netmask')
    if (i.internal) t.ok(i.mac, 'has mac address')
    t.equal(typeof i.internal, 'boolean')
    t.ok(i.cidr, 'has cidr')
  }


  t.ok(Array.isArray(int.lo) || Array.isArray(int.lo0), 'iterface is "lo"')
  var interfaces = Object.keys(int).length
  t.ok(interfaces >= 2, 'network interfaces has at least two keys, loopback + wifi, was:'+interfaces)
  for (const intf in int) {
    int[intf].forEach(isAddress)
  }

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
