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

test('window.document.title', (t) => {
  t.equal(typeof window.name, 'string', 'window.name is a string')
  t.equal( window.name, '', 'window.name is an empty ')
  window.name = 'foo'
  t.equal(window.name, 'foo', 'window.name is set to "foo"')
  t.equal(window.__args.title, 'foo', 'window.name is set to "foo"')
  t.equal(args.title, 'foo', 'window.name is set to "foo"')
})
