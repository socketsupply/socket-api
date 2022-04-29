'use strict'

const mock = require('./mock')
const fs = require('../fs')
const { test } = require('tape')

test('FileHandler', async t => {
  // TODO write this test...
  mock.create(t, 'fsOpen',
    {},
    {}
  )

  const handle = await fs.open('./foo.txt')
  t.ok(handle.fd.toString().length, 'handle provides an fd')
})
