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
    onComment: (block, comment) => {
      if (!block) return
      comment = comment.replace(/^\s*\*/g, '')
      comment = comment.replace(/\n?\s*\*\s*/g, '\n')
      comment = comment.replace(/^\n/, '')
      accumulateComments.push(comment.trim())
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

    if (item.header?.join('').includes('@module')) {
      item.type = 'Module'
      const name = item.header.join('').match(/@module\s*(.*)/)
      if (name) item.name = name[1]
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
        item.name = `${item.name} (extends ${node.declaration.superClass.name})`
      }

      if (item.type === 'FunctionDeclaration') {
        item.params = [] // node.declaration.params
      }
    }

    if (node.type.includes('MethodDefinition')) {
      item.name = node.key?.name

      if (node.value.type === 'FunctionExpression') {
        item.generator = node.value.generator
        item.static = node.static
        item.async = node.value.async
        item.params = [] // node.value.params
      }
    }

    if (item.export && !item.header) {
      item.header = [
        `This is a \`${item.type}\` named \`${item.name}\`` +
        `in \`${filename}\`, it's exported but undocumented.\n`
      ]
    }

    const attrs = item.header?.join('\n').match(/@(.*)[\n$]*/g)

    if (attrs) {
      let position = 0

      for (const attr of attrs) {
        if (attr.includes('@param')) {
          const parts = attr.replace('@param ', '').split(/ - /)
          const { 1: type, 2: rawName } = parts[0].match(/{([^}]+)}(.*)/)
          const optional = type.includes('?')
          const name = (rawName || `(Position ${position++})`).trim()

          const param = {
            name,
            type: optional ? type.replace('?', '') : type
          }

          const params = node.declaration?.params || node.value?.params
          if (params) {
            const assign = params.find(o => o.left?.name === name)
            if (assign) param.default = assign.right.raw
          }

          param.default = ''
          param.optional = optional
          param.desc = parts[1]?.trim()

          item.params.push(param)
        }
      }
    }

    if (item.header) {
      item.header = item.header.join('\n').split('\n').filter(line => {
        return !line.match(/@\w*/)
      })

      const index = docs.findIndex(d => d.sort === item.sort)
      if (docs.length === 0 || index === -1) docs.push(item)
    }
  }

  walk.full(ast, onNode)
  docs.sort((a, b) => a.sort - b.sort)

  for (const doc of docs) {
    let h = doc.export ? '##' : '###'
    if (doc.type === 'Module') h = '#'

    const title = `\n${h} ${doc.name}\n`
    const header = `${doc.header.join('\n')}\n`
    let argumentsTable = ''

    if (doc.params && doc.params.length > 0) {
      const tableHeader = [
        '| Argument | Type | Default | Optional | Description |',
        '| :---     | :--- | :---:   | :---:    | :---        |'
      ].join('\n')

      argumentsTable = `${tableHeader}`

      for (const param of doc.params) {
        let type = param.type || 'Unknown'
        const desc = param.header?.join(' ')

        const index = docs.findIndex(d => doc.sort === d.sort)
        if (index > -1) docs.splice(index, 1) // its been used as an arg

        argumentsTable += `\n| ${Object.values(param).join(' | ')} |`
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
  // 'bluetooth.js': 'bluetooth.md',
  'dgram.js': 'dgram.md',
  // 'dns.js': 'dns.md',
  // 'ipc.js': 'ipc.md',
  // 'os.js': 'os.md',
  // 'net.js': 'net.md',
  // 'fs/index.js': 'fs.md'
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
