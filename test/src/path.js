import path from '../../path.js'

import { test } from '@socketsupply/tapzero'

test('path exports', (t) => {
  t.ok(path, 'path exports')
  t.ok(path.posix, 'path.posix exports')
  t.ok(path.win32, 'path.win32 exports')
})
