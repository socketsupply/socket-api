import * as ipc from '../ipc.js'

function getNativeConstants () {
  return ipc.sendSync('getFSConstants')?.data || {}
}

export const constants = Object.assign(Object.create(null), {
  /*
   * This flag can be used with uv_fs_copyfile() to return an error if the
   * destination already exists.
   */
  COPYFILE_EXCL: 0x0001,
  /*
   * This flag can be used with uv_fs_copyfile() to attempt to create a reflink.
   * If copy-on-write is not supported, a fallback copy mechanism is used.
   */
  COPYFILE_FICLONE: 0x0002,
  /*
   * This flag can be used with uv_fs_copyfile() to attempt to create a reflink.
   * If copy-on-write is not supported, an error is returned.
   */
  COPYFILE_FICLONE_FORCE: 0x0004,

  ...getNativeConstants()
})
