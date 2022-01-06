var mocks = {}
var tape = require('tape')

function createId() {
  return Math.random()
}

function P (value) {
  return new Promise(resolve => { resolve(value) })
}

function _mockResponse (name, promise) {
  mocks[name] = promise
}
global.window = {
  _ipc: {
    send (name, value) {
      var mock
      console.log("call mock:", name, value)      
      if(mocks[name] == null || mocks[name].length == 0)
        throw new Error('unexpected send:'+name+', '+JSON.stringify(value))
      if(Array.isArray(mocks[name])) {
        mock = mocks[name].shift()
        if(mocks[name].length == 0)
          delete mocks[name]
      }
      else
        mock = mocks[name]
      return mock(value)
    },
    streams: {}
  },
}

function Expect(t, args, result) {
  return (_args) => {
    for(var k in args)
      t.equal(_args[k], args[k], 'property:'+k)
    return P(result)
  }
}

var net = require('../net')

//createServer, call listen, close server
tape('net.createServer', (t) => {
  var server = net.createServer(stream => {
    //no actual connections on this test  
  })
  var ID = createId()
  //should not have sent a message yet
  mocks.tcpCreateServer = [Expect(t,
    {port: 9000, address:'127.0.0.1'},
    {data: {serverId: ID, port: 9000, address: '127.0.0.1', family: 'IPv4'}}
  )]

  //unref does nothing, but returns self
  t.equal(server.unref(), server)
  
  //the default behaviour seems to be to listen on IPv6,
  //guessing that probably depends on the system though.
  server.listen(9000, '127.0.0.1', function () {
  
    t.deepEqual(
      server.address(),
      {port: 9000, address: '127.0.0.1', family: 'IPv4'}
    )

    mocks.tcpClose = [Expect(t, {serverId: ID}, {})]

      server.close(function () {
      
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
})

//net.connect returns socket, write data, receive data, end stream

tape('net.connect', (t) => {
  var ID = createId()
  var HELLO = 'Hello, World!\n'
  mocks.tcpConnect = [Expect(t,
    {port: 9000, address: '127.0.0.1'}, 
    { data: {
      clientId: ID
    }}
  )]
  var _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)

    // creating a new stream calls _read
    // which does `send('tcpRead'` but in libuv it's `uv_tcp_read_start`
    // in node _read calls tryReadStart.
    
    // It looks like the code in `_read` came from tryReadStart
    // (because of the way it checks the error) but I didn't see
    // a tcpRead defined in the ios code I currently have available.
    // I'm guessing that tcpRead is intended to call uv_tcp_read_start
    // then uv_tcp_read_stop once it's received bytes?

    mocks.tcpSend = [Expect(t,
      {clientId: ID, data: HELLO}, 
      {}
    )]
    mocks.tcpRead = [Expect(t,
      {clientId: ID}, 
      {data: HELLO}
    )]
    
    stream.write(HELLO)
    mocks.tcpShutdown = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    mocks.tcpClose = [Expect(t,
      {clientId: ID}, 
      {}
    )]

    stream.end()
    stream.on('close', () => {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
  t.ok(_stream)  
})

tape.only('net.connect', (t) => {
  var ID = createId()
  var HELLO = 'Hello, World!\n'
  var ended = false
  mocks.tcpConnect = [Expect(t,
    {port: 9000, address: '127.0.0.1'}, 
    { data: {
      clientId: ID
    }}
  )]
  var _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, false)
    // creating a new stream calls _read
    // which does `send('tcpRead'` but in libuv it's `uv_tcp_read_start`
    // in node _read calls tryReadStart.
    
    // It looks like the code in `_read` came from tryReadStart
    // (because of the way it checks the error) but I didn't see
    // a tcpRead defined in the ios code I currently have available.
    // I'm guessing that tcpRead is intended to call uv_tcp_read_start
    // then uv_tcp_read_stop once it's received bytes?

    stream.on('end', function () {
      ended = true
    })
    mocks.tcpShutdown = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    mocks.tcpClose = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    stream.end()
    stream.__write('')
    
    stream.on('close', () => {
      t.ok(ended)
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
  t.ok(_stream)  
})
