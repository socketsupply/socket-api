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
      sort: node.loc.start.line,
      location: `/${filename}#L${node.loc.start.line}`,
      type: node.type,
      name: node.name,
      export: node?.type.includes('Export'),
      header: comments[node.start]
    }

    if (node.type.includes('ExportNamedDeclaration')) {
      if (!node.declaration) return

      item.type = node.declaration.type || item.type

      if (item.type === 'VariableDeclaration') {
        item.name = node.declaration.declarations[0].id.name
      } else {
        item.name = node.declaration.id.name
      }

      if (node.declaration.superClass) {
        item.inherits = node.declaration.superClass.name
      }

      if (item.type === 'FunctionDeclaration') {
        item.params = node.declaration.params
      }
    }

    if (node.type.includes('MethodDefinition')) {
      item.name = node.key?.name

      if (node.value.type === 'FunctionExpression') {
        item.generator = node.value.generator
        item.static = node.static
        item.async = node.value.async
        item.params = node.value.params
      }
    }

    if (item.export && !item.header) {
      item.header = [
        `This is a \`${item.type}\` named \`${item.name}\`` +
        `in \`${filename}\`, it's exported but undocumented.\n`
      ]
    }

    if (item.params) {
      item.params = item.params.map(param => {
        const p = {}
        if (param.type.includes('AssignmentPattern')) {
          p.name = param.left.name
          p.type = typeof param.right.value
        } else {
          p.name = param.name
          p.type = param.type

          walk.full(ast, node => {
            if (node.type.includes('Assignment')) {
              if (node.left.name === p.name) {
                p.type = typeof node.right.value || 'Unknown'
              }
            }
          })
        }

        p.header = comments[param.start] || ['This item is undocumented. Using it is unadvised.']
        return p
      })
    }

    if (item.header) {
      const index = docs.findIndex(d => d.sort === item.sort)
      if (docs.length === 0 || index === -1) docs.push(item)
    }
  }

  walk.full(ast, onNode)
  docs.sort((a, b) => a.sort - b.sort)

  for (const doc of docs) {
    let h = doc.export ? '#' : '##'

    const title = `\n${h} ${doc.name}\n`
    const header = `${doc.header.join('\n')}\n`
    let argumentsTable = ''

    if (doc.params && doc.params.length > 0) {
      const tableHeader = [
        '| Argument | Type | Default | Required | Description |',
        '| :---     | :--- | :---:   | :---:    | :---        |'
      ].join('\n')

      argumentsTable = `${tableHeader}`

      for (const param of doc.params) {
        let type = param.type || 'Unknown'
        const desc = param.header?.join(' ')
        const required = desc?.toLowerCase().includes('required')

        const index = docs.findIndex(d => doc.sort === d.sort)
        if (index > -1) docs.splice(index, 1) // its been used as an arg

        argumentsTable += `\n| ${param.name} | ${type} | ${param.value} | ${required} | ${desc} |`
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
