import mock from './mock.js'

import { test } from 'tapzero'
import { rand64 } from '../../util.js'
import * as net from '../../net.js'

// createServer, call listen, close server
test('net.createServer', async t => {
  return new Promise((resolve) => {
    const server = net.createServer(() => {
      // no actual connections on this test
    })
    const ID = server.id
    // should not have sent a message yet
    mock.create(t, 'tcpCreateServer',
      { port: 9000, address: '127.0.0.1' },
      { data: { id: ID, port: 9000, address: '127.0.0.1', family: 'IPv4' } }
    )

    // unref does nothing, but returns self
    t.equal(server.unref(), server)

    // the default behaviour seems to be to listen on IPv6,
    // guessing that probably depends on the system though.
    server.listen(9000, '127.0.0.1', function () {
      t.deepEqual(
        server.address(),
        { port: 9000, address: '127.0.0.1', family: 'IPv4' }
      )

      mock.create(t, 'tcpClose', { id: ID }, {})

      server.close(function () {
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        resolve()
      })
    })
  })
})

// net.connect returns socket, write data, receive data, end stream

test('net.connect', async t => {
  return new Promise((resolve) => {
    const ID = rand64()
    const HELLO = 'Hello, World!\n'

    mock.create(t, 'tcpConnect',
      { port: 9000, address: '127.0.0.1' },
      {
        data: {
          id: ID
        }
      }
    )

    const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
      t.equal(_stream, stream)
      t.equal(err, null)
      t.equal(stream.allowHalfOpen, false)

      const ID = _stream.id

      mock.create(t, 'tcpSend',
        { id: ID, data: HELLO },
        {}
      )

      mock.methods.tcpReadStart = [q => {
        t.deepEqual(q, { id: ID })
        return (async () => {
          return {}
        })()
      }]

      // using setTimeout here is a sign we don't understand something.
      //
      setTimeout(() => {
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        mock.create(t, 'tcpShutdown',
          { id: ID },
          {}
        )
        mock.create(t, 'tcpClose',
          { id: ID },
          {}
        )
        stream.__write('')

        stream.end()
        stream.on('close', () => {
          t.deepEqual(mock.methods, {}, 'no uncalled methods')
          resolve()
        })
      }, 100)
      stream.write(HELLO)
    })

    t.ok(_stream)
  })
})

test('net.connect, allowHalfOpen=false', async (t) => {
  return new Promise((resolve) => {
    const ID = rand64()
    let ended = false
    mock.create(t, 'tcpConnect',
      { port: 9000, address: '127.0.0.1' },
      {
        data: {
          id: ID
        }
      }
    )

    const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
      t.equal(_stream, stream)
      t.equal(err, null)
      t.equal(stream.allowHalfOpen, false)

      const ID = _stream.id

      stream.on('end', function () {
        ended = true
      })
      mock.create(t, 'tcpShutdown',
        { id: ID },
        {}
      )
      mock.create(t, 'tcpClose',
        { id: ID },
        {}
      )
      stream.end()
      stream.__write('')

      stream.on('close', () => {
        t.ok(ended)
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        resolve()
      })
    })
    t.ok(_stream)
  })
})

test('net.connect allowHalfOpen=true', async (t) => {
  return new Promise((resolve) => {
    const ID = rand64()
    let ended = false

    mock.create(t, 'tcpConnect',
      { port: 9000, address: '127.0.0.1' },
      {
        data: {
          id: ID
        }
      }
    )
    const _stream = net.connect({
      port: 9000,
      host: '127.0.0.1',
      allowHalfOpen: true
    }, function (err, stream) {
      t.equal(_stream, stream)
      t.equal(err, null)
      t.equal(stream.allowHalfOpen, true)

      const ID = _stream.id

      stream.on('end', function () {
        ended = true
        stream.end()
      })

      mock.create(t, 'tcpShutdown',
        { id: ID },
        {}
      )

      mock.create(t, 'tcpClose',
        { id: ID },
        {}
      )

      stream.__write('')

      stream.on('close', () => {
        t.ok(ended)
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        resolve()
      })
    })
    t.ok(_stream)
  })
})

test('net.connect allowHalfOpen=true, write write write', (t) => {
  return new Promise((resolve) => {
    const ID = rand64()
    const HELLO = 'Hello, World!\n'
    let ended = false
    mock.create(t, 'tcpConnect',
      { port: 9000, address: '127.0.0.1' },
      {
        data: {
          id: ID
        }
      }
    )
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

      const ID = _stream.id

      function next (data) {
        const p = new Promise((resolve) => {
          waiting.push(resolve)
        })
        return (args) => {
          t.equal(args.id, ID)
          t.equal(data, args.data)
          return p
        }
      }

      mock.methods.tcpSend = [
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

      mock.create(t, 'tcpShutdown',
        { id: ID },
        {}
      )

      mock.create(t, 'tcpClose',
        { id: ID },
        {}
      )

      stream.on('close', () => {
        t.ok(ended)
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        resolve()
      })
    })
    t.ok(_stream)
  })
})

test.skip('net.connect', async (t) => {
  return new Promise((resolve) => {
    const ID = rand64()
    mock.create(t, 'tcpConnect',
      { port: 9000, address: '127.0.0.1' },
      {
        data: {
          id: ID
        }
      }
    )

    const _stream = net.connect(9000, '127.0.0.1', function (err, stream) {
      t.equal(_stream, stream)
      t.equal(err, null)
      t.equal(stream.allowHalfOpen, false)

      const ID = _stream.id

      mock.methods.tcpReadStart = [(q) => {
        t.deepEqual(q, { id: ID })
        return (async () => {
          return {}
        })()
      }]

      // using setTimeout here is a sign we don't understand something.
      //
      setTimeout(() => {
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        mock.create(t, 'tcpShutdown',
          { id: ID },
          {}
        )

        mock.create(t, 'tcpClose',
          { id: ID },
          {}
        )

        stream.__write('')

        stream.end()
        stream.on('close', () => {
          t.deepEqual(mock.methods, {}, 'no uncalled methods')
          resolve()
        })
      }, 100)
      //    stream.write(HELLO)
    })
    t.ok(_stream)
  })
})

test('net.connect allowHalfOpen=true readStart readStop', (t) => {
  return new Promise((resolve) => {
    const ID = rand64()
    const HELLO = 'Hello, World!\n'

    mock.create(t, 'tcpConnect',
      { port: 9000, address: '127.0.0.1' },
      {
        data: {
          id: ID
        }
      }
    )

    const _stream = net.connect({
      port: 9000,
      host: '127.0.0.1',
      allowHalfOpen: true
    }, function (err, stream) {
      t.equal(_stream, stream)
      t.equal(err, null)
      t.equal(stream.allowHalfOpen, true)

      const ID = _stream.id

      //    stream.end()
      mock.methods.tcpReadStart = [(q) => {
        t.deepEqual(q, { id: ID })
        return (async () => {
          return { data: HELLO }
        })()
      }]

      // trigger flow?
      const fn = () => {}
      stream.on('data', fn)

      mock.methods.tcpReadStop = [(q) => {
        t.deepEqual(q, { id: ID })
        return (async () => {
          return {}
        })()
      }]

      setTimeout(() => {
        stream.pause()
        t.deepEqual(mock.methods, {}, 'no uncalled methods')
        resolve()
      }, 1000)
    })
  })
})
