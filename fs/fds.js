export default new class FileDescriptorsMap {
  fds = new Map()
  ids = new Map()

  get (id) {
    return this.fds.get(id)
  }

  set (id, fd) {
    this.fds.set(id, fd)
    this.ids.set(fd, id)
  }

  to (fd) {
    return this.ids.get(fd)
  }

  release (id) {
    const fd = this.fds.get(id)
    this.fds.delete(id)
    this.ids.delete(fd)
  }
}
