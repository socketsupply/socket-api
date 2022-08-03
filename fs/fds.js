import * as ipc from '../ipc.js'

/**
 * Static contsiner to map file descriptors to internal
 * identifiers with type reflection.
 */
export default new class FileDescriptorsMap {
  types = new Map()
  fds = new Map()
  ids = new Map()

  get size () {
    return this.ids.size
  }

  get (id) {
    return this.fds.get(id)
  }

  set (id, fd, type) {
    this.fds.set(id, fd)
    this.ids.set(fd, id)
    this.types.set(id, type)
    this.types.set(fd, type)
  }

  has (id) {
    return this.fds.has(id) || this.ids.has(id)
  }

  setEntry (id, entry) {
    if (entry.fd.length > 16) {
      this.set(id, entry.fd)
    } else {
      this.set(id, parseInt(entry.fd))
    }
  }

  fd (id) {
    return this.get(id)
  }

  id (fd) {
    return this.ids.get(fd)
  }

  async release (id) {
    const fd = this.fds.get(id)

    this.fds.delete(id)
    this.fds.delete(fd)

    this.ids.delete(fd)
    this.ids.delete(id)

    this.types.delete(id)
    this.types.delete(fd)

    try {
      const result = await ipc.send('fs.closeOpenDescriptors')
      if (result.err) {
        throw result.err
      }
    } catch (err) {
      console.warn('fs.fds.release', err.message || err)
    }
  }

  async retain (id) {
    const result = await ipc.send('fs.retainDescriptor', { id })
    if (result.err) {
      throw result.err
    }

    return result.data
  }

  delete (id) {
    this.release(id)
  }

  typeof (id) {
    return this.types.get(id) || this.types.get(this.fds.get(id))
  }

  entries () {
    return this.ids.entries()
  }
}
