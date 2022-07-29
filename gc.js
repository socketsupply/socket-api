if (typeof FinalizationRegistry === 'undefined') {
  console.warn('FinalizationRegistry is not implemented in this environment')
  class FinalizationRegistry {}
}

// static held value to persist bound `Finalizer#handle()` function from being
// gc'd before the `FinalizationRegistry` callback is called because the
// finalizer()` must be strongly held
const scope = Object.create(null)
export const finalizers = new WeakMap()
export const kFinalizer = Symbol.for('gc.finalizer')

/**
 * Static registry for objects to clean up underlying resources when they
 * are gc'd by the environment. There is no guarantee that the `finalizer()`
 * is called at any time.
 */
export const registry = new FinalizationRegistry(async (finalizer) => {
  if (typeof finalizer.handle === 'function') {
    try {
      await finalizer.handle(...finalizer.args)
    } catch (err) {
      consoel.warn('FinalizationRegistry:', err.message)
    }

    finalizer = undefined
  }
})

/**
 * A container for strongly referenced finalizer function
 * with arguments weakly referenced to an object that will be
 * garbage collected.
 */
export class Finalizer {
  /**
   * Creates a `Finalizer` from input.
   */
  static from (handler) {
    if (typeof handler === 'function') {
      return new this([], handler)
    }

    let { handle , args } = handler

    if (typeof handle === 'function') {
      handle = () => void 0
    }

    if (!Array.isArray(args)) {
      args = []
    }

    return new this(args, handle)
  }

  /**
   * `Finalizer` class constructor.
   * @private
   * @param {array} args
   * @param {function} handle
   */
  constructor (args, handle) {
    this.args = args
    this.handle = handle.bind(scope)
  }
}

/**
 * Track `object` ref to call `Symbol.for('gc.finalize')` method when
 * environment garbage collects object.
 * @param {object} object
 * @return {boolean}
 */
export async function ref (object, ...args) {
  if (object && typeof object[kFinalizer] === 'function') {
    const finalizer = Finalizer.from(await object[kFinalizer](...args))
    finalizers.set(object, finalizer)
    registry.register(object, finalizer, object)
  }

  return finalizers.has(object)
}

/**
 * Stop tracking `object` ref to call `Symbol.for('gc.finalize')` method when
 * environment garbage collects object.
 * @param {object} object
 * @return {boolean}
 */
export function unref (object) {
  if (!object || typeof object !== 'object') {
    return false
  }

  if (typeof object[kFinalizer] === 'function' && finalizers.has(object)) {
    finalizers.delete(object)
    registry.unregister(object)
    return true
  }

  return false
}

export default {
  ref,
  unref,
  registry,
  finalizers,
  finalizer: kFinalizer
}
