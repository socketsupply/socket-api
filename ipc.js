async function ready () {
  return await new Promise((resolve) => {
    return loop()

    function loop () {
      if (window._ipc) { resolve() }
      else { queueMicrotask(loop) }
    }
  })
}

function sendSync (command, params) {
  const request = new XMLHttpRequest()
  const index = window.process ? window.process.index : 0
  const seq = window._ipc ? window._ipc.nextSeq++ : 0
  const uri = `ipc://${command}`

  params = new URLSearchParams(params)
  params.set('index', index)
  params.set('seq', seq)

  const query = `?${params}`

  request.open('GET', uri + query, false)
  request.send(null)

  return request.response
}

async function emit (...args) {
  await ready()
  return await window._ipc.emit(...args)
}

async function resolve (...args) {
  await ready()
  return await window._ipc.resolve(...args)
}

async function send (...args) {
  await ready()
  return await window._ipc.send(...args)
}

module.exports = {
  emit,
  ready,
  resolve,
  send,
  sendSync
}
