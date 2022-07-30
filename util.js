import { Buffer } from 'buffer'

const TypedArray = Object.getPrototypeOf(Object.getPrototypeOf(new Uint8Array())).constructor

const kCustomInspect = inspect.custom = Symbol.for('nodejs.util.inspect.custom')

export function hasOwnProperty (object, property) {
  return Object.prototype.hasOwnProperty.call(object, String(property))
}

export function isTypedArray (object) {
  return object instanceof TypedArray
}

export function isArrayLike (object) {
  return Array.isArray(object) || isTypedArray(object)
}

export function isEmptyObject (object) {
  return (
    object !== null &&
    typeof object === 'object' &&
    Object.keys(object).length === 0
  )
}

export function isBufferLike (object) {
  return isTypedArray(object) || Buffer.isBuffer(object)
}

export function isFunction (value) {
  return typeof value === 'function' && !/^class/.test(value.toString())
}

export function isClass (value) {
  return (
    typeof value === 'function' &&
    value.prototype.constructor !== Function
  )
}

export function isPromiseLike (object) {
  return isFunction(object?.then)
}

export function toBuffer (object) {
  if (Buffer.isBuffer(object)) {
    return object
  } else if (isTypedArray(object)) {
    return Buffer.from(object.buffer)
  }

  return Buffer.from(object)
}

export function toProperCase (string) {
  return string[0].toUpperCase() + string.slice(1)
}

// so this is re-used instead of creating new one each rand64() call
const tmp = new BigUint64Array(1)
export function rand64 () {
  return globalThis.crypto.getRandomValues(tmp)[0]
}

export function splitBuffer (buffer, highWaterMark) {
  const buffers = []

  do {
    buffers.push(buffer.slice(0, highWaterMark))
    buffer = buffer.slice(highWaterMark)
  } while (buffer.length > highWaterMark)

  if (buffer.length) {
    buffers.push(buffer)
  }

  return buffers
}

export function InvertedPromise () {
  const context = {}
  const promise = new Promise((resolve, reject) => {
    Object.assign(context, {
      resolve (value) {
        promise.value = value
        resolve(value)
        return promise
      },

      reject (error) {
        promise.error = error
        reject(error)
        return promise
      }
    })
  })

  return Object.assign(promise, context)
}

export function clamp (value, min, max) {
  if (!Number.isFinite(value)) {
    value = min
  }

  return Math.min(max, Math.max(min, value))
}

