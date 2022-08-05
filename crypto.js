import { Buffer } from 'buffer'

export function getRandomBytes (n) {
  const tmp = new Uint8Array(n)
  const bytes = crypto.getRandomValues(tmp)
  return Buffer.from(bytes)
}
