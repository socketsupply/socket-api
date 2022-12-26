import fs from '../../../fs/promises.js'
import os from '../../../os.js'
import path from '../../../path.js'

import { test } from '@socketsupply/tapzero'

const TMPDIR = `${os.tmpdir()}${path.sep}`
const FIXTURES = /android/i.test(os.platform())
  ? '/data/local/tmp/ssc-io-test-fixtures/'
  : `${TMPDIR}ssc-io-test-fixtures${path.sep}`

test('fs.promises.access', async (t) => {
  let access = await fs.access(FIXTURES, fs.constants.F_OK)
  t.equal(access, true, '(F_OK) fixtures/ directory is accessible')

  access = await fs.access(FIXTURES, fs.constants.F_OK | fs.constants.R_OK)
  t.equal(access, true, '(F_OK | R_OK) fixtures/ directory is readable')

  access = await fs.access('.', fs.constants.W_OK)
  t.equal(access, true, '(W_OK) ./ directory is writable')

  access = await fs.access(FIXTURES, fs.constants.X_OK)
  t.equal(access, true, '(X_OK) fixtures/ directory is "executable" - can list items')
})

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
