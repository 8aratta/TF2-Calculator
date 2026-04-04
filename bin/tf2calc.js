#!/usr/bin/env node
/* global process */

import {
  evaluateTokens,
  formatRefFromScrap,
  toMetalBreakdown,
  expressionToDisplay,
} from '../src/lib/calculatorEngine.js'

const HELP_TEXT = `Usage:
  tf2calc "<expression>"
  tf2calc convert <value> [--to ref|scrap|mixed]
  tf2calc normalize <value>
  tf2calc sum <value1> <value2> ...
  tf2calc mul <value> <integer>
  tf2calc avg <value1> <value2> ...
  tf2calc explain "<expression>"
  tf2calc compare <a> <b>
  tf2calc profit buy=<value> sell=<value>
  tf2calc split <value> <integer>

Global flags:
  --quiet     Output only final ref value
  --help      Show help
`

const COMMANDS = new Set([
  'convert',
  'normalize',
  'sum',
  'mul',
  'avg',
  'explain',
  'compare',
  'profit',
  'split',
])

const ALIAS_TO_METAL = {
  scrap: 'Scrap',
  rec: 'Reclaimed',
  reclaimed: 'Reclaimed',
  ref: 'Refined',
  refined: 'Refined',
}

const NUMBER_RE = /^\d+(?:\.\d+)?$/

const fail = (message) => {
  console.error(`Error: ${message}`)
  process.exit(1)
}

const parseGlobalFlags = (args) => {
  let quiet = false
  const remaining = []

  for (const arg of args) {
    if (arg === '--quiet') {
      quiet = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      console.log(HELP_TEXT)
      process.exit(0)
    }

    remaining.push(arg)
  }

  return { quiet, remaining }
}

const normalizeWordToken = (word) => {
  const canonical = ALIAS_TO_METAL[word.toLowerCase()]
  if (!canonical) {
    throw new Error(`Unknown token "${word}".`)
  }
  return canonical
}

const tokenizeExpression = (input) => {
  const source = `${input ?? ''}`.trim()
  if (!source) {
    throw new Error('Expression is required.')
  }

  if (source.includes('/') || source.includes('÷')) {
    throw new Error('Division is unsupported.')
  }

  const lexicalTokens = source.match(/\d+(?:\.\d+)?|[A-Za-z]+|[()+\-*×]/g)
  if (!lexicalTokens) {
    throw new Error('Expression is required.')
  }

  const joined = lexicalTokens.join('')
  const compactOriginal = source.replace(/\s+/g, '')
  if (joined !== compactOriginal) {
    throw new Error('Expression contains unsupported characters.')
  }

  const normalized = lexicalTokens.map((token) => {
    if (token === '×') return '*'
    if (token === '+' || token === '-' || token === '*' || token === '(' || token === ')') {
      return token
    }
    if (NUMBER_RE.test(token)) {
      return token
    }
    return normalizeWordToken(token)
  })

  const withUnitExpansion = []
  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index]
    const next = normalized[index + 1]

    if (NUMBER_RE.test(current) && next && Object.values(ALIAS_TO_METAL).includes(next)) {
      if (next === 'Refined') {
        withUnitExpansion.push(current)
      } else {
        withUnitExpansion.push(current, '*', next)
      }
      index += 1
      continue
    }

    withUnitExpansion.push(current)
  }

  return withUnitExpansion
}

const evaluateExpression = (expression) => {
  const tokens = tokenizeExpression(expression)
  const scrap = evaluateTokens(tokens)
  return { tokens, scrap }
}

const formatMixed = (scrapValue) => {
  const parts = toMetalBreakdown(scrapValue)
  const sign = parts.negative ? '-' : ''
  return `${sign}${parts.refined} ref ${parts.reclaimed} rec ${parts.scrap} scrap`
}

const printResult = ({ quiet, scrap, lines = [] }) => {
  if (quiet) {
    console.log(formatRefFromScrap(scrap))
    return
  }

  for (const line of lines) {
    console.log(line)
  }
}

