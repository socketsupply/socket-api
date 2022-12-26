import fs from '../../../fs/promises.js'
import os from '../../../os.js'
import path from '../../../path.js'

import { test } from '@socketsupply/tapzero'

const TMPDIR = `${os.tmpdir()}${path.sep}`
const FIXTURES = /android/i.test(os.platform())
  ? '/data/local/tmp/ssc-io-test-fixtures/'
  : `${TMPDIR}ssc-io-test-fixtures${path.sep}`

test('fs.promises.stat', async (t) => {
  let stats = await fs.stat(FIXTURES + 'file.txt')
  t.ok(stats, 'stats are returned')
  t.equal(stats.isFile(), true, 'stats are for a file')
  t.equal(stats.isDirectory(), false, 'stats are not for a directory')
  t.equal(stats.isSymbolicLink(), false, 'stats are not for a symbolic link')
  t.equal(stats.isSocket(), false, 'stats are not for a socket')
  t.equal(stats.isFIFO(), false, 'stats are not for a FIFO')
  t.equal(stats.isBlockDevice(), false, 'stats are not for a block device')
  t.equal(stats.isCharacterDevice(), false, 'stats are not for a character device')

  stats = await fs.stat(FIXTURES + 'directory')
  t.ok(stats, 'stats are returned')
  t.equal(stats.isFile(), false, 'stats are not for a file')
  t.equal(stats.isDirectory(), true, 'stats are for a directory')
  t.equal(stats.isSymbolicLink(), false, 'stats are not for a symbolic link')
  t.equal(stats.isSocket(), false, 'stats are not for a socket')
  t.equal(stats.isFIFO(), false, 'stats are not for a FIFO')
  t.equal(stats.isBlockDevice(), false, 'stats are not for a block device')
  t.equal(stats.isCharacterDevice(), false, 'stats are not for a character device')
})
