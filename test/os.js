import { test } from 'tapzero'
import * as nodeos from 'node:os'

import mock from './mock.js'

import * as os from '../os.js'

test('os.arch()', (t) => {
  mock.create(t, 'getPlatformArch', {}, { data: nodeos.arch() }, false)

  t.equal(nodeos.arch(), os.arch())
})

test('os.platform()', (t) => {
  mock.create(t, 'getPlatformOS', {}, { data: nodeos.platform() }, false)
  t.equal(nodeos.platform(), os.platform())
})

test('os.type()', (t) => {
  mock.create(t, 'getPlatformType', {}, { data: nodeos.type() }, false)
  t.equal(nodeos.type(), os.type())
})

test('os.networkInterfaces()', (t) => {
  const mockedIPCNetworkInterfaces = {
    ipv4: {
      tun0: '100.200.100.200',
      wlan0: '192.168.1.113',
      rmnet0: '11.11.11.11',
      lo: '127.0.0.1',
      local: '0.0.0.0'
    },
    ipv6: {
      tun0: '2604:cccc:11a:84b2::60:9999',
      wlan0: 'ffff::acef:64ff:fe1c:3c77',
      dummy0: 'ffff::30c8:c6ff:fe02:123d',
      lo: '::1',
      local: '::1'
    }
  }

  const mockedNetworkInterfaces = {
    tun0: [
      { address: '100.200.100.200', netmask: '255.255.255.0', internal: false, family: 'IPv4', cidr: '100.200.100.200/24', mac: null },
      { address: '2604:cccc:11a:84b2::60:9999', netmask: 'ffff:ffff:ffff:ffff::', internal: false, family: 'IPv6', cidr: '2604:cccc:11a:84b2::60:9999/64', mac: null }
    ],
    wlan0: [
      { address: '192.168.1.113', netmask: '255.255.255.0', internal: false, family: 'IPv4', cidr: '192.168.1.113/24', mac: null },
      { address: 'ffff::acef:64ff:fe1c:3c77', netmask: 'ffff:ffff:ffff:ffff::', internal: false, family: 'IPv6', cidr: 'ffff::acef:64ff:fe1c:3c77/64', mac: null }
    ],
    rmnet0: [
      { address: '11.11.11.11', netmask: '255.255.255.0', internal: false, family: 'IPv4', cidr: '11.11.11.11/24', mac: null }
    ],
    lo: [
      { address: '127.0.0.1', netmask: '255.0.0.0', internal: true, family: 'IPv4', cidr: '127.0.0.1/8', mac: '00:00:00:00:00:00' },
      { address: '::1', netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff', internal: true, family: 'IPv6', cidr: '::1/128', mac: '00:00:00:00:00:00' }
    ],
    local: [
      { address: '0.0.0.0', netmask: '0.0.0.0', internal: true, family: 'IPv4', cidr: '0.0.0.0/0', mac: '00:00:00:00:00:00' },
      { address: '::1', netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff', internal: true, family: 'IPv6', cidr: '::1/128', mac: '00:00:00:00:00:00' }
    ],
    dummy0: [
      { address: 'ffff::30c8:c6ff:fe02:123d', netmask: 'ffff:ffff:ffff:ffff::', internal: false, family: 'IPv6', cidr: 'ffff::30c8:c6ff:fe02:123d/64', mac: null }
    ]
  }

  mock.create(t, 'getNetworkInterfaces', {}, { data: mockedIPCNetworkInterfaces }, false)

  t.deepEqual(mockedNetworkInterfaces, os.networkInterfaces())
})

test('os.EOL', (t) => {
  if (/windows/i.test(nodeos.type())) {
    t.equal(os.EOL, '\r\n')
  } else {
    t.equal(os.EOL, '\n')
  }
})
