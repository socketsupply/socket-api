import * as ipc from './ipc.js'
import { applyPolyFills } from './polyfills.js'

export const args = new class Args {
  arch = window.__args.arch
  argv = window.__args.argv || []
  debug = window.__args.debug || false
  env = window.__args.env || {}
  executable = window.__args.executable || null
  index = window.__args.index || 0
  port = window.__args.port || 0
  title = window.__args.title || null
  version = window.__args.version || null

  config = new class Config {
    get size () {
      return Object.keys(this).length
    }

    get (key) {
      if (typeof key !== 'string') {
        throw new TypeError('Expecting key to be a string.')
      }

      key = key.toLowerCase()
      return key in this ? this[key] : null
    }
  }

  // overloaded in process
  cwd () {
    return null
  }
}

if (globalThis.window) {
  applyPolyFills(globalThis.window)
}

function send () {
  let value = ''

  try {
    value = JSON.stringify(o)
  } catch (err) {
    return Promise.reject(err.message)
  }

  return ipc.send('send', { value })
}

function redirectOutput () {
  const clog = console.log
  const cerr = console.error

  console.log = (...args) => {
    clog(...args)
    ipc.postMessage(`ipc://stdout?value=${args}`)
  }

  console.error = (...args) => {
    cerr(...args)
    ipc.postMessage(`ipc://stderr?value=${args}`)
  }
}

if (args.platform !== 'linux') {
  redirectOutput()
}

export const openExternal = o => {
  ipc.postMessage(`ipc://external?value=${encodeURIComponent(o)}`)
}

export function exit (o) {
  return ipc.send('exit', o)
}

export function setTitle (o) {
  return ipc.send('title', o)
}

export function inspect (o) {
  ipc.postMessage(`ipc://inspect`)
}

export function show (index = 0) {
  return ipc.send('show', { index })
}

export function hide = (index = 0) {
  return ipc.send('hide', { index })
}

export function setWindowBackgroundColor (opts) {
  opts.index = window.__args.index
  const o = new URLSearchParams(opts).toString()
  ipc.postMessage(`ipc://background?${o}`)
}

export function setContextMenu (o) {
  o = Object
    .entries(o)
    .flatMap(a => a.join(':'))
    .join('_')
  return ipc.send('context', o)
}

export function setSystemMenuItemEnabled (value) {
  return ipc.send('systemMenuItemEnabled', value)
}

export function setSystemMenu (o) {
  const menu = o.value

  // validate the menu
  if (typeof menu !== 'string' || menu.trim().length === 0) {
    throw new Error('Menu must be a non-empty string')
  }

  const menus = menu.match(/\w+:\n/g)
  if (!menus) {
    throw new Error('Menu must have a valid format')
  }
  const menuTerminals = menu.match(/;/g)
  const delta = menus.length - (menuTerminals?.length ?? 0)

  if ((delta !== 0) && (delta !== -1)) {
    throw new Error(`Expected ${menuTerminals.length} ';', found ${menus}.`)
  }

  const lines = menu.split('\n')
  const e = new Error()
  const frame = e.stack.split('\n')[2]
  const callerLineNo = frame.split(':').reverse()[1]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const l = Number(callerLineNo) + i

    let errMsg

    if (line.trim().length === 0) continue
    if (/.*:\n/.test(line)) continue // ignore submenu labels
    if (/---/.test(line)) continue // ignore separators
    if (/\w+/.test(line) && !line.includes(':')) {
      errMsg = 'Missing label'
    } else if (/:\s*\+/.test(line)) {
      errMsg = 'Missing accelerator'
    } else if (/\+(\n|$)/.test(line)) {
      errMsg = 'Missing modifier'
    }

    if (errMsg) {
      throw new Error(`${errMsg} on line ${l}: "${line}"`)
    }
  }

  // send the request to set the menu
  return ipc.send('menu', o)
}
