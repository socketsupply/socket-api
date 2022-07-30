import { EventEmitter } from './events.js'
import { send } from './ipc.js'

let didEmitExitEvent = false

export function homedir () {
  process.env.HOME || ''
}

export function exit (code) {
  if (!didEmitExitEvent) {
    didEmitExitEvent = true
    queueMicrotask(() => process.emit('exit', code))
  }

  send('exit', { value: code || 0 })
}


const parent = typeof window === 'object' ? window : globalThis
const process = Object.create(null, Object.getOwnPropertyDescriptors({
  ...EventEmitter.prototype,
  homedir,
  exit,
  argv0: parent?.process?.argv?.[0],
  ...parent?.process,
}))

EventEmitter.call(process)

export default process
