#!/usr/bin/env node
import path from 'node:path'
import fs from 'node:fs/promises'

import esbuild from 'esbuild'

const cp = async (a, b) => fs.cp(
  path.resolve(a),
  path.join(b, path.basename(a)),
  { recursive: true, force: true }
)

async function copy (target) {
  await Promise.all([
    cp('src/index.html', target),
    cp('src/index_second_window.html', target),
    cp('src/index_second_window2.html', target),
    cp('fixtures', target),
    // for testing purposes
    cp('ssc.config', target)
  ])
}

async function main () {
  const params = {
    entryPoints: ['src/index.js', 'src/index_second_window.js'],
    format: 'esm',
    bundle: true,
    keepNames: true,
    platform: 'browser',
    sourcemap: 'inline',
    outdir: path.resolve(process.argv[2])
  }

  await esbuild.build(params)
  await copy(params.outdir)
}

main()
