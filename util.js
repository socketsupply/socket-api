import { Buffer } from 'buffer'

const TypedArray = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor

export function isTypedArray (object) {
  return object instanceof TypedArray
}

export function isEmptyObject (object) {
  return (
    object !== null &&
    typeof object === 'object' &&
    Object.keys(object).length === 0
  )
}

export function isBufferLike (object) {
  return isTypedArray(object) || Buffer.isBuffer(object)
}

export function isFunction (value) {
  return typeof value === 'function' && !/class/.test(value.toString())
}

export function isPromiseLike (object) {
  return isFunction(object?.then)
}

export function toBuffer (object) {
  if (Buffer.isBuffer(object)) {
    return object
  } else if (isTypedArray(object)) {
    return Buffer.from(object.buffer)
  }

  return Buffer.from(object)
}

export function toProperCase (string) {
  return string[0].toUpperCase() + string.slice(1)
}

// so this is re-used instead of creating new one each rand64() call
const tmp = new BigUint64Array(1)
export function rand64 () {
  return globalThis.crypto.getRandomValues(tmp)[0]
}

export function splitBuffer (buffer, highWaterMark) {
  const buffers = []

  do {
    buffers.push(buffer.slice(0, highWaterMark))
    buffer = buffer.slice(highWaterMark)
  } while (buffer.length > highWaterMark)

  if (buffer.length) {
    buffers.push(buffer)
  }

  return buffers
}

export function InvertedPromise () {
  const context = {}
  const promise = new Promise((resolve, reject) => {
    Object.assign(context, {
      resolve (value) {
        promise.value = value
        resolve(value)
        return promise
      },

      reject (error) {
        promise.error = error
        reject(error)
        return promise
      }
    })
  })

  return Object.assign(promise, context)
}
