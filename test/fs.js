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
    const handle = await fs.open('/foo/bar/bazz.txt')
    t.ok(handle.id.length > 8, 'handle provides an id')
    t.end()
  } catch (err) {
    t.fail(err)
  }
})
