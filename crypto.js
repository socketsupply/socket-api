/**
 * @module Crypto
 *
 * Some high level methods around the `crypto.subtle` api for getting
 * random bytes and hashing.
 */

import { Buffer } from './buffer.js'

const parent = typeof window === 'object' ? window : globalThis

/**
 * WebCrypto API
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/Crypto}
 */
export const webcrypto = parent.crypto?.webcrypto ?? parent.crypto

/**
 * Generate cryptographically strong random values into `buffer`
 * @param {TypedArray} buffer
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues}
 * @return {TypedArray}
 */
export function getRandomValues (...args) {
  if (typeof webcrypto?.getRandomValues === 'function') {
    return webcrypto?.getRandomValues(...args)
  }

  console.warn('Missing implementation for parent.crypto.getRandomValues()')
  return null
}

/**
 * Maximum total size of random bytes per page
 */
export const RANDOM_BYTES_QUOTA = 64 * 1024

/**
 * Maximum total size for random bytes.
 */
export const MAX_RANDOM_BYTES = 0xFFFF_FFFF_FFFF

/**
 * Maximum total amount of allocated per page of bytes (max/quota)
 */
export const MAX_RANDOM_BYTES_PAGES = MAX_RANDOM_BYTES / RANDOM_BYTES_QUOTA

/**
 * Generate `size` random bytes.
 * @param {number} size - The number of bytes to generate. The size must not be larger than 2**31 - 1.
 * @returns {Buffer} - A promise that resolves with an instance of io.Buffer with random bytes.
 */
export function randomBytes (size) {
  const buffers = []

  if (size < 0 || size >= MAX_RANDOM_BYTES || !Number.isInteger(size)) {
    throw Object.assign(new RangeError(
      `The value of "size" is out of range. It must be >= 0 && <= ${max}. ` +
      `Received ${size}`
    ), {
      code: 'ERR_OUT_OF_RANGE'
    })
  }

  do {
    const length = size > RANDOM_BYTES_QUOTA ? RANDOM_BYTES_QUOTA : size
    const bytes = getRandomValues(new Int8Array(length))
    buffers.push(Buffer.from(bytes))
    size = Math.max(0, size - RANDOM_BYTES_QUOTA)
  } while (size > 0);

  return Buffer.concat(buffers)
}

/**
 * @param {string} algorithm - `SHA-1` | `SHA-256` | `SHA-384` | `SHA-512`
 * @param {Buffer | TypedArray | DataView} message - An instance of io.Buffer, TypedArray or Dataview.
 * @returns {Promise<Buffer>} - A promise that resolves with an instance of io.Buffer with the hash.
 */
export async function createDigest (algorithm, buf) {
  return Buffer.from(await webcrypto.subtle.digest(algorithm, buf))
}

import * as exports from './crypto.js'
export default exports
