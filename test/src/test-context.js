import { format } from '@socketsupply/io/util.js'
import process from '@socketsupply/io/process.js'
import ipc from '@socketsupply/io/ipc.js'

const parent = typeof window === 'object' ? window : globalThis
const OriginalError = parent.Error

import { GLOBAL_TEST_RUNNER } from 'tapzero'

// uncomment below to get IPC debug output in stdout
//ipc.debug.enabled = true
//ipc.debug.log = (...args) => console.log(...args)

if (typeof parent?.addEventListener === 'function') {
  parent.addEventListener('error', onerror)
  parent.addEventListener('unhandledrejection', onerror)
}

function onerror (err) {
  console.error(err.stack || err.reason || err.message || err)
  process.exit(1)
}

const pollTimeout = setTimeout(function poll () {
  if (GLOBAL_TEST_RUNNER.completed) {
    clearTimeout(pollTimeout)
    return process.exit(0)
  }

 setTimeout(poll, 500)
}, 500)

patchConsole('log')
patchConsole('info')
patchConsole('warn')
patchConsole('error')
patchConsole('debug')

function patchConsole (method) {
  const original = parent.console[method].bind(console)
  parent.console[method] = (...args) => original(format(...args))
}
