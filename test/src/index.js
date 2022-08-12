import * as process from '@socketsupply/io/process.js'
//import ipc from '@socketsupply/io/ipc.js'

import { GLOBAL_TEST_RUNNER } from 'tapzero'

const parent = typeof window === 'object' ? window : globalThis

//ipc.debug.enabled = true

if (typeof parent?.addEventListener === 'function') {
  parent.addEventListener('error', (err, url, line) => {
    console.error(err.stack || err.message || err)
    process.exit(1)
  })
}

setTimeout(function poll () {
  if (GLOBAL_TEST_RUNNER.completed) {
    return process.exit(0)
  }

 setTimeout(poll)
})

import './console.js'
import './fs.js'
import './os.js'
import './dgram.js'