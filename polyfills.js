import ipc from './ipc.js'

export function applyPolyFills (window) {
  Object.defineProperties(window, Object.getOwnPropertyDescriptors({
    get title () {
      return window?.__args?.title
    },

    set title (value) {
      const index = window.__args.index
      const o = new URLSearchParams({ value, index }).toString()
      ipc.postMessage(`ipc://title?${o}`)
    },

    async resizeTo (width, height) {
      const index = window.__args.index
      const o = new URLSearchParams({ width, height, index }).toString()
      return await ipc.send('size', o)
    },

    // TODO(@heapwolf) the properties do not yet conform to the MDN spec
    async showOpenFilePicker (o) {
      console.warn('window.showOpenFilePicker may not coform to the standard')
      const files = await ipc.send('dialog', { type: 'open', ...o })
      return typeof files === 'string' ? files.split('\n') : []
    },

    // TODO(@heapwolf) the properties do not yet conform to the MDN spec
    async showSaveFilePicker (o) {
      console.warn('window.showSaveFilePicker may not coform to the standard')
      const files = await ipc.send('dialog', { type: 'save', ...o })
      return typeof files === 'string' ? files.split('\n') : []
    },

    // TODO(@heapwolf) the properties do not yet conform to the MDN spec
    async showDirectoryFilePicker (o) {
      console.warn('window.showDirectoryFilePicker may not coform to the standard')
      const files = await ipc.send('dialog', { allowDirs: true, ...o })
      return typeof files === 'string' ? files.split('\n') : []
    }
  }))
}
