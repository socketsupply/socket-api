import process from '@socketsupply/io/process.js'
import * as fs from '@socketsupply/io/fs.js'
import { test } from 'tapzero'

test('fs.access', async (t) => {
  return new Promise((resolve) => {
    console.log(process.cwd())
    fs.readdir('.', (err, entries) => {
      console.log(err, entries)
      resolve();
    })
  })
})
