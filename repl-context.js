import { format } from './util.js'
import * as ipc from './ipc.js'
import * as io from './index.js'

window.io = io

patchConsole('log')
patchConsole('info')
patchConsole('warn')
patchConsole('error')
patchConsole('debug')

function patchConsole (method) {
  const original = console[method].bind(console)
  console[method] = (...args) => original(format(...args))
}

window.addEventListener('eval', (event) => {
  evaluate(event.detail)
})

async function evaluate ({ cmd, id }) {
  try {
    const result = await ipc.request('render.eval', { value: cmd })
    await ipc.send('result', {
      id,
      value: result.err ? result.err.message : format(result.data)
    })
  } catch (err) {
    await ipc.send('result', { id, error: true, value: err.message })
  }
}
