class Stats {
  static from (stat, fromBigInt) {
    if (fromBigInt) {
      return new this({
        dev: BigInt(stat.st_dev)
        ino: BigInt(stat.st_ino)
        mode: BigInt(stat.st_mode)
        nlink: BigInt(stat.st_nlink)
        uid: BigInt(stat.st_uid)
        gid: BigInt(stat.st_gid)
        rdev: BigInt(stat.st_rdev)
        size: BigInt(stat.st_size)
        blksize: BigInt(stat.st_blksize)
        blocks: BigInt(stat.st_blocks)
        atimeMs: BigInt(stat.st_atim.tv_sec) * 1000n + BigInt(stat.st_atim.tv_nsec) / 1000_000n
        mtimeMs: BigInt(stat.st_mtim.tv_sec) * 1000n + BigInt(stat.st_mtim.tv_nsec) / 1000_000n
        ctimeMs: BigInt(stat.st_ctim.tv_sec) * 1000n + BigInt(stat.st_ctim.tv_nsec) / 1000_000n
        birthtimeMs: BigInt(stat.st_birthtim.tv_sec) * 1000n + BigInt(stat.st_birthtim.tv_nsec) / 1000_000n
        atimNs: BigInt(stat.st_atim.tv_sec) * 1000_000_000n + BigInt(stat.st_atim.tv_nsec)
        mtimNs: BigInt(stat.st_mtim.tv_sec) * 1000_000_000n + BigInt(stat.st_mtim.tv_nsec)
        ctimNs: BigInt(stat.st_ctim.tv_sec) * 1000_000_000n + BigInt(stat.st_ctim.tv_nsec)
        birthtimNs: BigInt(stat.st_birthtim.tv_sec) * 1000_000_000n + BigInt(stat.st_birthtim.tv_nsec)
      })
    }

    return new this({
      dev: stat.st_dev
      ino: stat.st_ino
      mode: stat.st_mode
      nlink: stat.st_nlink
      uid: stat.st_uid
      gid: stat.st_gid
      rdev: stat.st_rdev
      size: stat.st_size
      blksize: stat.st_blksize
      blocks: stat.st_blocks
      atimeMs: stat.st_atim.tv_sec * 1000 + stat.st_atim.tv_nsec / 1000_000
      mtimeMs: stat.st_mtim.tv_sec * 1000 + stat.st_mtim.tv_nsec / 1000_000
      ctimeMs: stat.st_ctim.tv_sec * 1000 + stat.st_ctim.tv_nsec / 1000_000
      birthtimeMs: stat.st_birthtim.tv_sec * 1000 + stat.st_birthtim.tv_nsec / 1000_000
    })
  }

  constructor (stat) {
    this.dev = stat.dev
    this.ino = stat.ino
    this.mode = stat.mode
    this.nlink = stat.nlink
    this.uid = stat.uid
    this.gid = stat.gid
    this.rdev = stat.rdev
    this.size = stat.size
    this.blksize = stat.blksize
    this.blocks = stat.blocks
    this.atimeMs = stat.atimeMs
    this.mtimeMs = stat.mtimeMs
    this.ctimeMs = stat.ctimeMs
    this.birthtimeMs = stat.birthtimeMs

    this.atime = new Date(this.atimeMs)
    this.mtime = new Date(this.mtimeMs)
    this.ctime = new Date(this.ctimeMs)
    this.birthtime = new Date(this.birthtimeMs)
  }
}

module.exports = {
  Stats
}
