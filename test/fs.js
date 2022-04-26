'use strict'

const mock = require('./mock')
const fs = require('../fs')
const { test } = require('tape')

test('fsOpen', async t => {
  // TODO write this test...
  mock.create(t, 'fsOpen',
    {},
    {}
  )

  try {
    const handle = await fs.open('./foo.txt')
    t.ok(handle.fd.toString().length > 8, 'handle provides an fd')
    t.end()
  } catch (err) {
    t.fail(err)
  }
})

test('fsClose', async t => {
  t.fail(true)
})

test('fsWrite', async t => {
  t.fail(true)
})

test('fsRead', async t => {
  t.fail(true)
})

test('fsRmDir', async t => {
  t.fail(true)
})

test('fsReadDir', async t => {
  t.fail(true)
})

test('fsUnlink', async t => {
  t.fail(true)
})

test('fsCopy', async t => {
  t.fail(true)
})
