'use strict'

const { toProperCase } = require('./util')
const ipc = require('./ipc')

const UNKNOWN = 'unknown'

function arch () {
  if (typeof window !== 'object') {
    if (typeof process === 'object' && typeof process.arch === 'string') {
      return process.arch
    }

    return UNKNOWN
  }

  const value = (
    window.process?.arch ||
    ipc.sendSync('getPlatformArch')?.value?.data ||
    UNKNOWN
  )

  if (value === 'arm64') {
    return value
  }

  return value
    .replace('x86_64', 'x64')
    .replace('x86', 'ia32')
    .replace(/arm.*/, 'arm')
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
  if (typeof window !== 'object') {
    if (typeof process === 'object' && typeof process.platform === 'string') {
      return process.platform
    }

    return UNKNOWN
  }

  return (
    window.process?.os ||
    ipc.sendSync('getPlatformOS')?.value?.data ||
    window.process?.platform ||
    UNKNOWN
  )
}

function type () {
  if (typeof window !== 'object') {
    switch (platform()) {
      case 'linux': return 'Linux'
      case 'darnwin': return 'Darwin'
      case 'win32': return 'Windows' // Windows_NT?
    }

    return UNKNOWN
  }

  const value = (
    window.process?.platform ||
    ipc.sendSync('getPlatformType')?.value?.data ||
    UNKNOWN
  )

  return toProperCase(value)
}

module.exports = {
  arch,
  platform,
  networkInterfaces,
  type,

  get EOL () {
    if (/win/i.test(type())) {
      return '\r\n'
    }

    return '\n'
  }
}
