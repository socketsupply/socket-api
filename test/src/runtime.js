import runtime from '@socketsupply/io/runtime.js'
import { test } from 'tapzero'

const argsKeys = [
  'arch',
  'argv',
  'debug',
  'env',
  'executable',
  'index',
  'os',
  'platform',
  'port',
  'title',
  'version',
  'config'
]

test('args', async (t) => {
  t.equal(runtime.args.constructor.name, 'Args', 'args is an Args instance')
  t.deepEqual(Object.keys(runtime.args).sort(), argsKeys.sort(), 'args has expected keys')
  argsKeys.filter((key) => key !== 'config' && key !== 'cwd').forEach((key) => {
    t.equal(runtime.args[key], window.__args[key], `args.${key} is correct`)
  })
  t.equal(runtime.args.cwd(), window.__args.cwd(), 'args.cwd() is correct')
  t.equal(runtime.args.config.constructor.name, 'Config', 'args.config is a Config instance')
  t.equal(runtime.args.config.size, Object.keys(runtime.args).length, 'args.config.size is correct')
  t.throws(
    () => runtime.args.config.size = 0,
    RegExp('Attempted to assign to readonly property.'),
    'args.config.size is read-only'
  )
  argsKeys.forEach((key) => {
    t.equal(runtime.args.config.get(key), runtime.args[key], `args.config.get('${key}') is correct`)
  })
})
