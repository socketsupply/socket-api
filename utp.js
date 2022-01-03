const { EventEmitter } = require('./events')
const { Duplex } = require('./streams')
const { lookup } = require('./dns')

class Connection extends Duplex {
  constructor (utp, port, address, handle, halfOpen) {
  }

  _shutdown () {
  }
}

class Socket extends EventEmitter {
  firewall () {
  }

  ref () {
    return this
  }

  unref () {
    return this
  }

  address () {
    return {
      address: this.address,
      family: this.family,
      port: this.port
    }
  }

  setRecvBufferSize () {
  }

  setSendBufferSize () {
  }

  getRecvBufferSize () {
  }

  getSendBufferSize () {
  }

  send () {
  }

  _onSend () {
  }

  _resolveAndSend () {
  }

  close () {
  }

  _closeMaybe () {
  }
}

const createServer = (options, onConnection) => {
  const server = new Socket(options)
  if (onConnection) server.on('connection', onConnection)
  return server
}

const connect = (options, cb) => {
  const socket = new Socket(options)
  socket.connect(options, cb)
  return socket
}

module.exports = {
  Socket,
  createServer,
  connect
}
