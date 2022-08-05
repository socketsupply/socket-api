import { Buffer } from 'buffer'

/*
 * @param {number} size - The number of bytes to generate. The size must not be larger than 2**31 - 1.
 */
export function getRandomBytes (size) {
  const tmp = new Uint8Array(size)
  const bytes = crypto.getRandomValues(tmp)
  return Buffer.from(bytes)
}

/*
 * @param {string} algorithm - `SHA-1` | `SHA-256` | `SHA-384` | `SHA-512`
 * @param {Buffer} message - An instance of io.Buffer
 */
export async function createDigest (algorithm, buf) {
  return Buffer.from(await crypto.subtle.digest(algorithm, buf))
}
