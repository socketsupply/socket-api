import * as ipc from '@socketsupply/io/ipc.js'
import { test } from 'tapzero'
import { Buffer } from '@socketsupply/io/buffer.js'

test('ipc exports', async (t) => {
  t.deepEqual(Object.keys(ipc), [
    'ERROR',
    'Message',
    'OK',
    'Result',
    'TIMEOUT',
    'createBinding',
    'debug',
    'default',
    'emit',
    'kDebugEnabled',
    'parseSeq',
    'ready',
    'request',
    'resolve',
    'send',
    'sendSync',
    'write'
  ])
  try {
    await ipc.ready()
  } catch (err) {
    t.fail(err)
  }
})

test('ipc constants', (t) => {
  t.equal(ipc.OK, 0)
  t.equal(ipc.ERROR, 1)
  t.equal(ipc.TIMEOUT, 32000)
  t.equal(ipc.kDebugEnabled, Symbol.for('ipc.debug.enabled'))
})

test('ipc.debug', (t) => {
  t.equal(ipc.debug.enabled, true)
  ipc.debug(false)
  t.equal(ipc.debug.enabled, false)
})

test('ipc.Message', (t) => {
  t.ok(ipc.Message.prototype instanceof URL, 'is a URL')
  console.log('ipc.Message', ipc.Message)
  let msg = ipc.Message.from(Buffer.from('test'), { foo: 'bar' })
  t.equal(msg.protocol, 'ipc:')
  t.equal(msg.command, 'test')
  t.deepEqual(msg.params, { foo: "bar" })
  msg = ipc.Message.from(msg)
  t.equal(msg.protocol, 'ipc:')
  t.equal(msg.command, 'test')
  t.deepEqual(msg.params, { foo: "bar" })
  msg = ipc.Message.from({ protocol: 'ipc:', command: 'test'}, { foo: 'bar' })
  t.equal(msg.protocol, 'ipc:')
  t.equal(msg.command, 'test')
  t.deepEqual(msg.params, { foo: "bar" })
  msg = ipc.Message.from('test', { foo: 'bar' })
  t.equal(msg.protocol, 'ipc:')
  t.equal(msg.command, 'test')
  t.deepEqual(msg.params, { foo: "bar" })
  t.ok(ipc.Message.isValidInput("ipc://test"), 'is valid input')
  t.ok(!ipc.Message.isValidInput("test"), 'is valid input')
  t.ok(!ipc.Message.isValidInput("foo://test"), 'is valid input')
})

test('ipc.sendSync not found', (t) => {
  const response = ipc.sendSync('test', { foo: 'bar' })
  t.ok(response instanceof ipc.Result)
  const {err} = response
  t.equal(err.toString(), 'NotFoundError: Not found')
  t.equal(err.name, 'NotFoundError')
  t.equal(err.message, 'Not found')
  t.equal(err.url, 'ipc://test?foo=bar&index=0&seq=R1')
  t.equal(err.code, 'NOT_FOUND_ERR')
})

test('ipc.sendSync success', (t) => {
  const response = ipc.sendSync('getPlatformArch')
  t.ok(response instanceof ipc.Result)
  const {data} = response
  t.ok(['x86_64', 'arm64'].includes(data))
})
