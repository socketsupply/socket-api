'use strict'

import constants from './constants'

function normalizeFlags (flags) {
  if (typeof flags === 'number') {
    return flags
  }

  if (flags !== undefined && typeof flags !== 'string') {
    throw new TypeError(
      `Expecting flags to be a string or number: Got ${typeof flags}`
    )
  }

  switch (flags) {
    case 'r':
      return constants.O_RDONLY

    case 'rs': case 'sr':
      return constants.O_RDONLY | constants.O_SYNC

    case 'r+':
      return constants.O_RDWR

    case 'rs+': case 'sr+':
      return constants.O_RDWR | constants.O_SYNC

    case 'w':
      return constants.O_TRUNC | constants.O_CREAT | constants.O_WRONLY

    case 'wx': case 'xw':
      return constants.O_TRUNC | constants.O_CREAT | constants.O_WRONLY | constants.O_EXCL

    case 'w+':
      return constants.O_TRUNC | constants.O_CREAT | constants.O_RDWR

    case 'wx+': case 'xw+':
      return constants.O_TRUNC | constants.O_CREAT | constants.O_RDWR | constants.O_EXCL

    case 'a':
      return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY

    case 'ax': case 'xa':
      return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_EXCL

    case 'as': case 'sa':
      return constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_SYNC

    case 'a+':
      return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR

    case 'ax+': case 'xa+':
      return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR | constants.O_EXCL

    case 'as+': case 'sa+':
      return constants.O_APPEND | constants.O_CREAT | constants.O_RDWR | constants.O_SYNC
  }

  return constants.O_RDONLY
}

export {
  normalizeFlags
}
