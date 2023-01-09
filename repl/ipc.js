import { createServer } from 'net'
import { Message } from '../ipc.js'
import { format } from 'util'

const ipc = {
  seq: 0,
  server: createServer(onconnection),
  write (name, params) {
    params = { ...params, index: 0, seq: this.seq++ }
    const message = Message.from(name, params)

    console.log('%s', message)
  },

  log (...args) {
    this.write('stdout', {
      value: format(...args)
    })
  }
}

process.stdin.on('data', ondata)

ipc.server.listen(0, () => {
  const { port } = ipc.server.address()
  setTimeout(() => ipc.log(`ipc://repl.server.listening?port=${port}`), 32)
})

function ondata (data) {
  const buffers = String(data).split('\n').filter(Boolean)

  for (let buffer of buffers) {
    let message = null

    if (buffer.startsWith('ipc://')) {
      message = Message.from(buffer)
    }

    if (message?.name === 'process.write') {
      message = Message.from(message.value)
      buffer = message.toString()
    }

    if (message?.name === 'repl.context.ready') {
      setTimeout(() => {
        ipc.write('send', { event: 'repl.context.init', value: {} })
      }, 512)
    }

    ipc.log(buffer)
  }
}

function onconnection (connection) {
  connection.on('close', () => {
    process.exit()
  })

  process.stdin.on('data', (buffer) => {
    connection.write(buffer)
  })

  connection.on('data', (buffer) => {
    console.log('%s', String(buffer))
  })
}
