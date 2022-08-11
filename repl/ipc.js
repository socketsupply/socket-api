import { createServer } from 'net'
import { Message } from '../ipc.js'
import { format } from 'util'

const ipc = {
  seq: 0,
  server: createServer(onconnection),
  write (command, params) {
    params = { ...params, seq: this.seq++ }
    const message = Message.from(command, params)

    console.log('%s', message)
  },

  log (...args) {
    this.write('stdout', {
      value: format(...args)
    })
  }
}

process.stdin.on('data', ondata)

ipc.write('show')
ipc.write('navigate', { value: `file:///${process.cwd()}/index.html` })
ipc.server.listen(0, () => {
  const { port } = ipc.server.address()
  setTimeout(() => ipc.log(`ipc://repl.server.listening?port=${port}`), 32)
})

function ondata (data) {
  const buffers = String(data).split('\n').filter(Boolean)

  for (const buffer of buffers) {
    let message = null

    if (buffer.startsWith('ipc://')) {
      message = Message.from(buffer)
    }

    if (message?.command === 'repl.context.ready') {
      setTimeout(() => {
        ipc.write('send', { event: 'repl.context.init', value: {} })
      }, 512)
    }

    ipc.log(buffer.trim())
  }
}

function onconnection (socket) {
  socket.on('close', () => {
    process.exit()
  })

  process.stdin.on('data', (buffer) => {
    socket.write(buffer)
  })

  socket.on('data', (buffer) => {
    console.log('%s', String(buffer).trim())
  })
}
