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

function makeError (err) {
  if (!err) { return null }
  const error = {}
  const message = String(err.message || err.reason || err)
  error.message = message
    .replace(window.location.href, '')
    .trim()
    .split(' ')
    .slice(1)
    .join(' ')

  error.stack = [
    `${error.message || 'Error:'}`,
    ...(err.stack || '').split('\n').map((s) => `  at ${s}`)
  ]

  const stack = (message.match(RegExp(`(${window.location.href}:[0-9]+:[0-9]+):\s*`)) || [])[1]

  if (stack) {
    error.stack.push('  at ' + stack)
  }

  error.stack = error.stack.filter(Boolean).join('\n')

  if (err.cause) {
    error.cause = err.cause
  }

  return error
}

function onerror (err) {
  console.error(makeError(err))
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
