/**
 * @module Crypto
 *
 * Some high level methods around the `crypto.subtle` api for getting
 * random bytes and hashing.
 */

import { Buffer } from './buffer.js'

const parent = typeof window === 'object' ? window : globalThis
const { crypto } = parent

/**
 * Generate cryptographically strong random values into `buffer`
 * @param {TypedArray} buffer
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues}
 * @return {TypedArray}
 */
export const getRandomValues = crypto?.getRandomValues?.bind(crypto)

/**
 * Generate `size` random bytes.
 * @param {number} size - The number of bytes to generate. The size must not be larger than 2**31 - 1.
 * @returns {Buffer} - A promise that resolves with an instance of io.Buffer with random bytes.
 */
export function randomBytes (size) {
  const tmp = new Int8Array(size)
  const bytes = getRandomValues(tmp)
  return Buffer.from(bytes)
}

/**
 * @param {string} algorithm - `SHA-1` | `SHA-256` | `SHA-384` | `SHA-512`
 * @param {Buffer | TypedArray | DataView} message - An instance of io.Buffer, TypedArray or Dataview.
 * @returns {Promise<Buffer>} - A promise that resolves with an instance of io.Buffer with the hash.
 */
export async function createDigest (algorithm, buf) {
  return Buffer.from(await crypto.subtle.digest(algorithm, buf))
}

import * as exports from './crypto.js'
export default exports
