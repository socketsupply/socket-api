import { readFile, writeFile } from './fs/promises.js'
import { createDigest } from './crypto.js'
import { EventEmitter } from './events.js'

async function* streamAsyncIterable(stream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * @param {Buffer} buf
 * @param {string} hashAlgorithm 
 * @returns {Promise<string>}
 */
async function getHash (buf, hashAlgorithm) {
  const digest = await createDigest(hashAlgorithm, buf)
  return digest.toString('hex')
}

// /**
//  * @param {string} dest - file path
//  * @param {string} hash - hash string
//  * @param {string} hashAlgorithm - hash algorithm 
//  * @returns {Promise<boolean>}
//  */
// export async function checkHash (dest, hash, hashAlgorithm) {
//   let buf
//   try {
//     buf = await readFile(dest)
//   } catch (err) {
//     // download if file is corrupted or does not exist
//     return false
//   }
//   return hash === await getHash(buf, hashAlgorithm)
// }

// /**
//  * @param {string} url - url to download
//  * @returns {Promise<Buffer>}
//  * @throws {Error} - if status code is not 200
//  */
// export async function download (url) {
//   const response = await fetch(url, { mode: 'cors' })
//   if (!response.ok) {
//     throw new Error(`Bootstrap request failed: ${response.status} ${response.statusText}`)
//   }
//   const contentLength = +response.headers.get('Content-Length')
//   let receivedLength = 0
//   let prevProgress = 0
//   const fileData = new Uint8Array(contentLength)

//   for await (const chunk of streamAsyncIterable(response.body)) {
//     fileData.set(chunk, receivedLength)
//     receivedLength += chunk.length
//     const progress = (receivedLength / contentLength * 100) | 0
//     if (progress !== prevProgress) {
//       this.emit('download-progress', progress)
//       prevProgress = progress
//     }
//   }
//   return fileData
// }

class Bootstrap extends EventEmitter {
  #hashActual = null

  constructor (options) {
    super()
    if (!options.url || !options.dest) {
      throw new Error('url and dest are required')
    }
    this.options = options
  }

  async run () {
    try {
      const hashMatch = await this.checkHash(this.options.dest, this.options.hash, this.options.hashAlgorithm)
      if (hashMatch) {
        this.emit('success', { updated: false })
        return
      }
      const fileBuffer = await this.download(this.options.url)
      this.emit('write-file', { status: 'started' })
      // const writeStream = createWriteStream(this.options.dest)
      // writeStream.write(fileBuffer)
      // let written = 0
      // writeStream.on('data', data => {
      //   written += data.length
      //   const progress = (written / unpacked.length * 100) | 0
      //   if (progress !== prevProgress) {
      //     this.emit('write-file-progress', progress)
      //     prevProgress = progress
      //   }
      // })
      // writeStream.on('finish', () => {
      //   this.emit('write-file', { status: 'finished' })
      //   this.emit('success', { updated: true })
      // })
      await writeFile(this.options.dest, fileBuffer, { mode: 0o755 })
      this.emit('write-file', { status: 'finished' })
      const finalHashMatch = await this.checkHash(this.options.dest, this.options.hash, this.options.hashAlgorithm)
      if (finalHashMatch) {
        this.emit('success', { updated: true })
      } else {
        this.emit('error', new Error('Hash mismatch'))
      }
    } catch (err) {
      this.emit('error', err)
      throw err
    } finally {
      this.cleanup()
    }
  }

  async checkHash (dest, hash, hashAlgorithm) {
    let buf
    try {
      buf = await readFile(dest)
    } catch (err) {
      // download if file is corrupted or does not exist
      return false
    }
    this.#hashActual = await this.getHash(buf, hashAlgorithm)
    const hashMatch = this.#hashActual === hash
    return hashMatch
  }

  async download (url) {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) {
      this.cleanup()
      throw new Error(`Bootstrap request failed: ${response.status} ${response.statusText}`)
    }
    const contentLength = +response.headers.get('Content-Length')
    let receivedLength = 0
    let prevProgress = 0
    const fileData = new Uint8Array(contentLength)

    for await (const chunk of streamAsyncIterable(response.body)) {
      fileData.set(chunk, receivedLength)
      receivedLength += chunk.length
      const progress = (receivedLength / contentLength * 100) | 0
      if (progress !== prevProgress) {
        this.emit('download-progress', progress)
        prevProgress = progress
      }
    }
    return fileData
  }

  cleanup () {
    this.removeAllListeners()
  }
}

// TODO: move to WebWorker?
export function bootstrap (options) {
  const bootstrap = new Bootstrap(options)
  bootstrap.run()
  return bootstrap
}

// TODO: move to WebWorker?
export default {
  // checkHash,
  // download,
  bootstrap
}
