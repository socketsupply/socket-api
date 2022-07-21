import { promisify } from 'node:util'
import { test } from 'tapzero'

import mock from './mock.js'

import { normalizeFlags } from '../fs/flags.js'
import * as fs from '../fs/index.js'

test('FileHandle', async t => {
  mock.create(t, 'fsOpen', {}, {})

  const handle = await fs.promises.open('./foo.txt')
  t.ok(handle.id.toString().length, 'handle provides an id')
})

test('flags', (t) => {
  t.ok(
    normalizeFlags() === fs.constants.O_RDONLY,
    'undefined === fs.constants.O_RDONLY'
  )

  t.ok(
    normalizeFlags(fs.constants.O_WRONLY) === fs.constants.O_WRONLY,
    'fs.constants.O_WRONLY=== fs.constants.O_WRONLY'
  )

  t.throws(
    () => normalizeFlags(null),
    RegExp('Expecting flags to be a string or number: Got object'),
    'normalizeFlags() throws on null'
  )

  t.throws(() =>
    normalizeFlags({}),
    RegExp('Expecting flags to be a string or number: Got object'),
    'normalizeFlags() throws on object'
  )

  t.throws(
    () => normalizeFlags(true),
    RegExp('Expecting flags to be a string or number: Got boolean'),
    'normalizeFlags() throws on boolean'
  )

  t.ok(
    normalizeFlags('r') === fs.constants.O_RDONLY,
    'r === fs.constants.O_RDONLY'
  )

  t.ok(
    normalizeFlags('rs') === fs.constants.O_RDONLY | fs.constants.O_SYNC,
    'rs === fs.constants.O_RDONLY | fs.constants.O_SYNC'
  )

  t.ok(
    normalizeFlags('sr') === fs.constants.O_RDONLY | fs.constants.O_SYNC, 'sr === fs.constants.O_RDONLY | fs.constants.O_SYNC')

  t.ok(
    normalizeFlags('r+') === fs.constants.O_RDWR,
    'r+ === fs.constants.O_RDWR'
  )

  t.ok(
    normalizeFlags('rs+') === fs.constants.O_RDWR | fs.constants.O_SYNC,
    'rs+ === fs.constants.O_RDWR | fs.constants.O_SYNC'
  )

  t.ok(
    normalizeFlags('sr+') === fs.constants.O_RDWR | fs.constants.O_SYNC,
    'sr+ === fs.constants.O_RDWR | fs.constants.O_SYNC'
  )

  t.ok(
    normalizeFlags('w') === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY,
    'w === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY'
  )

  t.ok(
    normalizeFlags('wx') === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL,
    'wx === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL'
  )

  t.ok(
    normalizeFlags('xw') === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL,
    'xw === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL'
  )

  t.ok(
    normalizeFlags('w+') === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_RDWR,
    'w+ === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_RDWR'
  )

  t.ok(
    normalizeFlags('wx+') === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL,
    'wx+ === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL'
  )
  t.ok(
    normalizeFlags('xw+') === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL, 'xw+ === fs.constants.O_TRUNC | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL')

  t.ok(
    normalizeFlags('a') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY,
    'a === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY'
  )

  t.ok(
    normalizeFlags('ax') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL,
    'ax === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL'
  )

  t.ok(
    normalizeFlags('xa') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL,
    'xa === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_EXCL'
  )

  t.ok(
    normalizeFlags('as') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_SYNC,
    'as === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_SYNC'
  )

  t.ok(
    normalizeFlags('sa') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_SYNC,
    'sa === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_WRONLY | fs.constants.O_SYNC'
  )

  t.ok(
    normalizeFlags('a+') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR,
    'a+ === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR'
  )

  t.ok(
    normalizeFlags('ax+') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL,
    'ax+ === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL'
  )

  t.ok(
    normalizeFlags('xa+') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL,
    'xa+ === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_EXCL'
  )

  t.ok(
    normalizeFlags('as+') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_SYNC,
    'as+ === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_SYNC'
  )

  t.ok(
    normalizeFlags('sa+') === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_SYNC,
    'sa+ === fs.constants.O_APPEND | fs.constants.O_CREAT | fs.constants.O_RDWR | fs.constants.O_SYNC'
  )
})

