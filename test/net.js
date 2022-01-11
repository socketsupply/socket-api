var mocks = {}
var tape = require('tape')

function createId() {
  //TODO: change this to i64
  //      using this for now because JSON doesn't do BigInt
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
    t.equal(stream.allowHalfOpen, false)

    mocks.tcpSend = [Expect(t,
      {clientId: ID, data: HELLO}, 
      {}
    )]
    mocks.tcpReadStart = [(q) => {
      t.deepEqual(q, {clientId: ID})
      return (async () => {
        return {}
      })()
    }]

    //using setTimeout here is a sign we don't understand something.
    //
    setTimeout(() => {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      mocks.tcpShutdown = [Expect(t,
        {clientId: ID}, 
        {}
      )]
      mocks.tcpClose = [Expect(t,
        {clientId: ID}, 
        {}
      )]
      stream.__write('')

      stream.end()
      stream.on('close', () => {
        t.deepEqual(mocks, {}, 'no uncalled mocks')
        t.end()
      })
    }, 100)
    stream.write(HELLO)
  })
  t.ok(_stream)  
})

tape('net.connect, allowHalfOpen=false', (t) => {
  var ID = createId()
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

tape('net.connect allowHalfOpen=true', (t) => {
  var ID = createId()
  var HELLO = 'Hello, World!\n'
  var ended = false
  mocks.tcpConnect = [Expect(t,
    {port: 9000, address: '127.0.0.1'}, 
    { data: {
      clientId: ID
    }}
  )]
  var _stream = net.connect({
      port:9000,
      host:'127.0.0.1',
      allowHalfOpen: true
    }, function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, true)

    stream.on('end', function () {
      ended = true
      stream.end()
    })
    mocks.tcpShutdown = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    mocks.tcpClose = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    stream.__write('')
    
    stream.on('close', () => {
      t.ok(ended)
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
  t.ok(_stream)  
})

tape('net.connect allowHalfOpen=true, write write write', (t) => {
  var ID = createId()
  var HELLO = 'Hello, World!\n'
  var ended = false
  mocks.tcpConnect = [Expect(t,
    {port: 9000, address: '127.0.0.1'}, 
    { data: {
      clientId: ID
    }}
  )]
  var _stream = net.connect({
      port:9000,
      host:'127.0.0.1',
      allowHalfOpen: true
    }, function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, true)
    //to just test writes, end the read side immediately
    //(by simulated end receive '')
    stream.__write('')

    stream.on('end', function () {
      ended = true
    })

    var waiting = []
    
    function next (data) {
      var p = new Promise((resolve)=>{
        waiting.push(resolve)
      })
      return (args) => {
        t.equal(args.clientId, ID)
        t.equal(data, args.data)
        return p
      }
    }

    mocks.tcpSend = [
      next(HELLO+1),
      next(HELLO+2),
      next(HELLO+3),
      next(HELLO+4),
      next(HELLO+5),
      next(HELLO+6),
      next(HELLO+7)
    ]
    
    stream.write(HELLO+1)
    stream.write(HELLO+2)
    stream.write(HELLO+3)
    stream.write(HELLO+4)
    stream.write(HELLO+5)
    stream.write(HELLO+6)
    stream.write(HELLO+7)
    
    stream.end()

    var int = setInterval(() => {
      waiting.shift()({})
      if(!waiting.length) {
        clearInterval(int)
      }
    }, 100)

    
    mocks.tcpShutdown = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    mocks.tcpClose = [Expect(t,
      {clientId: ID}, 
      {}
    )]
    
    stream.on('close', () => {
      t.ok(ended)
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
  t.ok(_stream)  
})

tape.skip('net.connect', (t) => {
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
    t.equal(stream.allowHalfOpen, false)

//    mocks.tcpSend = [Expect(t,
//      {clientId: ID, data: HELLO}, 
//      {}
//    )]
    mocks.tcpReadStart = [(q) => {
      t.deepEqual(q, {clientId: ID})
      return (async () => {
        return {}
      })()
    }]

    //using setTimeout here is a sign we don't understand something.
    //
    setTimeout(() => {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      mocks.tcpShutdown = [Expect(t,
        {clientId: ID}, 
        {}
      )]
      mocks.tcpClose = [Expect(t,
        {clientId: ID}, 
        {}
      )]
      stream.__write('')

      stream.end()
      stream.on('close', () => {
        t.deepEqual(mocks, {}, 'no uncalled mocks')
        t.end()
      })
    }, 100)
//    stream.write(HELLO)
  })
  t.ok(_stream)  
})



tape('net.connect allowHalfOpen=true readStart readStop', (t) => {
    var ID = createId()
  var HELLO = 'Hello, World!\n'
  mocks.tcpConnect = [Expect(t,
    {port: 9000, address: '127.0.0.1'}, 
    { data: {
      clientId: ID
    }}
  )]
  var _stream = net.connect({
    port: 9000,
    host:'127.0.0.1',
    allowHalfOpen: true
  }, function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, true)
//    stream.end()
    mocks.tcpReadStart = [(q) => {
      t.deepEqual(q, {clientId: ID})
      return (async () => {
        return {data: HELLO}
      })()
    }]
    
    //trigger flow?
    var fn = () => {}
    stream.on('data', fn)

    mocks.tcpReadStop = [(q) => {
      t.deepEqual(q, {clientId: ID})
      return (async () => {

            return {}
      })()
    }]

    setTimeout(()=>{
      stream.pause()
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    }, 1000)

  })
})
