'use strict'

const { test } = require('tape')
const util = require('./util')

const mocks = {}
global.window = { _ipc: util.mockIPCObject(mocks) }

const net = require('../net')

// createServer, call listen, close server
test('net.createServer', t => {
  const server = net.createServer(() => {
    // no actual connections on this test
  })
  const ID = util.rand64()
  // should not have sent a message yet
  mocks.tcpCreateServer = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    { data: { serverId: ID, port: 9000, address: '127.0.0.1', family: 'IPv4' } }
  )]

  // unref does nothing, but returns self
  t.equal(server.unref(), server)

  // the default behaviour seems to be to listen on IPv6,
  // guessing that probably depends on the system though.
  server.listen(9000, '127.0.0.1', function () {
    t.deepEqual(
      server.address(),
      { port: 9000, address: '127.0.0.1', family: 'IPv4' }
    )

    mocks.tcpClose = [util.expect(t, { serverId: ID }, {})]

    server.close(function () {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
})

// net.connect returns socket, write data, receive data, end stream

test('net.connect', t => {
  const ID = util.rand64()
  const HELLO = 'Hello, World!\n'

  mocks.tcpConnect = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]

  const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, false)

    mocks.tcpSend = [util.expect(t,
      { clientId: ID, data: HELLO },
      {}
    )]
    mocks.tcpReadStart = [(q) => {
      t.deepEqual(q, { clientId: ID })
      return (async () => {
        return {}
      })()
    }]

    // using setTimeout here is a sign we don't understand something.
    //
    setTimeout(() => {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      mocks.tcpShutdown = [util.expect(t,
        { clientId: ID },
        {}
      )]
      mocks.tcpClose = [util.expect(t,
        { clientId: ID },
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

test('net.connect, allowHalfOpen=false', (t) => {
  const ID = util.rand64()
  let ended = false
  mocks.tcpConnect = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]

  const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, false)

    stream.on('end', function () {
      ended = true
    })
    mocks.tcpShutdown = [util.expect(t,
      { clientId: ID },
      {}
    )]
    mocks.tcpClose = [util.expect(t,
      { clientId: ID },
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

test('net.connect allowHalfOpen=true', (t) => {
  const ID = util.rand64()
  let ended = false

  mocks.tcpConnect = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]
  const _stream = net.connect({
    port: 9000,
    host: '127.0.0.1',
    allowHalfOpen: true
  }, function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, true)

    stream.on('end', function () {
      ended = true
      stream.end()
    })
    mocks.tcpShutdown = [util.expect(t,
      { clientId: ID },
      {}
    )]
    mocks.tcpClose = [util.expect(t,
      { clientId: ID },
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

test('net.connect allowHalfOpen=true, write write write', (t) => {
  const ID = util.rand64()
  const HELLO = 'Hello, World!\n'
  let ended = false
  mocks.tcpConnect = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]
  const _stream = net.connect({
    port: 9000,
    host: '127.0.0.1',
    allowHalfOpen: true
  }, function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, true)
    // to just test writes, end the read side immediately
    // (by simulated end receive '')
    stream.__write('')

    stream.on('end', function () {
      ended = true
    })

    const waiting = []

    function next (data) {
      const p = new Promise((resolve) => {
        waiting.push(resolve)
      })
      return (args) => {
        t.equal(args.clientId, ID)
        t.equal(data, args.data)
        return p
      }
    }

    mocks.tcpSend = [
      next(HELLO + 1),
      next(HELLO + 2),
      next(HELLO + 3),
      next(HELLO + 4),
      next(HELLO + 5),
      next(HELLO + 6),
      next(HELLO + 7)
    ]

    stream.write(HELLO + 1)
    stream.write(HELLO + 2)
    stream.write(HELLO + 3)
    stream.write(HELLO + 4)
    stream.write(HELLO + 5)
    stream.write(HELLO + 6)
    stream.write(HELLO + 7)

    stream.end()

    const int = setInterval(() => {
      waiting.shift()({})
      if (!waiting.length) {
        clearInterval(int)
      }
    }, 100)

    mocks.tcpShutdown = [util.expect(t,
      { clientId: ID },
      {}
    )]
    mocks.tcpClose = [util.expect(t,
      { clientId: ID },
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

test.skip('net.connect', (t) => {
  const ID = util.rand64()
  mocks.tcpConnect = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]
  const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, false)

    //    mocks.tcpSend = [util.expect(t,
    //      {clientId: ID, data: HELLO},
    //      {}
    //    )]
    mocks.tcpReadStart = [(q) => {
      t.deepEqual(q, { clientId: ID })
      return (async () => {
        return {}
      })()
    }]

    // using setTimeout here is a sign we don't understand something.
    //
    setTimeout(() => {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      mocks.tcpShutdown = [util.expect(t,
        { clientId: ID },
        {}
      )]
      mocks.tcpClose = [util.expect(t,
        { clientId: ID },
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

test('net.connect allowHalfOpen=true readStart readStop', (t) => {
  const ID = util.rand64()
  const HELLO = 'Hello, World!\n'
  mocks.tcpConnect = [util.expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]
  const _stream = net.connect({
    port: 9000,
    host: '127.0.0.1',
    allowHalfOpen: true
  }, function (err, stream) {
    t.equal(_stream, stream)
    t.equal(err, null)
    t.equal(stream.allowHalfOpen, true)
    //    stream.end()
    mocks.tcpReadStart = [(q) => {
      t.deepEqual(q, { clientId: ID })
      return (async () => {
        return { data: HELLO }
      })()
    }]

    // trigger flow?
    const fn = () => {}
    stream.on('data', fn)

    mocks.tcpReadStop = [(q) => {
      t.deepEqual(q, { clientId: ID })
      return (async () => {
        return {}
      })()
    }]

    setTimeout(() => {
      stream.pause()
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    }, 1000)
  })
})
