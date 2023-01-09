import { format } from '../util.js'
import console from '../console.js'
import socket from '../index.js'
import ipc from '../ipc.js'

let didInit = false

const AsyncFunction = (async () => void 0).constructor

socket.backend.open().then(() => {
  setTimeout(() => {
    ipc.send('process.write', {
      value: ipc.Message.from('repl.context.ready').toString()
    })
  })
})

// init from event
window.addEventListener('repl.context.init', (event) => {
  init(event.detail)
  console.log('• Welcome to Socket Runtime %s', process.version)
})

window.addEventListener('error', onerror)
window.addEventListener('unhandledrejection', onerror)

// uncomment below to get IPC debug output in stdout
if (socket.process.env.DEBUG) {
  ipc.debug.enabled = true
  ipc.debug.log = (...args) => console.log(...args)
}

function onerror (err) {
  if (socket.process.env.DEBUG) {
    console.error(makeError(err))
  }
}

export function init (opts) {
  const ctx = {
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

  window.socket = socket
  Object.defineProperties(window, {
    socket: { enumerable: true, configurable: false, value: socket },
    Socket: { enumerable: true, get: () => socket },
    global: { enumerable: true, get: () => window }
  })

  for (const fn of disabledFunctions) {
    window[fn] = () => console.warn(`WARN: ${fn}() is not available in the REPL context`)
  }

  for (const key in socket) {
    if (window[key] !== undefined) { continue }
    Object.defineProperty(window, key, {
      get: () => socket[key]
    })
  }

  window.addEventListener('repl.eval', (event) => {
    ctx.evaluate(event.detail)
  })

  window.addEventListener('exit', () => {
    ipc.send('exit')
  })
}

async function send (name, args) {
  const message = ipc.Message.from(name, args)
  return await ipc.send('process.write', { value: message.toString() })
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

function encode (data, err) {
  return JSON.stringify({
    // double encode to prevent JSON text from causing decodeURIComponent issues
    data: encodeURIComponent(encodeURIComponent(socket.util.format(data))),
    err: err || null
  })
}

export async function evaluate ({ cmd, id }) {
  try { cmd = decodeURIComponent(cmd) }
  catch (err) {}

  try {
    if (/\s*await/.test(cmd)) {
      const value = await new AsyncFunction(`return (${cmd})`)()
      return await send('repl.eval.result', {
        id,
        error: false,
        async: true,
        value: encode(value)
      })
    } else if (/\s*await\s*import\s*\(/.test(cmd)) {
      cmd = cmd.replace(/^\s*(let|const|var)\s+/, '')
      const value = await new AsyncFunction(`(${cmd})`)()
      return await send('repl.eval.result', {
        id,
        error: false,
        async: true,
        value: encode(value)
      })
    } else if (/\s*import\s*\(/.test(cmd)) {
      cmd = cmd.replace(/^\s*(let|const|var)\s+/, '')
      const value = new AsyncFunction(`(${cmd})`)()
      return await send('repl.eval.result', {
        id,
        error: false,
        async: true,
        value: encode(value)
      })
    }

    const result = await ipc.request('window.eval', { value: cmd })
    const parts = []
    const data = socket.util.format(result.data)
    const err = makeError(result.err)
    const max = 1024

    if (data.length > max) {
      let i = 0

      for (; i < data.length; i += max) {
        const offset = Math.min(data.length, i + max)
        parts.push(data.slice(i, offset))
      }
    } else {
      parts.push(data)
    }

    while (parts.length) {
      const part = parts.shift()
      if (!part) continue
      await send('repl.eval.result', {
        id,
        error: Boolean(err),
        value: encode(part, err),
        continue: parts.length > 0
      })

      if (err) {
        // just send the error
        break
      }
    }
  } catch (err) {
    return await send('repl.eval.result', {
      id,
      error: true,
      value: JSON.stringify({
        data: null,
        err: makeError(err)
      })
    })
  }
}
