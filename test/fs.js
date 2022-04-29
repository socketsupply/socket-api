'use strict'

const fs = require('../fs').promises
const { test } = require('tape')
const mock = require('./mock')

test('FileHandler', async t => {
  mock.create(t, 'fsOpen',
    {},
    {}
  )

  const handle = await fs.open('./foo.txt')
  t.ok(handle.fd.toString().length, 'handle provides an fd')
})
