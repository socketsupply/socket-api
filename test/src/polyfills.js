import { applyPolyFills } from '@socketsupply/io/polyfills.js'
import { test } from 'tapzero'
import ipc from '@socketsupply/io/ipc.js'

test('applyPolyFills', (t) => {
  t.equal(typeof applyPolyFills, 'function', 'applyPolyFills is a function')
  applyPolyFills(globalThis.window)
})

test('window.resizeTo', async (t) => {
  t.equal(typeof window.resizeTo, 'function', 'window.resizeTo is a function')
  t.ok(window.resizeTo(420, 200), 'succesfully completes')
  const { data: { width, height } } = await ipc.send('window')
  t.equal(width, 420, 'width is 420')
  t.equal(height, 200, 'heigth is 200')
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
  window.document.title = 'test111'
  t.equal(window.document.title, 'test111', 'window.document.title is has been changed')
  t.notEqual(window.__args.title, window.document.title, 'window.__args.title is not changed')
  const { data: { title } } = await ipc.send('window')
  t.equal(title, 'test111', 'window title is correct')
})
