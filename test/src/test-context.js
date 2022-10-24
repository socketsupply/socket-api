import { GLOBAL_TEST_RUNNER } from 'tapzero'
import process from '@socketsupply/io/process.js'
import '@socketsupply/io/runtime.js'

// uncomment below to get IPC debug output in stdout
// import ipc from '@socketsupply/io/ipc.js'
// ipc.debug.enabled = true
// ipc.debug.log = (...args) => console.log(...args)

if (typeof globalThis?.addEventListener === 'function') {
  globalThis.addEventListener('error', onerror)
  globalThis.addEventListener('unhandledrejection', onerror)
}

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
