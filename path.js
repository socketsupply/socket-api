import { posix, win32 } from './path/index.js'
import os from './os.js'

export * from './path/index.js'

const path = {
  ...(os.platform() === 'win32' ? win32 : posix),
  // make `win32` and `posix` still accessible from top level
  win32,
  posix
}

export default path
