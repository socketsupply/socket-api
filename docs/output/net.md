
## Server (extends EventEmitter)

This is a `ClassDeclaration` named `Server (extends EventEmitter)`in `net.js`, it's exported but undocumented.



## Socket (extends Duplex)

This is a `ClassDeclaration` named `Socket (extends Duplex)`in `net.js`, it's exported but undocumented.



### _final

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


### unref

async end (data, encoding, cb) {
    Duplex.prototype.end.call(this, data)

    const params = {
      clientId: this.clientId
    }

    const { err } = await window._ipc.send('tcpShutdown', params)
    delete window._ipc.streams[this.clientId]

    if (err && cb) return cb(err)
    if (err) this.emit('error', err)
    this.emit('closed', !!err)
    if (cb) return cb(null)
  }


## connect

This is a `VariableDeclaration` named `connect`in `net.js`, it's exported but undocumented.



## createServer

This is a `VariableDeclaration` named `createServer`in `net.js`, it's exported but undocumented.



## getNetworkInterfaces

This is a `VariableDeclaration` named `getNetworkInterfaces`in `net.js`, it's exported but undocumented.



## isIPv4

This is a `VariableDeclaration` named `isIPv4`in `net.js`, it's exported but undocumented.


