#!/usr/bin/env node

import { Recoverable, REPLServer } from 'node:repl'
import { createConnection } from 'net'
import * as acorn from 'acorn'
import { spawn } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'

import socket from '../index.js'

import { Message } from '../ipc.js'

const HISTORY_PATH = path.join(os.homedir(), '.ssc_socket_repl_history')

const callbacks = {}
const dirname = path.dirname(import.meta.url.replace('file://', ''))
const cwd = path.resolve(dirname, '..', 'repl')

const args = ['build', '-r', '-o']

if (!process.env.DEBUG) {
  args.push('--prod', '--headless')
  if (!process.env.VERBOSE) {
    args.push('--quiet')
  }
}

process.chdir(cwd)

const controller = new AbortController()
const child = spawn('ssc', args, {
  cwd: '.',
  stdio: ['ignore', 'pipe', 'inherit'],
  signal: controller.signal
})

let connection = null
let server = null
let port = null

let exiting = false
let nextId = 0

child.on('exit', () => {
  setTimeout(() => {
    process.exit()
  })
})

child.stdout.on('data', ondata)

process.on('exit', onexit)
process.on('SIGINT', onsignal)
process.on('unhandleRejection', onerror)
process.on('uncaughtException', onerror)

async function sleep (ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function onerror (err) {
  child.kill('SIGINT')
  console.error(err.stack || err)
}

function onsignal () {
  child.kill('SIGINT')
  process.exit()
}

function onexit () {
  if (exiting) return
  exiting = true
  child.kill(9)
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
      console.log(String(message))
    }
  }
}

async function onmessage (message) {
  const { id, name } = message
  let { value } = message

  if (name === 'repl.eval.result') {
    if (id in callbacks) {
      const hasError = message.get('error')
      const hasContinue = message.get('continue')
      const { computed, callback } = callbacks[id]

      if (!hasContinue) {
        delete callbacks[id]
      }

      if (value.err) {
        if (/^(Unexpected end of input|Unexpected token)/i.test(value.err.message)) {
          return callback(new Recoverable())
        }
      }

      if (typeof value === 'string') {
        try { value = JSON.parse(value) } catch (err) { }
      }

      if (typeof value?.data === 'string') {
        try {
          value.data = decodeURIComponent(value.data)
          value.data = JSON.parse(value.data)
        } catch (err) {
        }
      }

      if (!hasError && !value.err && value && typeof value === 'object' && 'data' in value) {
        value = value.data
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
            // eslint-disable-next-line no-new-func
            error = new Function('message', `return new ${name || 'Error'}(message)`)(message)
            error.name = value.err.name || name
          } catch (err) {
            // eslint-disable-next-line no-new-func
            error = new Function('message', 'return new Error(message)')(name + message)
          }

          if (value.err.stack) {
            error.stack = decodeURIComponent(value.err.stack.split('\n').slice(0).join('\n'))
          }

          callback(error)
        }
      } else if (hasError) {
        callback(new Error(value))
      } else if (computed) {
        callback(null, value)
      } else {
        if (typeof value === 'string') {
          if (!hasContinue) {
            console.log(value)
            callback(null)
          } else {
            process.stdout.write(value)
          }
        } else {
          callback(null, value)
        }
      }
    }
  }

  if (message.name === 'repl.server.listening') {
    port = message.get('port')

    if (!Number.isFinite(port)) {
      console.error('x Port received is not valid: Got %s', message.params.port)
      process.exit(1)
    }

    await sleep(512)

    connection = createConnection(port)
      .on('close', onexit)
      .on('data', ondata)

    server = new REPLServer({
      eval: evaluate,
      prompt: '# ',
      preview: false,
      useGlobal: true
    })

    server.on('reset', initContext)
    initContext(server.context)

    server.setupHistory(HISTORY_PATH, (err) => {
      if (err) {
        console.warn(err.message || err)
      }
    })

    server.on('exit', () => {
      connection.write('ipc://send?event=exit&index=0&value=0\n')
      setTimeout(() => connection.destroy(), 32)
    })
  }
}

function initContext (context) {
  context.socket = socket
}

async function evaluate (cmd, ctx, file, callback) {
  let ast = null
  const id = nextId++

  cmd = cmd.trimEnd()

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
    return callback(new Recoverable())
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
    if (!/\s*await/.test(cmd)) {
      if (lastName) {
        cmd = `${cmd}; socket.util.format(${lastName});`
      } else if (!/^\s*((throw\s)|(with\s*\()|(try\s*{)|(const\s)|(let\s)|(var\s)|(if\s*\()|(for\s*\()|(while\s*\()|(do\s*{)|(return\s)|(import\s*\())/.test(cmd)) {
        cmd = cmd.replace(/\s*;$/g, '')
        if (Array.isArray(root) && cmd.length) {
          const last = root.slice(-1)[0]
          cmd = [
            cmd.slice(0, last.start),
            `socket.util.format((${cmd.slice(last.start, last.end)}))`
          ]
            .filter(Boolean)
            .join(';')
        } else {
          cmd = `socket.util.format((${cmd}))`
        }
      }
    }
  }

  cmd = cmd.replace(/"/g, '\\"')
  const value = encodeURIComponent(JSON.stringify({
    id,
    cmd: encodeURIComponent(cmd)
  }))

  connection.write(`ipc://send?event=repl.eval&index=0&value=${value}\n`)
  callbacks[id] = { callback }
}
