'use strict'

const ipc = require('./ipc')

const UNKNOWN = 'unknown'

function arch () {
  return (
    window.process.arch ||
    ipc.sendSync('getPlatformArch')?.value?.data ||
    UNKNOWN
  )
}

function networkInterfaces () {
  const { ipv4, ipv6 } = ipc.sendSync('getNetworkInterfaces')?.value.data || {}
  const interfaces = {}

  for (const type in ipv4) {
    const address = ipv4[type]
    const family = 'IPv4'

    let internal = false
    let netmask = '255.255.255.0'
    let cidr = `${address}/24`
    let mac = null

    if (address === '127.0.0.1' || address === '0.0.0.0') {
      internal = true
      mac = '00:00:00:00:00:00'

      if (address === '127.0.0.1') {
        cidr = '127.0.0.1/8'
        netmask = '255.0.0.0'
      } else {
        cidr = '0.0.0.0/0'
        netmask = '0.0.0.0'
      }
    }

    interfaces[type] = interfaces[type] || []
    interfaces[type].push({
      address,
      netmask,
      internal,
      family,
      cidr,
      mac
    })
  }

  for (const type in ipv6) {
    const address = ipv6[type]
    const family = 'IPv6'

    let internal = false
    let netmask = 'ffff:ffff:ffff:ffff::'
    let cidr = `${address}/64`
    let mac = null

    if (address === '::1') {
      internal = true
      netmask = 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff'
      cidr = '::1/128'
      mac = '00:00:00:00:00:00'
    }

    interfaces[type] = interfaces[type] || []
    interfaces[type].push({
      address,
      netmask,
      internal,
      family,
      cidr,
      mac
    })
  }

  return interfaces
}

function platform () {
  return (
    window.process.os ||
    ipc.sendSync('getPlatformOS')?.value?.data ||
    window.process.platform ||
    UNKNOWN
  )
}

function type () {
  return (
    window.process.platform ||
    ipc.sendSync('getPlatformType')?.value?.data ||
    UNKNOWN
  )
}

module.exports = {
  arch,
  platform,
  networkInterfaces,
  type,

  get EOL () {
    if (/win/.test(type())) {
      return '\r\n'
    }

    return '\n'
  }
}