const parseToOption = (args) => {
  let to = 'ref'
  const rest = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--to') {
      const value = args[index + 1]
      if (!value) {
        throw new Error('Missing value for --to.')
      }
      to = value
      index += 1
      continue
    }

    if (arg.startsWith('--to=')) {
      to = arg.slice('--to='.length)
      continue
    }

    rest.push(arg)
  }

  if (!['ref', 'scrap', 'mixed'].includes(to)) {
    throw new Error('Invalid --to option. Use ref, scrap, or mixed.')
  }

  return { to, rest }
}

const parseStrictInteger = (value, label) => {
  if (!/^-?\d+$/.test(value ?? '')) {
    throw new Error(`${label} must be an integer.`)
  }

  return Number(value)
}

const splitAdditiveTerms = (tokens) => {
  const terms = []
  let currentTokens = []
  let currentSign = 1
  let depth = 0

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (token === '(') depth += 1
    if (token === ')') depth -= 1

    if (depth === 0 && (token === '+' || token === '-')) {
      if (!currentTokens.length) {
        currentSign = token === '-' ? -1 : 1
        continue
      }

      terms.push({ sign: currentSign, tokens: currentTokens })
      currentTokens = []
      currentSign = token === '-' ? -1 : 1
      continue
    }

    currentTokens.push(token)
  }

  if (currentTokens.length) {
    terms.push({ sign: currentSign, tokens: currentTokens })
  }

  return terms
}

const ensureArgs = (args, minCount, usage) => {
  if (args.length < minCount) {
    throw new Error(`Missing arguments. Usage: ${usage}`)
  }
}

