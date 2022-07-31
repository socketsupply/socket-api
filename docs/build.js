#!/usr/bin/env node
import * as acorn from 'acorn'
import * as walk from 'acorn-walk'
import fs from 'node:fs'
import path from 'node:path'

function read (filename, stream) {
  let accumulateComments = []
  let comments = {}
  const src = fs.readFileSync(filename)
  const ast = acorn.parse(String(src), {
    tokens: true,
    comment: true,
    ecmaVersion: 13,
    sourceType: 'module',
    onToken: (token) => {
      comments[token.start] = accumulateComments;
      accumulateComments = []
    },
    onComment: (_, comment) => {
      if (comment[0] !== '/') return
      accumulateComments.push(comment.replace(/^\/\s*/, '').trim())
    },
    locations: true
  })

  for (const [key, value] of Object.entries(comments)) {
    if (!value.length) delete comments[key] // release empty items
  }

  const docs = []

  const onNode = node => {
    let item = {
      file: filename,
      location: node.loc,
      type: node.type
    }

    if (node.key?.name) {
      item.name = node.key.name
    }

    if (node.type === 'ExportAllDeclaration') {
      return
    }

    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration?.declarations) {
        node.declaration.declarations.forEach(onNode)
      } else if (node.declaration) {
        onNode(node.declaration)
      } else {
        return
      }
    }

    if (node.declaration) {
      item.type = node.declaration.type

      if (node.declaration.id?.name) {
        item.name = node.declaration.id.name
      } else if (node.declaration?.declarations) {
        if (node.declaration.declarations.length === 1) {
          item.name = node.declaration.declarations[0].id.name
        }
      }

      if (node.declaration.superClass) {
        item.inherits = node.declaration.superClass.name
      }
    }

    if (node.value?.params) {
      item.params = node.value?.params.map(param => {
        if (comments[param.start]) {
          param.header = comments[param.start]
          delete comments[param.start]
        }
        return param
      })
    }

    let doclines = comments[node.start]

    if (node?.type.includes('Export') && !doclines) {
      doclines = [
        '# Undocumented!',
        `A ${item.type} named \`${item.name}\` in \`${filename}\` is exported but undocumented!\n`
      ]
    }

    item.header = doclines
    item.export = node?.type.includes('Export')

    if (item.header) {
      const index = docs.findIndex(doc => {
        const matchesLine = doc.location.start.line === item.location.start.line
        const matchesColumn = doc.location.start.column === item.location.start.column
        if (matchesLine && matchesColumn) return doc
      })

      if (index === -1) docs.unshift(item)
    }
  }

  walk.full(ast, onNode)

  for (const doc of docs) {
    let h = '#'

    console.log(doc.type)
    if (!doc.export) {
      h = '##'
    }

    const title = `\n${h} ${doc.name}\n`
    const header = doc.header.join('\n')
    let argumentsTable = ''

    if (doc.params && doc.params.length > 0) {
      const tableHeader = [
        '| Argument | Type | Default | Required | Description |',
        '| :---     | :--- | :---:   | :---:    | :---        |'
      ].join('\n')

      argumentsTable = `${tableHeader}`

      for (const param of doc.params) {
        let type = param.type
        const isAssignment = param.type === 'AssignmentPattern'
        const name = isAssignment ? param.left.name : param.name
        const value = isAssignment ? param?.right.raw : ''
        const desc = param.header.join(' ')
        const required = desc.toLowerCase().includes('required')

        const index = docs.findIndex(d => {
          return (
            doc.location.start.line === d.location.start.line &&
            doc.location.start.column === d.location.start.column
          )
        })

        if (index > -1) docs.splice(index, 1) // its been used as an arg

        walk.full(ast, node => {
          if (node.type.includes('Assignment')) {
            if (node.left.name === name) {
              type = typeof node.right.value
            }
          }
        })

        argumentsTable += `\n| ${name} | ${type} | ${value} | ${required} | ${desc} |`
      }

      argumentsTable += '\n'
    }

    stream.write([
      title,
      header,
      argumentsTable
    ].join('\n'))
  }
}

const files = {
  'bluetooth.js': 'bluetooth.md',
  'dgram.js': 'dgram.md',
  'dns.js': 'dns.md',
  'ipc.js': 'ipc.md',
  'os.js': 'os.md',
  'net.js': 'net.md',
  'fs/index.js': 'fs.md'
}

for (const file of Object.keys(files)) {
  const src = path.relative(process.cwd(), file)
  const filename = files[file].replace('.js', '.md')
  const dest = path.relative(
    process.cwd(),
    path.join('docs', 'output', filename)
  )
  read(src, fs.createWriteStream(dest))
}