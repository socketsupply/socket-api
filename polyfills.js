import ipc from './ipc.js'
import { args } from './runtime.js'

export function applyPolyFills (window) {
  Object.defineProperties(window, Object.getOwnPropertyDescriptors({
    async resizeTo (width, height) {
      return ipc.send('size', { width, height })
    },

    // TODO(@heapwolf) the properties do not yet conform to the MDN spec
    async showOpenFilePicker (o) {
      console.warn('window.showOpenFilePicker may not conform to the standard')
      const files = await ipc.send('dialog', { type: 'open', ...o })
      return typeof files === 'string' ? files.split('\n') : []
    },

    // TODO(@heapwolf) the properties do not yet conform to the MDN spec
    async showSaveFilePicker (o) {
      console.warn('window.showSaveFilePicker may not conform to the standard')
      const files = await ipc.send('dialog', { type: 'save', ...o })
      return typeof files === 'string' ? files.split('\n') : []
    },

    // TODO(@heapwolf) the properties do not yet conform to the MDN spec
    async showDirectoryFilePicker (o) {
      console.warn('window.showDirectoryFilePicker may not conform to the standard')
      const files = await ipc.send('dialog', { allowDirs: true, ...o })
      return typeof files === 'string' ? files.split('\n') : []
    },

    get name () {
      return window.__args.title
    },

    // window.document.title is uncofigurable property
    set name (value) {
      const index = window.__args.index
      const o = new URLSearchParams({ value, index }).toString()
      console.log(`ipc://title?${o}`)
      ipc.postMessage(`ipc://title?${o}`)
      args.title = window.__args.title = value
    }
  }))


  // TODO: It's not configurable. We'd need to use a Proxy to make it configurable.
  // Object.defineProperty(window.document, 'title', {
  //   get () {
  //     return window.__args.title
  //   },
  //   set (value) {
  //     const index = window.__args.index
  //     const o = new URLSearchParams({ value, index }).toString()
  //     ipc.postMessage(`ipc://title?${o}`)
  //   }
  // })
}