const handlers = {
  default: ({ args, quiet }) => {
    ensureArgs(args, 1, 'tf2calc "<expression>"')
    const expression = args.join(' ')
    const { scrap } = evaluateExpression(expression)

    printResult({
      quiet,
      scrap,
      lines: [
        formatRefFromScrap(scrap),
      ],
    })
  },

  convert: ({ args, quiet }) => {
    const { to, rest } = parseToOption(args)
    ensureArgs(rest, 1, 'tf2calc convert <value> [--to ref|scrap|mixed]')

    const value = rest.join(' ')
    const { scrap } = evaluateExpression(value)

    if (quiet) {
      console.log(formatRefFromScrap(scrap))
      return
    }

    if (to === 'scrap') {
      console.log(`${Math.round(scrap)}`)
      return
    }

    if (to === 'mixed') {
      console.log(formatMixed(scrap))
      return
    }

    console.log(formatRefFromScrap(scrap))
  },

  normalize: ({ args, quiet }) => {
    ensureArgs(args, 1, 'tf2calc normalize <value>')
    const value = args.join(' ')
    const { scrap } = evaluateExpression(value)

    printResult({
      quiet,
      scrap,
      lines: [formatRefFromScrap(scrap)],
    })
  },

  sum: ({ args, quiet }) => {
    ensureArgs(args, 1, 'tf2calc sum <value1> <value2> ...')

    let total = 0
    for (const arg of args) {
      const { scrap } = evaluateExpression(arg)
      total += scrap
    }

    printResult({
      quiet,
      scrap: total,
      lines: [formatRefFromScrap(total)],
    })
  },

  mul: ({ args, quiet }) => {
    ensureArgs(args, 2, 'tf2calc mul <value> <integer>')

    const multiplier = parseStrictInteger(args.at(-1), 'Multiplier')
    const valueExpression = args.slice(0, -1).join(' ')
    const { scrap } = evaluateExpression(valueExpression)
    const result = scrap * multiplier

    printResult({
      quiet,
      scrap: result,
      lines: [formatRefFromScrap(result)],
    })
  },

  avg: ({ args, quiet }) => {
    ensureArgs(args, 1, 'tf2calc avg <value1> <value2> ...')

    let total = 0
    for (const arg of args) {
      const { scrap } = evaluateExpression(arg)
      total += scrap
    }

    const average = Math.round(total / args.length)

    printResult({
      quiet,
      scrap: average,
      lines: [formatRefFromScrap(average)],
    })
  },

  explain: ({ args, quiet }) => {
    ensureArgs(args, 1, 'tf2calc explain "<expression>"')
    const expression = args.join(' ')
    const { tokens, scrap } = evaluateExpression(expression)

    if (quiet) {
      console.log(formatRefFromScrap(scrap))
      return
    }

    const terms = splitAdditiveTerms(tokens)
    for (const term of terms) {
      const termScrap = evaluateTokens(term.tokens) * term.sign
      const prefix = term.sign < 0 ? '-' : '+'
      console.log(`${prefix} ${expressionToDisplay(term.tokens)} => ${termScrap} scrap`)
    }

    console.log(`Total scrap: ${scrap}`)
    console.log(`Result: ${formatRefFromScrap(scrap)}`)
  },

  compare: ({ args, quiet }) => {
    ensureArgs(args, 2, 'tf2calc compare <a> <b>')

    const left = evaluateExpression(args[0]).scrap
    const right = evaluateExpression(args[1]).scrap
    const diff = left - right

    if (quiet) {
      console.log(formatRefFromScrap(diff))
      return
    }

    console.log(`Difference: ${diff} scrap`)
    console.log(`Formatted: ${formatRefFromScrap(diff)}`)
  },

  profit: ({ args, quiet }) => {
    ensureArgs(args, 2, 'tf2calc profit buy=<value> sell=<value>')

    let buy = null
    let sell = null

    for (const arg of args) {
      const separatorIndex = arg.indexOf('=')
      if (separatorIndex <= 0) {
        throw new Error('Profit arguments must be buy=<value> and sell=<value>.')
      }

      const key = arg.slice(0, separatorIndex).toLowerCase()
      const value = arg.slice(separatorIndex + 1)

      if (!value) {
        throw new Error(`Missing value for ${key}.`)
      }

      if (key === 'buy') buy = value
      if (key === 'sell') sell = value
    }

    if (buy === null || sell === null) {
      throw new Error('Profit requires both buy=<value> and sell=<value>.')
    }

    const buyScrap = evaluateExpression(buy).scrap
    const sellScrap = evaluateExpression(sell).scrap
    const diff = sellScrap - buyScrap

    if (quiet) {
      console.log(formatRefFromScrap(diff))
      return
    }

    console.log(`Profit: ${diff} scrap`)
    console.log(`Formatted: ${formatRefFromScrap(diff)}`)
  },

  split: ({ args, quiet }) => {
    ensureArgs(args, 2, 'tf2calc split <value> <integer>')

    const shares = parseStrictInteger(args.at(-1), 'Share count')
    if (shares === 0) {
      throw new Error('Share count must not be zero.')
    }

    const valueExpression = args.slice(0, -1).join(' ')
    const total = evaluateExpression(valueExpression).scrap
    const each = Math.trunc(total / shares)
    const remainder = total - each * shares

    if (quiet) {
      console.log(formatRefFromScrap(each))
      return
    }

    console.log(`Each share: ${each} scrap (${formatRefFromScrap(each)})`)
    console.log(`Remainder: ${remainder} scrap`)
  },
}

const main = () => {
  try {
    const { quiet, remaining } = parseGlobalFlags(process.argv.slice(2))

    if (remaining.length === 0) {
      console.log(HELP_TEXT)
      process.exit(0)
    }

    const [first, ...rest] = remaining

    if (COMMANDS.has(first)) {
      handlers[first]({ args: rest, quiet })
      return
    }

    handlers.default({ args: remaining, quiet })
  } catch (error) {
    fail(error instanceof Error ? error.message : 'Unknown failure.')
  }
}

main()