test('constants', (t) => {
  t.ok(
    fs.constants.COPYFILE_EXCL === 0x0001,
    'fs.fs.constants.COPYFILE_EXCL'
  )

	t.ok(
    fs.constants.COPYFILE_FICLONE === 0x0002,
    'fs.fs.constants.COPYFILE_FICLONE'
  )

	t.ok(
    fs.constants.COPYFILE_FICLONE_FORCE === 0x0004,
    'fs.fs.constants.COPYFILE_FICLONE_FORCE'
  )

  t.ok(typeof fs.constants.O_RDONLY === 'number', 'fs.constants.O_RDONLY')
  t.ok(typeof fs.constants.O_WRONLY === 'number', 'fs.constants.O_WRONLY')
  t.ok(typeof fs.constants.O_RDWR === 'number', 'fs.constants.O_RDWR')
  t.ok(typeof fs.constants.O_APPEND === 'number', 'fs.constants.O_APPEND')
  t.ok(typeof fs.constants.O_ASYNC === 'number', 'fs.constants.O_ASYNC')
  t.ok(typeof fs.constants.O_CLOEXEC === 'number', 'fs.constants.O_CLOEXEC')
  t.ok(typeof fs.constants.O_CREAT === 'number', 'fs.constants.O_CREAT')
  t.ok(typeof fs.constants.O_DIRECT === 'number', 'fs.constants.O_DIRECT')
  t.ok(typeof fs.constants.O_DIRECTORY === 'number', 'fs.constants.O_DIRECTORY')
  t.ok(typeof fs.constants.O_DSYNC === 'number', 'fs.constants.O_DSYNC')
  t.ok(typeof fs.constants.O_EXCL === 'number', 'fs.constants.O_EXCL')
  t.ok(typeof fs.constants.O_LARGEFILE === 'number', 'fs.constants.O_LARGEFILE')
  t.ok(typeof fs.constants.O_NOATIME === 'number', 'fs.constants.O_NOATIME')
  t.ok(typeof fs.constants.O_NOCTTY === 'number', 'fs.constants.O_NOCTTY')
  t.ok(typeof fs.constants.O_NOFOLLOW === 'number', 'fs.constants.O_NOFOLLOW')
  t.ok(typeof fs.constants.O_NONBLOCK === 'number', 'fs.constants.O_NONBLOCK')
  t.ok(typeof fs.constants.O_NDELAY === 'number', 'fs.constants.O_NDELAY')
  t.ok(typeof fs.constants.O_PATH === 'number', 'fs.constants.O_PATH')
  t.ok(typeof fs.constants.O_SYNC === 'number', 'fs.constants.O_SYNC')
  t.ok(typeof fs.constants.O_TMPFILE === 'number', 'fs.constants.O_TMPFILE')
  t.ok(typeof fs.constants.O_TRUNC === 'number', 'fs.constants.O_TRUNC')

  t.ok(typeof fs.constants.S_IFMT === 'number', 'fs.constants.S_IFMT')
  t.ok(typeof fs.constants.S_IFREG === 'number', 'fs.constants.S_IFREG')
  t.ok(typeof fs.constants.S_IFDIR === 'number', 'fs.constants.S_IFDIR')
  t.ok(typeof fs.constants.S_IFCHR === 'number', 'fs.constants.S_IFCHR')
  t.ok(typeof fs.constants.S_IFBLK === 'number', 'fs.constants.S_IFBLK')
  t.ok(typeof fs.constants.S_IFIFO === 'number', 'fs.constants.S_IFIFO')
  t.ok(typeof fs.constants.S_IFLNK === 'number', 'fs.constants.S_IFLNK')
  t.ok(typeof fs.constants.S_IFSOCK === 'number', 'fs.constants.S_IFSOCK')
  t.ok(typeof fs.constants.S_IRWXU === 'number', 'fs.constants.S_IRWXU')
  t.ok(typeof fs.constants.S_IRUSR === 'number', 'fs.constants.S_IRUSR')
  t.ok(typeof fs.constants.S_IWUSR === 'number', 'fs.constants.S_IWUSR')
  t.ok(typeof fs.constants.S_IXUSR === 'number', 'fs.constants.S_IXUSR')
  t.ok(typeof fs.constants.S_IRWXG === 'number', 'fs.constants.S_IRWXG')
  t.ok(typeof fs.constants.S_IRGRP === 'number', 'fs.constants.S_IRGRP')
  t.ok(typeof fs.constants.S_IWGRP === 'number', 'fs.constants.S_IWGRP')
  t.ok(typeof fs.constants.S_IXGRP === 'number', 'fs.constants.S_IXGRP')
  t.ok(typeof fs.constants.S_IRWXO === 'number', 'fs.constants.S_IRWXO')
  t.ok(typeof fs.constants.S_IROTH === 'number', 'fs.constants.S_IROTH')
  t.ok(typeof fs.constants.S_IWOTH === 'number', 'fs.constants.S_IWOTH')
  t.ok(typeof fs.constants.S_IXOTH === 'number', 'fs.constants.S_IXOTH')

  t.ok(typeof fs.constants.F_OK === 'number', 'fs.constants.F_OK')
  t.ok(typeof fs.constants.R_OK === 'number', 'fs.constants.R_OK')
  t.ok(typeof fs.constants.W_OK === 'number', 'fs.constants.W_OK')
  t.ok(typeof fs.constants.X_OK === 'number', 'fs.constants.X_OK')
})

test('nodejs.util.promisify.custom', (t) => {
  for (const key in fs) {
    const value = fs[key]
    if (typeof fs.promises[key] === 'function') {
      t.equal(promisify(value), fs.promises[key], `promisify(fs.${key})`)
    }
  }
})
