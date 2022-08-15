import { test } from 'tapzero'
import process from '@socketsupply/io/process.js' 

test('process', (t) => {
  t.ok(typeof process.addListener === 'function', 'process is an EventEmitter')
})

test('process.homedir()', (t) => {
  t.equal(process.homedir(), process.cwd(), 'process.homedir() returns a correct value')
})

test('process.exit()', (t) => {
  t.ok(typeof process.exit === 'function', 'process.exit() is a function')
})

test('process.cwd', (t) => {
  // TODO: check the path is correct
  t.ok(typeof process.cwd() === 'string', 'process.cwd() returns a string')
})

test('process.platform', (t) => {
  t.ok(typeof process.platform === 'string', 'process.platform() returns an string')
})

test('process.config', (t) => {
  t.ok(typeof process.config === 'object', 'process.config() returns an object')
})
