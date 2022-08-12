import * as os from '@socketsupply/io/os'
//import os from 'os' //uncomment to tests the tests, should pass running node
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
  var int = os.networkInterfaces()
  function isAddress (i) {
    console.log(i)
    if(i.family === 4) {
      t.ok(/\d+\.\d+\.\d+\.\d+/.test(i.address))
    }
      else t.equal(i.family, 6)

    t.ok(i.netmask, 'has netmask')
    t.ok(i.mac, 'has mac address')
    t.equal(typeof i.internal, 'boolean')
    t.ok(i.cidr, 'has cidr')
  }

  t.ok(Array.isArray(int.lo))
  var interfaces = Object.keys(int).length
  t.ok(interfaces >= 2, 'network interfaces has at least two keys, loopback + wifi, was:'+interfaces)
  for(var intf in int) {
    int[intf].forEach(isAddress)
  }  
})

test('os.EOL', (t) => {
  if (/windows/i.test(os.type())) {
    t.equal(os.EOL, '\r\n')
  } else {
    t.equal(os.EOL, '\n')
  }
})
