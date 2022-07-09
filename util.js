const { Buffer } = require('./buffer')

const _require = typeof require !== 'undefined' && require

const TypedArray = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor

function isTypedArray (object) {
  return object instanceof TypedArray
}

function isBufferLike (object) {
  return isTypedArray(object) || Buffer.isBuffer(object)
}

function toBuffer (object) {
  if (Buffer.isBuffer(object)) {
    return object
  } else if (isTypedArray(object)) {
    return Buffer.from(object.buffer)
  }

  return Buffer.from(object)
}

// so this is re-used instead of creating new one each rand64() call
const tmp = new BigUint64Array(1)
function rand64 () {
  const crypto = globalThis.crypto ? globalThis.crypto : _require('crypto').webcrypto
  return crypto.getRandomValues(tmp)[0]
}

module.exports = {
  isBufferLike,
  isTypedArray,
  rand64,
  toBuffer
}
