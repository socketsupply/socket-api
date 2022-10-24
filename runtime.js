/**
 * @module Runtime
 *
 * Provides runtime-specific methods
 */

/* global window */
import { applyPolyFills } from './polyfills.js'
import { format } from './util.js'
import ipc from './ipc.js'

// eslint-disable-next-line
export const args = new class Args {
  arch = window?.__args?.arch
  argv = window?.__args?.argv || []
  debug = window?.__args?.debug || false
  env = window?.__args?.env || {}
  executable = window?.__args?.executable || null
  index = window?.__args?.index || 0
  os = window?.__args?.os
  platform = window?.__args?.platform
  port = window?.__args?.port || 0
  title = window?.__args?.title || null
  version = window?.__args?.version || null

  // eslint-disable-next-line
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

export async function send (options) {
  let value = ''

  try {
    value = JSON.stringify(options)
  } catch (err) {
    return Promise.reject(err.message)
  }

  return await ipc.send('send', { value })
}

function redirectOutput () {
  const mapping = {
    stdout: ['info', 'log'],
    stderr: ['debug', 'error', 'warn']
  }

  for (const name of mapping.stdout) {
    const fn = console[name]
    console[name] = (...args) => {
      const value = encodeURIComponent(args.map((arg) => format(arg)).join(' '))
      ipc.postMessage(`ipc://stdout?value=${value}`)
      return fn.apply(console, args)
    }
  }

  for (const name of mapping.stderr) {
    const fn = console[name]
    console[name] = (...args) => {
      const value = encodeURIComponent(args.map((arg) => format(arg)).join(' '))
      ipc.postMessage(`ipc://stderr?value=${value}`)
      return fn.apply(console, args)
    }
  }
}

// FIXME: this should be platform agnostic
if (args.platform !== 'linux') {
  redirectOutput()
}

export async function openExternal (options) {
  return await ipc.postMessage(`ipc://external?value=${encodeURIComponent(options)}`)
}

/**
 * Quits the backend process and then quits the render process, the exit code used is the final exit code to the OS.
 * @param {object} options - an options object
 * @return {Promise<Any>}
 */
export async function exit (o) {
  return await ipc.send('exit', o)
}

/**
 * Sets the title of the window (if applicable).
 * @param {obnject} options - an options object
 * @return {Promise<Any>}
 */
export async function setTitle (o) {
  return await ipc.send('title', o)
}

export async function inspect (o) {
  return await ipc.postMessage('ipc://inspect')
}

export async function show (index = 0) {
  return await ipc.send('show', { index })
}

export async function hide (index = 0) {
  return await ipc.send('hide', { index })
}

export async function setWindowBackgroundColor (opts) {
  opts.index = window.__args.index
  const o = new URLSearchParams(opts).toString()
  await ipc.postMessage(`ipc://background?${o}`)
}

/**
 * Opens a native context menu.
 * @param {object} options - an options object
 * @return {Promise<Any>}
 */
export async function setContextMenu (o) {
  o = Object
    .entries(o)
    .flatMap(a => a.join(':'))
    .join('_')
  return await ipc.send('context', o)
}

export async function setSystemMenuItemEnabled (value) {
  return await ipc.send('systemMenuItemEnabled', value)
}

/**
 * Set the native menu for the app.
 *
 * @param {object} options - an options object
 * @param {string} options.value - the menu layout
 * @param {number} options.index - the window to target (if applicable)
 * @return {Promise<Any>}
 *
 * Socket Runtime provides a minimalist DSL that makes it easy to create
 * cross platform native system and context menus.
 *
 * Menus are created at run time. They can be created from either the Main or
 * Render process. The can be recreated instantly by calling the `setSystemMenu` method.
 *
 * The method takes a string. Here's an example of a menu. The semi colon is
 * significant indicates the end of the menu. Use an underscore when there is no
 * accelerator key. Modifiers are optional. And well known OS menu options like
 * the edit menu will automatically get accelerators you dont need to specify them.
 *
 *
 * ```js
 * io.runtime.setSystemMenu({ index: 0, value: `
 *   App:
 *     Foo: f;
 *
 *   Edit:
 *     Cut: x
 *     Copy: c
 *     Paste: v
 *     Delete: _
 *     Select All: a;
 *
 *   Other:
 *     Apple: _
 *     Another Test: T
 *     !Im Disabled: I
 *     Some Thing: S + Meta
 *     ---
 *     Bazz: s + Meta, Control, Alt;
 * `)
 * ```
 *
 * #### Separators
 *
 * To create a separator, use three dashes `---`.
 *
 * #### Accelerator Modifiers
 *
 * Accelerator modifiers are used as visual indicators but don't have a
 * material impact as the actual key binding is done in the event listener.
 *
 * A capital letter implies that the accelerator is modified by the `Shift` key.
 *
 * Additional accelerators are `Meta`, `Control`, `Option`, each separated
 * by commas. If one is not applicable for a platform, it will just be ignored.
 *
 * On MacOS `Meta` is the same as `Command`.
 *
 * #### Disabled Items
 *
 * If you want to disable a menu item just prefix the item with the `!` character.
 * This will cause the item to appear disabled when the system menu renders.
 *
 * #### Submenus
 *
 * We feel like nested menus are an anti-pattern. We don't use them. If you have a
 * strong argument for them and a very simple pull request that makes them work we
 * may consider them.
 *
 * #### Event Handling
 *
 * When a menu item is activated, it raises the `menuItemSelected` event in
 * the front end code, you can then communicate with your backend code if you
 * want from there.
 *
 * For example, if the `Apple` item is selected from the `Other` menu...
 *
 * ```js
 * window.addEventListener('menuItemSelected', event => {
 *   assert(event.detail.parent === 'Other')
 *   assert(event.detail.title === 'Apple')
 * })
 * ```
 *
 */
export async function setSystemMenu (o) {
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

  return await ipc.send('menu', o)
}

// eslint-disable-next-line
import * as exports from './runtime.js'
export default exports