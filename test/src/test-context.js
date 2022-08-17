import { format } from '@socketsupply/io/util.js'
import process from '@socketsupply/io/process'
import ipc from '@socketsupply/io/ipc'

import { GLOBAL_TEST_RUNNER } from 'tapzero'

const parent = typeof window === 'object' ? window : globalThis

ipc.debug.enabled = true
ipc.debug.write = (...args) => console.log(...args) // uncomment to get IPC debug output

if (typeof parent?.addEventListener === 'function') {
  parent.addEventListener('error', onerror)
  parent.addEventListener('unhandledrejection', onerror)
}

function onerror (err) {
  console.error(err.stack || err.message || err.reason || err)
  process.exit(1)
}

const pollTimeout = setTimeout(function poll () {
  if (GLOBAL_TEST_RUNNER.completed) {
    clearTimeout(pollTimeout)
    return process.exit(0)
  }

 setTimeout(poll)
})

patchConsole('log')
patchConsole('info')
patchConsole('warn')
patchConsole('error')
patchConsole('debug')

function patchConsole (method) {
  const original = parent.console[method].bind(console)
  parent.console[method] = (...args) => original(format(...args))
}
