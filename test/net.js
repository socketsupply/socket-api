'use strict'

const mocks = {}
const test = require('node:test')

const createId = () => Math.random()
const P = value => new Promise(resolve => resolve(value))

global.window = {
  _ipc: {
    send (name, value) {
      let mock
      console.log('call mock:', name, value)
      if (mocks[name] === null || mocks[name].length === 0) { throw new Error('unexpected send:' + name + ', ' + JSON.stringify(value)) }
      if (Array.isArray(mocks[name])) {
        mock = mocks[name].shift()
        if (mocks[name].length === 0) { delete mocks[name] }
      } else { mock = mocks[name] }
      return mock(value)
    },
    streams: {}
  }
}

function Expect (t, args, result) {
  return (_args) => {
    for (const k in args) { t.equal(_args[k], args[k], 'property:' + k) }
    return P(result)
  }
}

const net = require('../net')

// createServer, call listen, close server
test('net.createServer', t => {
  const server = net.createServer(() => {
    // no actual connections on this test
  })
  const ID = createId()
  // should not have sent a message yet
  mocks.tcpCreateServer = [Expect(t,
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

    mocks.tcpClose = [Expect(t, { serverId: ID }, {})]

    server.close(function () {
      t.deepEqual(mocks, {}, 'no uncalled mocks')
      t.end()
    })
  })
})

// net.connect returns socket, write data, receive data, end stream

test('net.connect', t => {
  const ID = createId()
  mocks.tcpConnect = [Expect(t,
    { port: 9000, address: '127.0.0.1' },
    {
      data: {
        clientId: ID
      }
    }
  )]

  const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
    console.log('CONNECT', err, stream)
    t.equal(_stream, stream)
    t.deepEqual(mocks, {}, 'no uncalled mocks')
    t.end()
  })

  t.ok(_stream)
})
