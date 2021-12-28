const { EventEmitter } = require('./events')
const { Duplex } = require('./streams')

class Server extends EventEmitter {
  constructor (args) {
    super()

    Object.assign(this, args)
    this._connections = 0
    this.serverId = null
  }

  onconnection (data) {
    const socket = new Socket(data)

    if (this.maxConnections && this._connections >= this.maxConnections) {
      socket.close(data)
      return
    }

    self._connections++
    socket._server = this

    self.emit('connection', socket)
  }

  listen () {
    const connect = async o => {
      const { err, data } = await window._ipc.send('tcpCreateServer', o)

      if (err && cb) return cb(err)
      if (err) return server.emit('error', err)

      this.port = data.port
      this.address = data.address
      this.family = data.family
      this.connections = {}

      window._ipc.streams[data.serverId] = this

      if (cb) return cb(null, data)
      server.emit('listening', data)
    }

    connect()

    return this
  }

  async close (cb) {
    const params = {
      serverId: this.serverId
    }

    const { err, data } = await window._ipc.send('tcpClose', params)
    delete window._ipc.streams[data.serverId]

    if (err && cb) return cb(err)
    if (err) this.emit('error', err)
  }

  address () {
    return {
      port: this.port,
      family: this.family,
      address: this.address
    }
  }

  async getConnections (cb) {
    const params = {
      serverId: this.serverId
    }

    const {
      err,
      data
    } = await window._ipc.send('tcpServerGetConnections', params)

    if (err && cb) return cb(err)
    if (cb) return cb(null, data)

    return data
  }

  unref () {
    return this
  }
}

class Socket extends Duplex {
  constructor (...args) {
    Object.assign(this, args)

    this._server = null

    this.port = null
    this.family = null
    this.address = null

    this.on('end', () => {
      if (!this.allowHalfOpen) this.write = _writeAfterFIN;
    })
  }

  async setNoDelay () {
    const params = {
      clientId: this.clientId
    }

    const { err } = await window._ipc.send('tcpSetNoDelay', params)

    if (err) {
      throw new Error(err)
    }
  }

  async setKeepAlive () {
    const params = {
      clientId: this.clientId
    }

    const { err } = await window._ipc.send('tcpSetKeepAlive', params)

    if (err) {
      throw new Error(err)
    }
  }

  async setTimeout () {
    const params = {
      clientId: this.clientId
    }

    const { err } = await window._ipc.send('tcpSetTimeout', params)

    if (err) {
      throw new Error(err)
    }
  }

  address () {
    return {
      port: this.port,
      family: this.family,
      address: this.address
    }
  }

  _writeAfterFIN (chunk, encoding, cb) {
    if (!this.writableEnded) {
      return Duplex.prototype.write.call(this, chunk, encoding, cb)
    }

    if (typeof encoding === 'function') {
      cb = encoding
      encoding = null
    }

    // eslint-disable-next-line no-restricted-syntax
    const err = new Error('Socket has been ended by the other party')
    err.code = 'EPIPE';

    if (typeof cb === 'function') {
      cb(err)
    }

    this.destroy(er)

    return false
  }

  async _final (cb) {
    if (this.pending) {
      return this.once('connect', () => this._final(cb))
    }

    const params = {
      clientId: this.clientId
    }

    const { err, data } = await window._ipc.send('tcpClose', params)

    if (err && cb) return cb(err)
    if (cb) return cb(null, data)

    return data
  }

  async _destroy (exception, cb) {
    if (this.destroyed) return

    cb(exception)

    if (this._server) {
      this._server._connections--

      if (this._server._connections === 0) {
        this._server.emit('close')
      }
    }
  }

  destroySoon () {
    if (this.writable) this.end()

    if (this.writableFinished) {
      this.destroy()
    } else {
      this.once('finish', this.destroy)
    }
  }

  async _writev (data, cb) {
    const allBuffers = data.allBuffers

    let chunks;
    if (allBuffers) {
      chunks = data
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i].chunk
      }
    } else {
      chunks = new Array(data.length << 1)

      for (let i = 0; i < data.length; i++) {
        const entry = data[i]
        chunks[i * 2] = entry.chunk
        chunks[i * 2 + 1] = entry.encoding
      }
    }

    const requests = []

    for (const chunk of chunks) {
      const params = {
        clientId: this.clientId,
        data: chunk
      }

      requests.push(window._ipc.send('tcpSend', params))
    }

    await Promise.all(requests)
    return cb()
  }

  async _write (data, encoding, cb) {
    const params = {
      clientId: this.clientId,
      encoding,
      data
    }

    const { err } = await window._ipc.send('tcpSend', params)

    if (err) {
      this.destroy(err)
      return cb(err)
    }

    cb()
  }

  //
  // This is called internally when there is data to insert to the stream.
  //
  __write (data) {
    if (data.length && !stream.destroyed) {
      this.push(data)
    } else {
      stream.push(null)
      stream.read(0)
    }
  }

  async _read (n) {
    const params = {
      bytes: n,
      clientId: this.clientId
    }

    const { err } = await window._ipc.send('tcpRead', params)

    if (err) {
      socket.destroy()
    }
  }

  async connect (port, address, cb) {
    if (typeof address === 'function') {
      cb = address
      address = null
    }

    const { err, data } = await window._ipc.send('tcpConnect', { port, address })

    if (err && cb) return cb(err)
    if (err) return this.emit('error', err)

    this.remotePort = data.port
    this.remoteAddress = data.address
    this.clientId = data.clientId
    this.port = port
    this.address = address

    window._ipc.streams[data.serverId] = this

    if (cb) cb(null, data)
  }

  async end (data, encoding, cb) {
    Duplex.prototype.end.call(this, data)

    const params = {
      clientId: this.clientId,
      encoding
    }

    const { err } = await window._ipc.send('tcpClose', params)
    delete window._ipc.streams[this.clientId]

    if (err && cb) return cb(err)
    if (err) this.emit('error', err)
    this.emit('closed', !!err)
    if (cb) return cb(null)
  }

  unref () {
    return this // for compatibility with the net module
  }
}

const connect = (value, cb) => {
  let options = {}
  if (typeof value === 'number') {
    options.port = value
  } else if (typeof value === 'object') {
    options = value
  } else {
    throw new Error('Invalid argument')
  }

  const socket = new Socket(options)

  if (options.timeout) {
    socket.setTimeout(options.timeout);
  }

  socket.connect(options.port, options.address, cb)
}

const createServer = (...args) => {
  return new Server(...args)
}

const getNetworkInterfaces = o => window._ipc.send('getNetworkInterfaces', o)

const v4Seg = '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])'
const v4Str = `(${v4Seg}[.]){3}${v4Seg}`
const IPv4Reg = new RegExp(`^${v4Str}$`)

const isIPv4 = s => {
  return IPv4Reg.test(s)
}

module.exports = {
  Socket,
  Server,
  connect,
  createServer,
  getNetworkInterfaces,
  isIPv4
}
