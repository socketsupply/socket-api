#!/usr/bin/env node

import { createConnection } from 'net'
import { REPLServer }from 'node:repl'
import { spawn } from 'node:child_process'
import path from 'node:path'

const args = ['compile', '-r', '-o' ]

if (!process.env.DEBUG) {
  args.push('--prod', '--headless')
}

const dirname = path.dirname(import.meta.url.replace('file://', ''))
args.push(path.resolve(dirname, '..'))

const proc = spawn('ssc', args, {
  cwd: '.',
  stdio: ['ignore', 'pipe', 'pipe']
})

process.on('exit', () => {
  proc.kill(9)
})

process.on('uncaughtException', (err) => {
  proc.kill()
  throw err
})

proc.on('exit', () => {
  process.exit()
})

let nextId = 0
let isReady = false
const callbacks = {}

proc.stdout.on('data', (buffer) => {
  let uri = null
  try { uri = new URL(String(buffer)) }
  catch (err) {
    console.log(String(buffer).trim())
  }

  function onmessage (uri) {
    const id = uri.searchParams.get('id')
    if (uri?.hostname === 'result') {
    if (id in callbacks) {
      let value = decodeURIComponent(uri.searchParams.get('value')).trim()
      const err = uri.searchParams.get('error')
      const callback = callbacks[id]

      delete callbacks[id]

      try { value = JSON.parse(value) }
      catch (err) {}

      if (typeof value === 'string') {
        try { value = new Function(`return ${value}`)() }
        catch (err) {}
      }

      if (value === 'undefined') {
        value = 'undefined'
      }

      if (value === '(null)') {
        return callback(null)
      }

      if (err) {
        callback(new Error(value))
      } else if (value?.err) {
        if (/unsupported type/i.test(value.err) || value.err.message === '(null)') {
          callback(null)
        } else {
          callback(new Error(value.err.message || value.err))
        }
      } else {
        if (typeof value === 'string') {
          console.log(value)
          callback(null)
        } else {
          callback(null, value)
        }
      }
    }
    }
  }

  if (isReady && uri) {
    onmessage(uri)
  }

  if (!isReady && uri?.hostname === 'ready') {
    isReady = true

    const socket = createConnection(3000)
    socket.on('data', (buffer) => {
      let uri = null
      try { uri = new URL(String(buffer)) }
      catch (err) {
        console.log(String(buffer).trim())
      }

      if (uri) {
        onmessage(uri)
      }
    })

    const scope = {}
    const server = new REPLServer({
      prompt: '# ',
      preview: false,
      useGlobal: false,
      async eval (cmd, ctx, file, callback) {
        cmd = cmd.trim()
        if (!cmd) return callback()
        const id = nextId++
        const value = encodeURIComponent(JSON.stringify({
          id,
          cmd: `io.util.format(${cmd.trim()})`
        }))
        socket.write(`ipc://send?event=eval&index=0&value=${value}\n`)
        callbacks[id] = callback
      }
    })
  }
})
