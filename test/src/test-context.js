import { GLOBAL_TEST_RUNNER } from 'tapzero'
import { format } from '@socketsupply/io/util.js'
import process from '@socketsupply/io/process.js'

const global = typeof window === 'object' ? window : globalThis

// uncomment below to get IPC debug output in stdout
// import ipc from '@socketsupply/io/ipc.js'
// ipc.debug.enabled = true
// ipc.debug.log = (...args) => console.log(...args)

if (typeof global?.addEventListener === 'function') {
  global.addEventListener('error', onerror)
  global.addEventListener('unhandledrejection', onerror)
}

['log', 'info', 'warn', 'error', 'debug'].forEach(patchConsole)

const pollTimeout = setTimeout(function poll () {
  if (GLOBAL_TEST_RUNNER.completed) {
    clearTimeout(pollTimeout)
    return process.exit(0)
  }

  setTimeout(poll, 500)
}, 500)

function onerror (err) {
  console.error(err.stack || err.reason || err.message || err)
  process.exit(1)
}

function patchConsole (method) {
  const original = global.console[method].bind(console)
  global.console[method] = (...args) => original(format(...args))
}
