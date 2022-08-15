import { test } from 'tapzero'
import process from '@socketsupply/io/process.js' 
import path from `path-browserify`

test('process', (t) => {
  t.ok(typeof process.addListener === 'function', 'process is an EventEmitter')
})

test('process.homedir()', (t) => {
  t.ok(typeof process.homedir() === 'string', 'process.homedir() returns a string')
})

test('process.exit()', (t) => {
  t.ok(typeof process.exit === 'function', 'process.exit() is a function')
})

test('process.cwd', (t) => {
  t.ok(typeof process.cwd() === 'string', 'process.cwd() returns a string')
  if (process.platform  !== 'win32') {
    t.equal(process.cwd(), path.resolve(process.argv0, '../../Resources'), 'process.cwd() returns a correct value')
  }
})

test('process.platform', (t) => {
  t.ok(typeof process.platform === 'string', 'process.platform() returns an string')
})

test('process.config', (t) => {
  t.ok(typeof process.config === 'object', 'process.config() returns an object')
})
