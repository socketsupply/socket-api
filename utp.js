const { EventEmitter } = require('./events')
const { Duplex } = require('./streams')
const { lookup } = require('./dns')

class Connection extends Duplex {
  constructor (utp, port, address, handle, halfOpen) {
    this.remoteAddress = address
    this.remoteFamily = 'IPv4'
    this.remotePort = port
    this.destroyed = false

    this._utp = utp
    this._offset = 0

    const add = (list, item) => {
      if (has(list, item)) return item
      item._index = list.length
      list.push(item)
      return item
    }

    this.on('finish', this._shutdown)

    add(utp.connections, this)

    if (utp.maxConnections && utp.connections.length >= utp.maxConnections) {
      utp.firewall(true)
    }
  }

  _shutdown () {
  }
}

class Socket extends EventEmitter {
  constructor (options) {
    super()

    this.options = options
  }

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

  _onSend (send, status) {
    const remove = (list, item) => {
      if (!has(list, item)) return null

      var last = list.pop()
      if (last !== item) {
        list[item._index] = last
        last._index = item._index
      }

      return item
    }


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
