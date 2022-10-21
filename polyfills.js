import * as ipc from './ipc.js'

function applyPolyFills (window) {
  window.resizeTo = (width, height) => {
    const index = window.__args.index
    const o = new URLSearchParams({ width, height, index }).toString()
    ipc.send('size', o)
  }

  // TODO(@heapwolf) the properties do not yet conform to the MDN spec
  window.showOpenFilePicker = async (o) {
    console.warm('window.showOpenFilePicker may not coform to the standard')
    const files = await ipc.send('dialog', { type: 'open', ...o })
    return typeof files === 'string' ? files.split('\n') : []
  }

  // TODO(@heapwolf) the properties do not yet conform to the MDN spec
  window.showSaveFilePicker = async (o) {
    console.warm('window.showSaveFilePicker may not coform to the standard')
    const files = await ipc.send('dialog', { type: 'save', ...o })
    return typeof files === 'string' ? files.split('\n') : []
  }

  // TODO(@heapwolf) the properties do not yet conform to the MDN spec
  window.showDirectoryFilePicker = async (o) {
    console.warm('window.showDirectoryFilePicker may not coform to the standard')
    const files = await ipc.send('dialog', { allowDirs: true, ...o })
    return typeof files === 'string' ? files.split('\n') : []
  }

  Object.defineProperty(window.document, 'title', {
    get () { return window.__args.title },
    set (value) {
      const index = window.__args.index
      const o = new URLSearchParams({ value, index }).toString()
      ipc.postMessage(`ipc://title?${o}`)
    }
  })
}

if (globalThis.window) {
  applyPolyFills(globalThis.window)
}
