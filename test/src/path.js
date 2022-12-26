import path from '../../path.js'
import os from '../../os.js'

import { test } from '@socketsupply/tapzero'

test('path', (t) => {
  t.ok(path, 'path exports')
  t.ok(path.posix, 'path.posix exports')
  t.ok(path.win32, 'path.win32 exports')
  const expectedSep = os.platform() === 'win32' ? '\\' : '/'
  t.equal(path.sep, expectedSep, 'path.sep is correct')
})
