import { promisify } from 'node:util'
import { test } from 'tapzero'

import mock from './mock.js'
import fs from '../fs/index.js'

test('FileHandle', async t => {
  mock.create(t, 'fsOpen',
    {},
    {}
  )

  const handle = await fs.promises.open('./foo.txt')
  t.ok(handle.id.toString().length, 'handle provides an id')
})

test('nodejs.util.promisify.custom', (t) => {
  for (const key in fs) {
    const value = fs[key]
    if (typeof fs.promises[key] === 'function') {
      t.equal(promisify(value), fs.promises[key], `promisify(fs.${key})`)
    }
  }
})
