export class AbortError extends Error {
  static get code () { return 20 }
  constructor (reason, signal, code) {
    if (reason?.reason) {
      signal = reason
      reason = signal.reason
    }

    super(reason || signal?.reason || '')

    this.name = 'AbortError'
    this.code = code || AbortError.code
    this.signal = signal || null
  }
}

export class InternalError extends Error {
  constructor (...args) {
    super(...args)

    this.name = 'InternalError'
  }
}
