'use strict'

const methods = {}

global.window = {
  _ipc: {
    send (name, value) {
      let mock
      console.log('call mock:', name, value)

      if (methods[name] === null || methods[name].length === 0) {
        throw new Error('unexpected: ' + name + ', ' + JSON.stringify(value))
      }

      if (Array.isArray(methods[name])) {
        mock = methods[name].shift()

        if (methods[name].length === 0) {
          delete methods[name]
        }
      } else {
        mock = methods[name]
      }
      return mock(value)
    },
    streams: {}
  }
}

const create = (t, name, args, result) => {
  methods[name] = methods[name] || []

  methods[name].push((_args) => {
    for (const k in args) {
      t.equal(_args[k], args[k], `property: ${k}`)
    }

    return Promise.resolve(result)
  })
}

module.exports = {
  create,
  methods
}
