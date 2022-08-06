import { createServer } from 'net'

const server = createServer(onconnection)

server.listen(3000)
process.stdin.on('data', (buffer) => {
  console.log('ipc://stdout?value=%s', encodeURIComponent(String(buffer).trim()))
})

process.stdout.write(`ipc://show?seq=0&index=0\n`)
process.stdout.write(`ipc://navigate?seq=1&index=0&value=${encodeURIComponent(`file:///${process.cwd()}/index.html`)}\n`)

function onconnection (socket) {
  process.stdin.on('data', (buffer) => {
    socket.write(buffer)
  })
  socket.on('data', (buffer) => {
    console.log('%s', buffer)
  })
}
