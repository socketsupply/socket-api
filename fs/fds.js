'use strict'

const fds = new Map()
const ids = new Map()

function get (id) {
  return fds.get(id)
}

function set (id, fd) {
  fds.set(id, fd)
  ids.set(fd, id)
}

function to (fd) {
  return ids.get(fd)
}

function release (id) {
  const fd = fds.get(id)
  fds.delete(id)
  ids.delete(fd)
}

export default {
  get,
  release,
  set,
  to
}
