import { Buffer } from '@socketsupply/io'
import process from '@socketsupply/io/process.js'
import fs from '@socketsupply/io/fs.js'
import os from '@socketsupply/io/os.js'

import deepEqual from 'tapzero/fast-deep-equal.js'
import { test } from 'tapzero'

// node compat
//import fs from 'node:fs'
//import os from 'node:os'

test('fs.access', async (t) => {
  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.F_OK, (err) => {
      if (err) t.fail(err, '(F_OK) fixtures/ is not accessible')
      else t.ok(true, '(F_OK) fixtures/ directory is accessible')
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.F_OK | fs.constants.R_OK, (err) => {
      if (err) t.fail(err, '(F_OK | R_OK) fixtures/ directory is not readable')
      else t.ok(true, '(F_OK | R_OK) fixtures/ directory is readable')
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    if (os.platform() === 'android') {
      t.comment('FIXME for Android - (W_OK) fixtures/ directory is writable')
      return resolve()
    }

    fs.access('.', fs.constants.W_OK, (err) => {
      if (err) t.fail(err, '(W_OK) fixtures/ directory is not writable')
      else t.ok(true, '(W_OK) fixtures/ directory is writable')
      resolve()
    })
  })

  await new Promise((resolve, reject) => {
    fs.access('fixtures', fs.constants.X_OK, (err) => {
      if (err) t.fail(err, '(X_OK) fixtures/ directory is not "executable" - cannot list items')
      else t.ok(true, '(X_OK) fixtures/ directory is "executable" - can list items')
      resolve()
    })
  })
})

test('fs.appendFile', async (t) => {})
test('fs.chmod', async (t) => {})
test('fs.chown', async (t) => {})
test('fs.close', async (t) => {
  if (os.platform() === 'android') {
    t.comment('FIXME for Android')
    return
  }

  await new Promise((resolve, reject) => {
    fs.open('fixtures/file.txt', (err, fd) => {
      if (err) return t.fail(err)

      t.ok(Number.isFinite(fd), 'isFinite(fd)')
      fs.close(fd, (err) => {
        if (err) t.fail(err)

        t.ok(!err, 'fd closed')
        resolve()
      })
    })
  })
})

test('fs.copyFile', async (t) => {})
test('fs.createReadStream', async (t) => {
  if (os.platform() === 'android') {
    t.comment('FIXME for Android')
    return
  }

  const buffers = []
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream('fixtures/file.txt')
    const expected = Buffer.from('test 123')

    stream.on('close', resolve)
    stream.on('data', (buffer) => {
      buffers.push(buffer)
    })

    stream.on('error', (err) => {
      if (err) t.fail(err)
      resolve()
    })

    stream.on('end', () => {
      let actual = Buffer.concat(buffers)
      if (actual[actual.length - 1] === 0x0A) {
        actual = actual.slice(0, -1)
      }

      t.ok(
        Buffer.compare(expected, actual) == 0,
        `fixtures/file.txt contents match "${expected}"`
      )
    })
  })
})

test('fs.createWriteStream', async (t) => {})
test('fs.fstat', async (t) => {})
test('fs.lchmod', async (t) => {})
test('fs.lchown', async (t) => {})
test('fs.lutimes', async (t) => {})
test('fs.link', async (t) => {})
test('fs.lstat', async (t) => {})
test('fs.mkdir', async (t) => {})
test('fs.open', async (t) => {})
test('fs.opendir', async (t) => {})
test('fs.read', async (t) => {})
test('fs.readdir', async (t) => {})
test('fs.readFile', async (t) => {
  let failed = false
  const expected = { data: 'test 123' }
  const iterations = 64
  const promises = Array.from(Array(1024), (_, i) => new Promise((resolve) => {
    if (failed) return resolve(false)
    fs.readFile('fixtures/file.json', (err, buf) => {
      if (failed) return resolve(false)

      const message = `fs.readFile('fixtures/file.json') [iteration=${i+1}]`

      if (err) {
        t.fail(err, message)
        failed = true
      } else if (!deepEqual(expected, JSON.parse(buf))) {
        failed = true
      }

      resolve(!failed)
    })
  }))

  const results = await Promise.all(promises)
  t.ok(results.every(Boolean), 'fs.readFile(\'fixtures/file.json\')')
})

test('fs.readlink', async (t) => {})
test('fs.realpath', async (t) => {})
test('fs.rename', async (t) => {})
test('fs.rmdir', async (t) => {})
test('fs.rm', async (t) => {})
test('fs.stat', async (t) => {})
test('fs.symlink', async (t) => {})
test('fs.truncate', async (t) => {})
test('fs.unlink', async (t) => {})
test('fs.utimes', async (t) => {})
test('fs.watch', async (t) => {})
test('fs.write', async (t) => {})
test('fs.writeFile', async (t) => {})
test('fs.writev', async (t) => {})
