export class AbortError extends Error {
  static get code () { return 20 }
  constructor (signal) {
    super(signal.reason)
    this.code = AbortError.code
    this.signal = signal
  }
}
