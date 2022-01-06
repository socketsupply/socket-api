const { EventEmitter } = require('./events')
const { Duplex, FIFO } = require('./streams')

function assert_type (name, expected, actual, code) {
  var err = new TypeError(name + ' must be a ' + expected + ', Received '+actual)
  err.code = code
  throw err
}

// Returns an array [options, cb], where options is an object,
// cb is either a function or null.
// Used to normalize arguments of Socket.prototype.connect() and
// Server.prototype.listen(). Possible combinations of parameters:
//   (options[...][, cb])
//   (path[...][, cb])
//   ([port][, host][...][, cb])
// For Socket.prototype.connect(), the [...] part is ignored
// For Server.prototype.listen(), the [...] part is [, backlog]
// but will not be handled here (handled in listen())
const normalizedArgsSymbol = Symbol('normalizedArgsSymbol')
function normalizeArgs(args) {
  let arr;

  if (args.length === 0) {
    arr = [{}, null];
    arr[normalizedArgsSymbol] = true;
    return arr;
  }

  const arg0 = args[0];
  let options = {};
  if (typeof arg0 === 'object' && arg0 !== null) {
    // (options[...][, cb])
    options = arg0;

  //not supported: pipes
  //  } else if (isPipeName(arg0)) {
  //    // (path[...][, cb])
  //    options.path = arg0;
  } else {
    // ([port][, host][...][, cb])
    options.port = arg0;
    if (args.length > 1 && typeof args[1] === 'string') {
      options.host = args[1];
    }
  }

  const cb = args[args.length - 1];
  if (typeof cb !== 'function')
    arr = [options, null];
  else
    arr = [options, cb];

  arr[normalizedArgsSymbol] = true;
  return arr;
}


class Server extends EventEmitter {
  constructor (options, handler) {
    super()
    if(!options)
      handler = options, options = {}
    this._connections = 0
    this._serverId = null
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

  listen (port, address, cb) {        
    ;(async opts => {
      const { err, data } = await window._ipc.send('tcpCreateServer', opts)

      if (err && !cb) {
        this.emit('error', err)
        return
      }
      this._serverId = data.serverId
      this._address = {port: data.port, address: data.address, family: data.family}
      this.connections = {}

      window._ipc.streams[data.serverId] = this

      if (cb) return cb(null, data)
      this.emit('listening', data)
    })({port, address})

    return this
  }

  address () {
    return  this._address
  }

  close (cb) {
    const params = {
      serverId: this._serverId
    }
    ;(async () => {
      const { err, data } = await window._ipc.send('tcpClose', params)
      delete window._ipc.streams[this._serverId]
      if (err && !cb) this.emit('error', err)
      else if(cb) cb(err)
    })()
  }

  address () {
    return {...this._address}
  }

  getConnections (cb) {
    assert_type('Callback', 'function', typeof cb, "ERR_INVALID_CALLBACK")
    const params = {
      serverId: this._serverId
    }

    ;(async () => {
      const {
        err,
        data
      } = await window._ipc.send('tcpServerGetConnections', params)

      if(cb) cb(err, data)
    })()
  }

  unref () {
    return this
  }
}

class Socket extends Duplex {
  constructor (...args) {
    super()
    Object.assign(this, args)

    this._server = null

    this.port = null
    this.family = null
    this.address = null

    this.on('end', () => {
      if (!this.allowHalfOpen) this.write = _writeAfterFIN;
    })
  }

  //note: this is not an async method on node, so it's not here
  //thus the ipc response is not awaited. since _ipc.send is async
  //but the messages are handled in order, you do not need to wait
  //for it before sending data, noDelay will be set correctly before the
  //next data is sent.
  setNoDelay (enable) {
    const params = {
      clientId: this.clientId, enable
    }
    window._ipc.send('tcpSetNoDelay', params)
  }

  //note: see note for setNoDelay
  setKeepAlive (enabled) {
    const params = {
      clientId: this.clientId, enable
    }

    window._ipc.send('tcpSetKeepAlive', params)
  }

