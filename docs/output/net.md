
### undefined

lifted from nodejs/node/


### options

(options[...][, cb])


### options

([port][, host][...][, cb])


## Server (extends EventEmitter)

This is a `ClassDeclaration` named `Server (extends EventEmitter)`in `net.js`, it's exported but undocumented.



## Socket (extends Duplex)

This is a `ClassDeclaration` named `Socket (extends Duplex)`in `net.js`, it's exported but undocumented.



### setNoDelay

note: this is not an async method on node, so it's not here
thus the ipc response is not awaited. since _ipc.send is async
but the messages are handled in order, you do not need to wait
for it before sending data, noDelay will be set correctly before the
next data is sent.


### setKeepAlive

note: see note for setNoDelay


### _onTimeout

-------------------------------------------------------------


### undefined

`lastWriteQueueSize !== writeQueueSize` means there is
an active write in progress, so we suppress the timeout.


### address

-------------------------------------------------------------


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


### requests

sent in order so could just await the last one?


### __write


This is called internally by incoming _ipc message when there is data to insert to the stream.



### undefined

if this stream is not full duplex,
then mark as not writable.


### undefined

send a ReadStop but do not wait for a confirmation.
ipc is async, but it's ordered,


### undefined

send a ReadStop but do not wait for a confirmation.
ipc is async, but it's ordered,


### undefined

TODO: if host is a ip address
connect, if it is a dns name, lookup


### window

this.port = port
this.address = address


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



### undefined

supported by node but not here: localAddress, localHost, hints, lookup


## createServer

This is a `VariableDeclaration` named `createServer`in `net.js`, it's exported but undocumented.



## getNetworkInterfaces

This is a `VariableDeclaration` named `getNetworkInterfaces`in `net.js`, it's exported but undocumented.



## isIPv4

This is a `VariableDeclaration` named `isIPv4`in `net.js`, it's exported but undocumented.


