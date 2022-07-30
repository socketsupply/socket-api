import { format } from '@socketsupply/io/util.js'

patch(console, 'log')
patch(console, 'info')
patch(console, 'warn')
patch(console, 'error')
patch(console, 'debug')

function patch (console, method) {
  const original = console[method].bind(console)
  console[method] = (...args) => original(format(...args))
}