  // -------------------------------------------------------------
  _onTimeout () {
    const handle = this._handle
    const lastWriteQueueSize = this[kLastWriteQueueSize]

    if (lastWriteQueueSize > 0 && handle) {
      // `lastWriteQueueSize !== writeQueueSize` means there is
      // an active write in progress, so we suppress the timeout.
      const { writeQueueSize } = handle

      if (lastWriteQueueSize !== writeQueueSize) {
        this[kLastWriteQueueSize] = writeQueueSize
        this._unrefTimer()
        return
      }
    }

    debug('_onTimeout')
    this.emit('timeout')
  }

  setStreamTimeout (msecs, callback) {
    if (this.destroyed)
      return this;

    this.timeout = msecs;

    // Type checking identical to timers.enroll()
    msecs = getTimerDuration(msecs, 'msecs');

    // Attempt to clear an existing timer in both cases -
    //  even if it will be rescheduled we don't want to leak an existing timer.
    clearTimeout(this[kTimeout]);

    if (msecs === 0) {
      if (callback !== undefined) {
        validateCallback(callback);
        this.removeListener('timeout', callback);
      }
    } else {
      this[kTimeout] = setUnrefTimeout(this._onTimeout.bind(this), msecs);
      if (this[kSession]) this[kSession][kUpdateTimer]();

      if (callback !== undefined) {
        validateCallback(callback);
        this.once('timeout', callback);
      }
    }
    return this;
  }
  // -------------------------------------------------------------

  // not async in node.
  setTimeout (timeout) {
    const params = {
      clientId: this.clientId, timeout
    }

    window._ipc.send('tcpSetTimeout', params)
  }

  address () {
    return this._address
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
    err.code = 'EPIPE'

    if (typeof cb === 'function') {
      cb(err)
    }

    this.destroy(er)

    return false
  }

  _final (cb) {
    if (this.pending) {
      return this.once('connect', () => this._final(cb))
    }

    const params = {
      clientId: this.clientId
    }
    ;(async () => {
      const { err, data } = await window._ipc.send('tcpClose', params)
      
      if (cb) cb(err, data)
    })()
  }

  _destroy (exception, cb) {
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

  _writev (data, cb) {
    ;(async () => {
      const allBuffers = data.allBuffers
      let chunks

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
        //sent in order so could just await the last one?
        requests.push(window._ipc.send('tcpSend', params))
      }

      try {
        await Promise.all(requests)
      } catch (err) {
        this.destroy(err)
        cb(err)
        return
      }

      cb()
    })()
  }

  _write (data, encoding, cb) {
    const params = {
      clientId: this.clientId,
      encoding,
      data
    }
    ;(async () => {
      const { err } = await window._ipc.send('tcpSend', params)
      cb(err)
    })()
  }

  //
  // This is called internally by incoming _ipc message when there is data to insert to the stream.
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

  async connect (...args) {
    const [options, cb] = normalizeArgs(args)

    ;(async () => {
      const params = {
        port: options.port,
        address: options.host
      }

      //TODO: if host is a ip address
      //      connect, if it is a dns name, lookup

      const { err, data } = await window._ipc.send('tcpConnect', params)

      if (err) {
        if(cb) cb(err)
        else this.emit('error', err)
        return
      }
      this.remotePort = data.port
      this.remoteAddress = data.address
      this.clientId = data.clientId
      //this.port = port
      //this.address = address

      window._ipc.streams[data.clientId] = this

      if (cb) cb(null, this)
    })()
    return this
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

const connect = (...args) => {
  const [options, callback] = normalizeArgs(args)
  
  //supported by node but not here: localAddress, localHost, hints, lookup

  const socket = new Socket(options)

  //undocumented node js feature.
  //I think we should not support this.
  if (options.timeout) {
    socket.setTimeout(options.timeout);
  }

  socket.connect(options, callback)

  return socket
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
