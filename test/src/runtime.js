import runtime from '@socketsupply/io/runtime.js'
import { readFile } from '@socketsupply/io/fs/promises.js'
import ipc from '@socketsupply/io/ipc.js'
import { test } from 'tapzero'

// Polyfills
test('window.resizeTo', async (t) => {
  t.equal(typeof window.resizeTo, 'function', 'window.resizeTo is a function')
  t.ok(window.resizeTo(420, 200), 'succesfully completes')
  const { data: { width, height } } = await ipc.send('window')
  t.equal(width, 420, 'width is 420')
  t.equal(height, 200, 'heigth is 200')
})

test('window.showOpenFilePicker', (t) => {
  t.equal(typeof window.showOpenFilePicker, 'function', 'window.showOpenFilePicker is a function')
  // FIXME: this test is failing
  // t.ok(window.showOpenFilePicker())
})

test('window.showSaveFilePicker', (t) => {
  t.equal(typeof window.showSaveFilePicker, 'function', 'window.showSaveFilePicker is a function')
  // FIXME: this test is failing
  // t.ok(window.showSaveFilePicker())
})

// FIXME: this test is failing
test('window.showDirectoryFilePicker', (t) => {
  t.equal(typeof window.showDirectoryFilePicker, 'function', 'window.showDirectoryFilePicker is a function')
  // FIXME: this test is failing
  // t.ok(window.showDirectoryFilePicker())
})

test('window.document.title', async (t) => {
  window.document.title = 'test111'
  t.equal(window.document.title, 'test111', 'window.document.title is has been changed')
  t.notEqual(window.__args.title, window.document.title, 'window.__args.title is not changed')
  const { data: { title } } = await ipc.send('window')
  t.equal(title, 'test111', 'window title is correct')
})

// Other runtime tests
test('windows', async (t) => {
  const { data: windows } = await runtime.windows()
  t.ok(Array.isArray(windows), 'windows is an array')
  t.ok(windows.length > 0, 'windows is not empty')
  t.ok(windows.every(w => Number.isInteger(w)), 'windows are integers')
  t.deepEqual(windows, [0, 1], 'windows are correct') 
})

test('currentWindow', (t) => {
  t.equal(runtime.currentWindow, window.__args.index, 'runtime.currentWindow equals window.__args.index')
  t.equal(runtime.currentWindow, 0, 'runtime.currentWindow equals 0')
  t.throws(() => runtime.currentWindow = 1, 'runtime.currentWindow is immutable')
})

test('debug', (t) => {
  t.equal(runtime.debug, window.__args.debug, 'debug is correct')
  t.throws(() => runtime.debug = 1, 'debug is immutable')
})

test ('config', async (t) => {
  const rawConfig = await readFile('ssc.config', 'utf8')
  const config = rawConfig
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.startsWith('#'))
    .map(line => line.split(':'))
    .map(([key, value]) => [key.trim(), value.trim()])
  config.filter(([key]) => !(key = 'headless')).forEach(([key, value]) => {
    t.equal(runtime.config[key], value, `runtime.config.'${key}' is correct`)
    t.throws(
      () => runtime.config[key] = 0,
      RegExp('Attempted to assign to readonly property.'),
      `runtime.config.${key} is read-only`
    )
  })
  t.equal(runtime.config.headless, true, 'runtime.config.headless is correct')
})

// TODO: add resulting ipc message to output and test it?

test('openExternal', async (t) => {
  t.equal(typeof runtime.openExternal, 'function', 'openExternal is a function')
  // can't test results without browser
  // t.equal(await runtime.openExternal('https://sockets.sh'), null, 'succesfully completes')
})

// TODO: allow this function to work with other windows besides the current one
test('setTitle', async (t) => {
  t.equal(typeof runtime.setTitle, 'function', 'setTitle is a function')
  const result = await runtime.setTitle('test')
  t.equal(result.err, null, 'succesfully completes')
})

// TODO: it crashes the app
test('inspect', async (t) => {
  t.equal(typeof runtime.inspect, 'function', 'inspect is a function')
})

// TODO: test in non-headless mode
test('show', async (t) => {
  t.equal(typeof runtime.show, 'function', 'show is a function')
  const result = await runtime.show({ 
    window: 1,
    url: 'index2.html',
    title: 'Hello World',
    width: 400,
    height: 400,
  })
  t.equal(result.err, null, 'show succeeds')
})

test('hide', async (t) => {
  t.equal(typeof runtime.hide, 'function', 'hide is a function')
  const result = await runtime.hide({ window: 1 })
  t.equal(result.err, null, 'hide succeeds')
})

test('navigate', async (t) => {
  t.equal(typeof runtime.navigate, 'function', 'navigate is a function')
  const result = await runtime.navigate({ window: 1, url: 'index2.html' })
  t.equal(result.err, null, 'navigate succeeds')
})

// TODO: allow this function to work with other windows besides the current one
test('setWindowBackgroundColor', async (t) => {
  t.equal(typeof runtime.setWindowBackgroundColor, 'function', 'setWindowBackgroundColor is a function')
  const result = await runtime.setWindowBackgroundColor({ red: 0, green: 0, blue: 0, alpha: 0 })
  // TODO: should be result.err === null?
  t.equal(result, null, 'setWindowBackgroundColor succeeds')
})

// FIXME: it hangs
test('setContextMenu', async (t) => {
  t.equal(typeof runtime.setContextMenu, 'function', 'setContextMenu is a function')
  // const result = await runtime.setContextMenu({ 'Foo': '', 'Bar': '' })
  // t.equal(result, null, 'setContextMenu succeeds')
})

test('setSystemMenuItemEnabled', async (t) => {
  t.equal(typeof runtime.setSystemMenuItemEnabled, 'function', 'setSystemMenuItemEnabled is a function')
  const result = await runtime.setSystemMenuItemEnabled({ indexMain: 0, indexSub: 0, enabled: true })
  t.equal(result.err, null, 'setSystemMenuItemEnabled succeeds')
})

test('setSystemMenu', async (t) => {
  t.equal(typeof runtime.setSystemMenu, 'function', 'setSystemMenuItemVisible is a function')
  const result = await runtime.setSystemMenu({ index: 0, value: `
    App:
      Foo: f;
      Edit:
      Cut: x
      Copy: c
      Paste: v
      Delete: _
      Select All: a;
      Other:
      Apple: _
      Another Test: T
      !Im Disabled: I
      Some Thing: S + Meta
      ---
      Bazz: s + Meta, Control, Alt;
  `})
  t.equal(result.err, null, 'setSystemMenuItemVisible succeeds')
})

// TODO: can we improve this test?
test('reload', (t) => {
  t.equal(typeof runtime.reload, 'function', 'reload is a function')
})

// We don't need to test runtime.exit. It works if the app exits after the tests.
