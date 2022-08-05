import { readFile as fsReadFile, writeFile } from './fs/promises.js'
import { createDigest } from './crypto.js'
import { EventEmitter } from './events.js'
import { isAsyncFunction, isPromiseLike } from './util.js'

class Bootstrap extends EventEmitter {
  #hashUnpackedActual = null

  constructor (options) {
    super()
    if (!options.src || !options.dest) {
      throw new Error('src and dest are required')
    }
    this.options = options
  }

  async run () {
    try {
      const shouldDownlod = await this.shouldDownload(this.options.dest, this.options.hashUnpacked, this.options.hashAlgorithm)
      if (shouldDownlod) {
        const downloaded = await this.download(this.options.src, this.options.hashDownloaded, this.options.hashAlgorithm)
        const unpacked = await this.unpack(downloaded, this.options.unpack, this.options.hashUnpacked, this.options.hashAlgorithm)
        this.emit('write-file', { status: 'started' })
        // TODO: add writeFile progress
        await writeFile(this.options.dest, unpacked, { mode: 0o755 })
        this.emit('write-file', { status: 'finished' })
        this.emit('success', { updated: true })
      } else {
        this.emit('success', { updated: false })
      }
    } catch (err) {
      this.emit('error', err)
      throw err
    } finally {
      this.cleanup()
    }
  }

  async getHash (buf, hashAlgorithm) {
    const digest = await createDigest(hashAlgorithm, buf)
    return digest.toString('hex')
  }

  async shouldDownload (dest, hashUnpacked, hashAlgorithm) {
    let buf
    try {
      buf = await fsReadFile(dest)
    } catch (err) {
      return true
    }
    if (hashUnpacked) {
      this.#hashUnpackedActual = await this.getHash(buf, hashAlgorithm)
      return this.#hashUnpackedActual !== hashUnpacked
    }
  }

  async download (src, hashDownloaded, hashAlgorithm) {
    const response = await fetch(src, {
      mode: 'cors'
    })
    if (!response.ok) {
      this.cleanup()
      throw new Error(`Bootstrap request faild: ${response.status} ${response.statusText}`)
    }
    const reader = response.body.getReader()
    const contentLength = +response.headers.get('Content-Length')
    let receivedLength = 0
    let chunks = []

    const read = async () => {
      const {done, value} = await reader.read();
      if (done) return
      chunks.push(value);
      receivedLength += value.length;
      this.emit('download-progress', (receivedLength / contentLength * 100) | 0)
      await read()
    }
    await read ()

    const uint8data = new Uint8Array(receivedLength);
    let position = 0;
    for(let chunk of chunks) {
      uint8data.set(chunk, position);
      position += chunk.length;
    }

    if (hashDownloaded) {
      const hashDownloadedActual = await this.getHash(uint8data, hashAlgorithm)
      if (hashDownloadedActual !== hashDownloaded) {
        this.cleanup()
        throw new Error(`Hash mismatch (downloaded): ${hashDownloadedActual} !== ${hashDownloaded}`)  
      }
    }

    return uint8data
  }

  async unpack (buf, unpack, hashUnpacked, hashAlgorithm) {
    if (typeof unpack !== 'function') {
      return buf
    }
    this.emit('unpack', { status: 'started' })
    let unpacked = unpack(buf)
    if (isAsyncFunction(unpack) || isPromiseLike(unpacked)) {
      unpacked = await unpacked
    }
    this.emit('unpack', { status: 'finished' })
    if (hashUnpacked) {
      this.#hashUnpackedActual ??= await this.getHash(unpacked, hashAlgorithm)
      if (this.#hashUnpackedActual !== hashUnpacked) {
        this.cleanup()
        throw new Error(`Hash mismatch (unpacked): ${this.#hashUnpackedActual} !== ${hashUnpacked}`)
      }
    }
    return unpacked
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
