import buffer from 'buffer'
import * as stream from './stream'

import dgram from './dgram.js'
import dns from './dns.js'
import { EventEmitter } from './events.js'
import fs from './fs/index.js'
import ipc from './ipc.js'
import * as net from './net.js'
import os from './os.js'
import bluetooth from './bluetooth.js'

export {
  bluetooth,
  buffer,
  dgram,
  dns,
  EventEmitter,
  fs,
  ipc,
  net,
  os,
  stream
}
