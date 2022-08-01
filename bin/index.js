#!/usr/bin/env node
import * as acorn from 'acorn'
import * as walk from 'acorn-walk'
import fs from 'node:fs'
import path from 'node:path'

try {
  fs.unlinkSync('README.md')
} catch {}

export function transform (filename) {
  const srcFile = path.relative(process.cwd(), filename)
  const destFile = path.relative(process.cwd(), 'README.md')

  let accumulateComments = []
  let comments = {}
  const src = fs.readFileSync(srcFile)
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
      if (comment.includes('global window')) return

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
      location: `/${srcFile}#L${node.loc.start.line}`,
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

    if (node.type.includes('ExportAllDeclaration')) {
      return
    }

    if (node.type.includes('ExportDefaultDeclaration')) {
      return
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
        item.name = item.name
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
        `in \`${srcFile}\`, it's exported but undocumented.\n`
      ]
    }

    const attrs = item.header?.join('\n').match(/@(.*)[\n$]*/g)

    if (attrs) {
      let position = 0

      for (const attr of attrs) {
        if (attr.includes('@param')) {
          item.signature = item.signature || []
          const parts = attr.replace('@param ', '').split(/ - /)
          const { 1: type, 2: rawName } = parts[0].match(/{([^}]+)}(.*)/)
          const optional = type.includes('?')
          const name = (rawName || `(Position ${position++})`).trim()

          const param = {
            name,
            type: (optional ? type.replace('?', '') : type).replace('|', '\\|')
          }

          const params = node.declaration?.params || node.value?.params
          if (params) {
            const assign = params.find(o => o.left?.name === name)
            if (assign) param.default = assign.right.raw
          }

          param.default = ''
          param.optional = optional
          param.desc = parts[1]?.trim()

          item.params?.push(param)
          item.signature.push(name)
        }
      }
    }

    if (item.signature) {
      item.name = `\`${item.name}(${item.signature.join(', ')})\``
    }

    if (item.header) {
      item.header = item.header.join('\n').split('\n').filter(line => {
        return !line.match(/@\w*/)
      })

      const index = docs.findIndex(d => d.sort === item.sort)
      // if (docs.length === 0 || index === -1)
      docs.push(item)
    }
  }

  walk.full(ast, onNode)
  docs.sort((a, b) => a.sort - b.sort)

  for (const doc of docs) {
    let h = doc.export ? '##' : '###'
    if (doc.type === 'Module') h = '#'

    const title = `\n${h} [${doc.name}](.${doc.location})\n`
    const header = `${doc.header.filter(Boolean).join('\n')}\n`
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

        argumentsTable += `\n| ${Object.values(param).join(' | ')} |`
      }

      argumentsTable += '\n'
    }

    fs.appendFileSync(destFile, [
      title,
      header,
      argumentsTable
    ].join('\n'), { flags: 'a' })
  }
}

const files = [
  'bluetooth.js',
  'dgram.js',
  'dns.js',
  'ipc.js',
  'os.js',
  'net.js',
  'fs/index.js'
].map(transform)