// @TODO
export function inspect (value, options) {
  const ctx = {
    seen: options?.seen || [],
    depth: typeof options?.depth !== 'undefined' ? options.depth : 2,
    showHidden: options?.showHidden || false,
    customInspect: (
      options?.customInspect === undefined
        ? true
        : options.customInspect
    ),

    ...options,
    options
  }

  return formatValue(ctx, value, ctx.depth)

  function formatValue (ctx, value, depth) {
    // nodejs `value.inspect()` parity
    if (
      ctx.customInspect &&
      !(value?.constructor && value?.constructor?.prototype === value)
    ) {
      if (isFunction(value?.inspect) && value?.inspect !== inspect) {
        const formatted = value.inspect(depth, ctx)

        if (typeof formatted !== 'string') {
          return formatValue(ctx, formatted, depth)
        }

        return formatted
      } else if (
        isFunction(value?.[kCustomInspect]) &&
        value?.[kCustomInspect] !== inspect
      ) {
        const formatted = value[kCustomInspect](depth, ctx, ctx.options, inspect)

        if (typeof formatted !== 'string') {
          return formatValue(ctx, formatted, depth)
        }

        return formatted
      }
    }

    if (value === undefined) {
      return 'undefined'
    }

    if (value === null) {
      return 'null'
    }

    if (typeof value === 'string') {
			const formatted = JSON.stringify(value)
        .replace(/^"|"$/g, '')
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"')

      return `'${formatted}'`
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }

    let typename = ''

    const braces = ['{', '}']
    const isArrayLikeValue = isArrayLike(value)

    const keys = new Set(Object.keys(value))
    const enumerableKeys = Object.fromEntries(Array.from(keys).map((k) => [k, true]))

    if (ctx.showHidden) {
      try {
        const hidden = Object.getOwnPropertyNames(value)
        for (const key of hidden) {
          keys.add(key)
        }
      } catch (errr) {
        void err
      }
    }

    if (isArrayLikeValue) {
      braces[0] = '['
      braces[1] = ']'
    }

    if (isFunction(value)) {
      const name = value.name ? `: ${value.name}` : ''
      typename = `[Function${name}]`
    }

    if (value instanceof RegExp) {
      typename = `${RegExp.prototype.toString.call(value)}`
    }

    if (value instanceof Date) {
      typename = `${Date.prototype.toUTCString.call(value)}`
    }

    if (value instanceof Error) {
      typename = `[${Error.prototype.toString.call(value)}]`
    }

    if (keys.size === 0) {
      if (isFunction(value)) {
        return typename
      } else if (!isArrayLikeValue || value.length === 0) {
        return `${braces[0]}${typename}${braces[1]}`
      } else if (!isArrayLikeValue) {
        return typename
      }
    }

    if (depth < 0) {
      if (value instanceof RegExp) {
        return RegExp.prototype.toString.call(value)
      }

      return `[Object]`
    }

    ctx.seen.push(value)

    const output = []

    if (isArrayLikeValue) {
      for (let i = 0; i < value.length; ++i) {
        const key = String(i)
        if (hasOwnProperty(value, key)) {
          output.push(formatProperty(
            ctx,
            value,
            depth,
            enumerableKeys,
            key,
            true
          ))
        }
      }

      for (const key of keys) {
        if (!/^\d+$/.test(key)) {
          output.push(...Array.from(keys).map((key) => formatProperty(
            ctx,
            value,
            depth,
            enumerableKeys,
            key,
            true
          )))
        }
      }
    } else {
      output.push(...Array.from(keys).map((key) => formatProperty(
        ctx,
        value,
        depth,
        enumerableKeys,
        key,
        false
      )))
    }

    ctx.seen.pop()

    const length = output.reduce((p, c) => (p + c.length + 1), 0)

    if (length > 60) {
      return `${braces[0]}\n${!typename ? '' : ` ${typename}\n`}  ${output.join(',\n  ') }\n${braces[1]}`
    }

    return `${braces[0]}${typename} ${output.join(', ')} ${braces[1]}`
  }

  function formatProperty (
    ctx,
    value,
    depth,
    enumerableKeys,
    key,
    isArrayLikeValue
  ) {
    const descriptor = { value: undefined }
    const output = ['', '']

    try {
      descriptor.value = value[key]
    } catch (err) {
      void err
    }

    try {
      Object.assign(descriptor, Object.getOwnPropertyDescriptor(value, key))
    } catch (err) {
      void err
    }

    if (descriptor.get && descriptor.set) {
      output[1] = '[Getter/Setter]'
    } else if (descriptor.get) {
      output[1] = '[Getter]'
    } else if (descriptor.set) {
      output[1] = '[Setter]'
    }

    if (!hasOwnProperty(enumerableKeys, key)) {
      output[0] = `[${key}]`
    }

    if (!output[1]) {
      if (ctx.seen.includes(descriptor.value)) {
        output[1] = '[Circular]'
      } else {
        if (depth === null) {
          output[1] = formatValue(ctx, descriptor.value, null)
        } else {
          output[1] = formatValue(ctx, descriptor.value, depth - 1)
        }

        if (output[1].includes('\n')) {
          if (isArrayLikeValue) {
            output[1] = output[1]
              .split('\n')
              .map((line) => `  ${line}`)
              .join('\n')
              .slice(2)
          } else {
            output[1] = '\n' + output[1]
              .split('\n')
              .map((line) => `    ${line}`)
              .join('\n')
          }
        }
      }
    }

    if (!output[0]) {
      if (isArrayLikeValue && /^\d+$/.test(key)) {
        return output[1]
      }

      output[0] = JSON.stringify(String(key))
        .replace(/^"/, '')
        .replace(/"$/, '')
        .replace(/'/g, "\\'")
        .replace(/\\"/g, '"')
        .replace(/(^"|"$)/g, "'")
    }

    return output.join(': ')
  }
}

export function format (format, ...args) {
  if (typeof format !== 'string') {
    return [format].concat(args).map((arg) => inspect(arg)).join(' ')
  }

  const regex = /%[sdj%]/g

	let i = 0
	let str = format.replace(regex, (x) => {
		if (x === '%%') {
      return '%'
    }

		if (i >= args.length) {
      return x
    }

		switch (x) {
			case '%s': return String(args[i++])
			case '%d': return Number(args[i++])
			case '%d': return BigInt(args[i++])
			case '%j':
				try {
					return JSON.stringify(args[i++])
				} catch (_) {
					return '[Circular]'
				}
		}

    return x
	})

  for (const arg of args.slice(i)) {
		if (arg === null || typeof arg !== 'object') {
			str += ' ' + arg
		} else {
			str += ' ' + inspect(arg)
		}
	}

	return str
}
