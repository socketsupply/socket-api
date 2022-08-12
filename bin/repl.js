#!/usr/bin/env node

import { Recoverable, REPLServer }from 'node:repl'
import { createConnection } from 'net'
import * as acorn from 'acorn'
import { spawn } from 'node:child_process'
import chalk from 'chalk'
import path from 'node:path'
import os from 'node:os'

import { Message } from '../ipc.js'

const HISTORY_PATH = path.join(os.homedir(), '.ssc_io_repl_history')

const callbacks = {}
const dirname = path.dirname(import.meta.url.replace('file://', ''))
const cwd = path.resolve(dirname, '..', 'repl')

const args = ['compile', '-r', '-o']

if (!process.env.DEBUG) {
  args.push('--prod', '--headless')
  if (!process.env.VERBOSE) {
    args.push('--quiet')
  }
}

if (!process.env.DEBUG && !process.env.VERBOSE) {
  console.log('• warning! waiting for build to complete')
}

process.chdir(cwd)

const proc = spawn('ssc', args, {
  cwd: '.',
  stdio: ['ignore', 'pipe', 'inherit']
})

let nextId = 0
let socket = null
let server = null
let port = null

proc.on('exit', onexit)
proc.stdout.on('data', ondata)

process.on('exit', onexit)
process.on('SIGINT', onsignal)
process.on('unhandleRejection', onerror)
process.on('uncaughtException', onerror)

async function sleep (ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function onerror (err) {
  proc.kill(9)
  console.error(err.stack || err)
}

function onsignal () {
  proc.kill(9)
  process.exit()
}

function onexit () {
  proc.kill(9)
  setTimeout(() => {
    process.exit()
  })
}

function ondata (data) {
  const messages = String(data)
    .split('\n')
    .filter(Boolean)
    .map((buf) => Message.isValidInput(buf) ? Message.from(buf) : buf)

  for (const message of messages) {
    if (message instanceof Message) {
      onmessage(message)
    } else {
      console.log(String(message).trim())
    }
  }
}

async function onmessage (message) {
  const { id, command } = message
  let { value } = message

  if (command === 'repl.eval.result') {
    if (id in callbacks) {
      const hasError = message.get('error')
      const { computed, callback } = callbacks[id]

      delete callbacks[id]

      if (value.err) {
        if (/^(Unexpected end of input|Unexpected token)/i.test(value.err.message)) {
          return callback(new Recoverable())
        }
      }

      if (!hasError && !value.err && value && 'data' in value) {
        value = value.data
      }

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

      if (value?.err) {
        if (/unsupported type/i.test(value.err) || value.err.message === '(null)') {
          callback(null)
        } else {
          const parts = (value.err?.message ?? String(value.err)).split(':')
          let name = parts.shift()
          let message = parts.join(':')

          if (!name || !message || name === message) {
            message = name
            name = 'Error'
          }

          let error = null
          try {
            error = new Function('message', `return new ${name || 'Error'}(message)`)(message)
            error.name = value.err.name || name
          } catch (err) {
            error = new Function('message', `return new Error(message)`)(name + message)
          }

          if (value.err.stack) {
            error.stack = value.err.stack
          }
          callback(error)
        }
      } else if (hasError) {
        callback(new Error(value))
      } else if (computed) {
        callback(null, value)
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

  if (message.command === 'repl.server.listening') {
    port = message.get('port')
    if (!Number.isFinite(port)) {
      console.error('Port received is not valid: Got %s', message.params.port)
      process.exit(1)
    }
  }

  if (message.command === 'repl.context.ready') {
    if (!process.argv.includes('--quiet')) {
      console.log('• repl context initialized')
      console.log('')
    }

    await sleep(512)

    socket = createConnection(port)
    socket.on('close', onexit)
    socket.on('data', ondata)

    server = new REPLServer({
      eval: evaluate,
      prompt: '# ',
      preview: false,
      useGlobal: false
    })

    server.setupHistory(HISTORY_PATH, (err) => {
      if (err) {
        console.warn(err.message || err)
      }
    })

    server.on('exit', () => {
      socket.write('ipc://exit?index=0\n')
      setTimeout(() => socket.destroy(), 32)
    })
  }
}

async function evaluate (cmd, ctx, file, callback) {
  let ast = null
  let id = nextId++

  cmd = cmd.trim()

  if (!cmd) {
    return callback()
  }

  try {
    ast = acorn.parse(cmd, {
      tokens: true,
      ecmaVersion: 13,
      sourceType: 'module'
    })
  } catch (err) {
    void err
  }

  const isTry = ast?.body?.[0]?.type === 'TryStatement'
  const names = []
  const root = isTry
    ? ast?.body[0].block.body
    : ast?.body

  if (ast) {
    for (const node of root) {
      if (node.id?.name) {
        names.push(node.id.name)
      } else if (node.declarations) {
        for (const declaration of node.declarations) {
          if (declaration.id?.name) {
            names.push(declaration.id.name)
          }
        }
      } else {
        names.push(null)
      }
    }
  }

  const lastName = names.pop()

  if (!isTry && !/import\s*\(/.test(cmd)) {
    if (/^\s*await/.test(cmd)) {
      cmd = cmd.replace(/^\s*await\s*/, '')
      cmd = `void (${cmd}).then((result) => console.log(io.util.format(result)))`
    } else if (lastName) {
      cmd = `${cmd}; io.util.format(${lastName});`
    } else if (!/^\s*((throw\s)|(with\s*\()|(try\s*{)|(const\s)|(let\s)|(var\s)|(if\s*\()|(for\s*\()|(while\s*\()|(do\s*{)|(return\s)|(import\s*\())/.test(cmd)) {
      cmd = cmd.split(';').map((c) => {
        if (/^\s*\{/.test(c)) { return c }
        return `io.util.format(${c});`
      }).join('\n')
    }
  }

  const value = encodeURIComponent(JSON.stringify({
    id,
    cmd
  }))

  socket.write(`ipc://send?event=repl.eval&index=0&value=${value}\n`)
  callbacks[id] = { callback }
}
