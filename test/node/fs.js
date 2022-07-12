'use strict'

const mock = require('./mock')

const fs = require('../../node/fs/promises')
const { test } = require('tape')

test('FileHandle', async t => {
  mock.create(t, 'fsOpen',
    {},
    {}
  )

  const handle = await fs.open('./foo.txt')
  t.ok(handle.id.toString().length, 'handle provides an id')
})
