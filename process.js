/**
 * @module Process
 */
import { EventEmitter } from './events.js'
import { send } from './ipc.js'

let didEmitExitEvent = false

const global = typeof window === 'object' ? window : globalThis
const isNode = global?.process?.versions?.node
const process = isNode
  ? globalThis.process
  : Object.create(global?.__args, Object.getOwnPropertyDescriptors({
    ...EventEmitter.prototype,
    homedir,
    argv0: global?.__args?.argv?.[0] ?? null,
    exit,
    env: {},
    ...global?.__args
  }))

if (!isNode) {
  EventEmitter.call(process)
}

export default process

/**
 * @returns {string} The home directory of the current user.
 */
export function homedir () {
  return process.env.HOME ?? ''
}

/**
 * @param {number=} [code=0] - The exit code. Default: 0.
 */
export function exit (code) {
  if (!didEmitExitEvent) {
    didEmitExitEvent = true
    queueMicrotask(() => process.emit('exit', code))
    send('exit', { value: code || 0 })
  }
}
