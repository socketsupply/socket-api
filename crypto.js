/*
 * @module Crypto
 *
 * Some high level methods around the `crypto.subtle` api for getting
 * random bytes and hashing.
 */

import { Buffer } from 'buffer'

/*
 * @param {number} size - The number of bytes to generate. The size must not be larger than 2**31 - 1.
 * @returns {Promise<Buffer>} - A promise that resolves with an instance of io.Buffer with random bytes.
 */
export function randomBytes (size) {
  const tmp = new Uint8Array(size)
  const bytes = crypto.getRandomValues(tmp)
  return Buffer.from(bytes)
}

/*
 * @param {string} algorithm - `SHA-1` | `SHA-256` | `SHA-384` | `SHA-512`
 * @param {Buffer | TypedArray | DataView} message - An instance of io.Buffer
 * @returns {Promise<Buffer>} - A promise that resolves with an instance of io.Buffer with the hash.
 */
export async function createDigest (algorithm, buf) {
  return Buffer.from(await crypto.subtle.digest(algorithm, buf))
}
