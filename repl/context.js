import { format } from '../util.js'
import * as ipc from '../ipc.js'
import * as io from '../index.js'

let marker = -1
let didInit = false

const AsyncFunction = (async () => void 0).constructor

// init from event
window.addEventListener('repl.context.init', (event) => {
  init(event.detail)
  console.log('Welcome to SSC %s', process.version)
})

window.addEventListener('error', onerror)
window.addEventListener('unhandledrejection', onerror)

// uncomment below to get IPC debug output in stdout
if (io.process.env.DEBUG) {
  ipc.debug.enabled = true
  ipc.debug.log = (...args) => console.log(...args)
}

function onerror (err) {
  if (io.process.env.DEBUG) {
    console.error(makeError(err))
  }
}

export function init (opts) {
  const ctx = {
    patchConsole,
    evaluate,
    ...opts
  }

  if (didInit) {
    return
  }

  didInit = true

  const disabledFunctions = [
    'alert',
    'blur',
    'close',
    'confirm',
    'focus',
    'moveBy',
    'moveTo',
    'openDialog',
    'print',
    'prompt',
    'resizeBy',
    'resizeTo',
    'scrollTo',
    'scroll',
    'stop'
  ]

  window.io = io

  for (const fn of disabledFunctions) {
    window[fn] = () => console.warn(`WARN: ${fn}() is not available in the REPL context`)
  }

  for (const key in io) {
    if (window[key] !== undefined) { continue }
    Object.defineProperty(window, key, {
      get: () => io[key]
    })
  }

  ctx.patchConsole('log')
  ctx.patchConsole('info')
  ctx.patchConsole('warn')
  ctx.patchConsole('error')
  ctx.patchConsole('debug')

  window.addEventListener('repl.eval', (event) => {
    ctx.evaluate(event.detail)
  })
}

function patchConsole (method) {
  const original = console[method].bind(console)
  console[method] = (...args) => original(format(...args))
}

function makeError (err) {
  if (!err) { return null }
  const error = {}
  const message = String(err.message || err.reason || err.stack || err)
  error.message = message
    .replace(window.location.href, '')
    .trim()
    .split(' ')
    .slice(1)
    .join(' ')

  error.stack = [
    `${error.message || 'Error:'}`,
    ...(err.stack || '').split('\n').slice(1).map((s) => `    at ${s}`)
  ]

  const stack = (message.match(RegExp(`(${window.location.href}:[0-9]+:[0-9]+):\s*`)) || [])[1]

  if (stack) {
    error.stack.push(`    at ${stack}`)
  }

  error.stack = error.stack.filter(Boolean).join('\n')

  if (err.cause) {
    error.cause = err.cause
  }

  return error
}

export async function evaluate ({ cmd, id }) {
  try {
    if (/\s*await\s*import\s*\(/.test(cmd)) {
      cmd = cmd.replace(/^\s*(let|const|var)\s+/, '')
      const value = await new AsyncFunction(`(${cmd})`)()
      return await ipc.send('repl.eval.result', {
        id,
        error: false,
        value: JSON.stringify({ data: io.util.format(value) })
      })
    } else if (/\s*import\s*\(/.test(cmd)) {
      cmd = cmd.replace(/^\s*(let|const|var)\s+/, '')
      const value = new AsyncFunction(`(${cmd})`)()
      return await ipc.send('repl.eval.result', {
        id,
        error: false,
        value: JSON.stringify({ data: io.util.format(value) })
      })
    }

    const result = await ipc.request('window.eval', { value: cmd })
    return await ipc.send('repl.eval.result', {
      id,
      error: Boolean(result.err),
      value: JSON.stringify({
        data: io.util.format(result.data),
        err: makeError(result.err)
      })
    })
  } catch (err) {
    return await ipc.send('repl.eval.result', {
      id,
      error: true,
      value: JSON.stringify({
        data: null,
        err: makeError(err)
      })
    })
  }
}
