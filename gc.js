if (typeof FinalizationRegistry === 'undefined') {
  console.warn('FinalizationRegistry is not implemented in this environment')
  class FinalizationRegistry {}
}

export const refs = new WeakMap()
export const registry = new FinalizationRegistry(finalize)
export const kFinalize = Symbol.for('gc.finalize')

/**
 * `FinalizationRegistry` finalize function handler
 */
export function finalize (finalizeHandle) {
  if (typeof finalizeHandle === 'function') {
    let [object, args] = refs.get(finalizeHandle)
    console.warn('gc.finalize():', object, args)
    finalizeHandle.apply(object, args)
    refs.delete(finalizeHandle)
    object = undefined
    args = undefined
  }
}

/**
 * Track `object` ref to call `Symbol.for('gc.finalize')` method when
 * environment garbage collects object.
 * @param {object} object
 * @return {boolean}
 */
export function ref (object, ...args) {
  if (object && typeof object[kFinalize] === 'function') {
    refs.set(object[kFinalize], [object, args])
    registry.register(object, object[kFinalize], object)
  }

  return refs.has(object)
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

  if ( typeof object[kFinalize] === 'function' && refs.has(object[kFinalize])) {
    register.unregister(object)
    refs.delete(object[kFinalize])
    return true
  }

  return false
}

export default {
  finalize,
  ref,
  registry
}
