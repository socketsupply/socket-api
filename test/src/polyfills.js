import { applyPolyFills } from '@socketsupply/io/polyfills.js'
import { test } from 'tapzero'
import { args } from '@socketsupply/io/runtime.js'

test('applyPolyFills', (t) => {
  t.equal(typeof applyPolyFills, 'function', 'applyPolyFills is a function')
  applyPolyFills(globalThis.window)
})

test('window.resizeTo', (t) => {
  t.equal(typeof window.resizeTo, 'function', 'window.resizeTo is a function')
  t.ok(window.resizeTo(100, 100), 'succesfully completes')
})

// FIXME: this test is failing
// test('window.showOpenFilePicker', (t) => {
//   t.equal(typeof window.showOpenFilePicker, 'function', 'window.showOpenFilePicker is a function')
//   t.ok(window.showOpenFilePicker())
// })

// FIXME: this test is failing
// test('window.showSaveFilePicker', (t) => {
//   t.equal(typeof window.showSaveFilePicker, 'function', 'window.showSaveFilePicker is a function')
//   t.ok(window.showSaveFilePicker())
// })

// FIXME: this test is failing
// test('window.showDirectoryPicker', (t) => {
//   t.equal(typeof window.showDirectoryPicker, 'function', 'window.showDirectoryPicker is a function')
//   t.ok(window.showDirectoryPicker())
// })

test('window.document.title', async (t) => {
  t.equal(window.document.title, args.title, 'window.document.title equals args.title')
  window.document.title = 'test'
  t.equal(window.document.title, 'test', 'window.document.title is has been changed')
  // because of MutationObserver we need to wait for the next tick
  await new Promise((resolve) => setTimeout(resolve, 0))
  // TODO: check immutability of window.__args instead
  t.notEqual(window.__args.title, 'test', 'window.__args.title is set to "test"')
  t.equal(args.title, 'test', 'args.title is set to "test"')
})
