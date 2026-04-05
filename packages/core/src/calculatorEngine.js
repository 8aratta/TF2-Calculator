import { METAL_DISPLAY_VALUE, METAL_SCRAP } from './calculatorConfig.js'

const PRECEDENCE = { '+': 1, '-': 1, '*': 2 }

export const isOperator = (token) => ['+', '-', '*'].includes(token)
export const isOpenParen = (token) => token === '('
export const isCloseParen = (token) => token === ')'
export const isNumberToken = (token) =>
  token !== undefined && /^\d+(\.\d{2})?$/.test(token)
export const isInProgressNumberToken = (token) =>
  token !== undefined && /^\d+(\.\d{0,2})?$/.test(token)
export const isMetalToken = (token) => token !== undefined && Object.hasOwn(METAL_SCRAP, token)
export const isValueToken = (token) =>
  isNumberToken(token) || isMetalToken(token) || isCloseParen(token)

export const tokenToDisplayChar = (token) => {
  if (token === '*') return '×'
  if (token === '-') return '−'
  if (isMetalToken(token)) return METAL_DISPLAY_VALUE[token]
  return token
}

export const expressionToDisplay = (tokens) =>
  tokens.map(tokenToDisplayChar).join(' ')

export const getExpressionDisplayParts = (
  tokens,
  materialValueView = 'ref-value',
) =>
  tokens.flatMap((token, index) => {
    if (isMetalToken(token) && materialValueView === 'visual') {
      return {
        id: `${token}-${index}`,
        type: 'metal',
        value: token,
      }
    }

    return {
      id: `${token}-${index}`,
      type: 'text',
      value: tokenToDisplayChar(token),
    }
  })

export const formatRefFromScrap = (scrapCount) => {
  const sign = scrapCount < 0 ? '-' : ''
  const absScrap = Math.abs(scrapCount)
  const refined = Math.floor(absScrap / 9)
  const remainder = absScrap % 9
  const refValue = refined + remainder * 0.11
  return `${sign}${refValue.toFixed(2)} ref`
}

export const toMetalBreakdown = (scrapCount) => {
  const absScrap = Math.abs(Math.round(scrapCount))
  const refined = Math.floor(absScrap / 9)
  const remAfterRef = absScrap % 9
  const reclaimed = Math.floor(remAfterRef / 3)
  const scrap = remAfterRef % 3

  return { refined, reclaimed, scrap, negative: scrapCount < 0 }
}

const toRpn = (tokens) => {
  const output = []
  const operators = []

  for (const token of tokens) {
    if (isNumberToken(token) || isMetalToken(token)) {
      output.push(token)
      continue
    }

    if (isOpenParen(token)) {
      operators.push(token)
      continue
    }

    if (isCloseParen(token)) {
      while (operators.length && !isOpenParen(operators.at(-1))) {
        output.push(operators.pop())
      }

      if (!operators.length) {
        throw new Error('Mismatched parentheses.')
      }

      operators.pop()
      continue
    }

    if (isOperator(token)) {
      while (
        operators.length &&
        isOperator(operators.at(-1)) &&
        PRECEDENCE[operators.at(-1)] >= PRECEDENCE[token]
      ) {
        output.push(operators.pop())
      }

      operators.push(token)
    }
  }

  while (operators.length) {
    const top = operators.pop()
    if (isOpenParen(top)) {
      throw new Error('Mismatched parentheses.')
    }
    output.push(top)
  }

  return output
}

const refTokenToScrap = (token) => {
  const [wholePart, decimalPart = '00'] = token.split('.')
  const whole = Number(wholePart)

  if (!Number.isInteger(whole) || whole < 0) {
    throw new Error('Invalid number format.')
  }

  if (!/^\d{2}$/.test(decimalPart)) {
    throw new Error('Ref decimal must contain two digits.')
  }

  const first = decimalPart[0]
  const second = decimalPart[1]
  if (first !== second) {
    throw new Error('Ref decimals must use TF2 increments like .11, .22, etc.')
  }

  const increment = Number(first)
  if (increment < 0 || increment > 8) {
    throw new Error('Valid ref decimals range from .00 to .88.')
  }

  return whole * 9 + increment
}

const refNumberToScrap = (value) => {
  const sign = value < 0 ? -1 : 1
  const abs = Math.abs(value)
  const refined = Math.trunc(abs)
  const remainderRef = abs - refined
  const scrapsFloat = remainderRef / 0.11
  const scraps = Math.round(scrapsFloat)

  if (Math.abs(scrapsFloat - scraps) > 1e-6 || scraps < 0 || scraps > 8) {
    throw new Error('Value must resolve to TF2 ref increments (.00, .11 ... .88).')
  }

  return sign * (refined * 9 + scraps)
}

const toAmountScrap = (entry) => {
  if (entry.kind === 'amount') {
    return entry.value
  }

  if (entry.raw !== undefined) {
    return refTokenToScrap(entry.raw)
  }

  return refNumberToScrap(entry.value)
}

const evaluateRpnToScrap = (rpn) => {
  const stack = []

  for (const token of rpn) {
    if (isNumberToken(token)) {
      stack.push({ kind: 'number', value: Number(token), raw: token })
      continue
    }

    if (isMetalToken(token)) {
      stack.push({ kind: 'amount', value: METAL_SCRAP[token] })
      continue
    }

    const right = stack.pop()
    const left = stack.pop()
    if (left === undefined || right === undefined) {
      throw new Error('Invalid expression.')
    }

    if (token === '+') {
      stack.push({ kind: 'amount', value: toAmountScrap(left) + toAmountScrap(right) })
      continue
    }

    if (token === '-') {
      stack.push({ kind: 'amount', value: toAmountScrap(left) - toAmountScrap(right) })
      continue
    }

    if (token === '*') {
      if (left.kind === 'amount' && right.kind === 'amount') {
        throw new Error('Use a numeric multiplier, not amount × amount.')
      }

      if (left.kind === 'amount' || right.kind === 'amount') {
        const amount = left.kind === 'amount' ? left.value : right.value
        const scalar = left.kind === 'number' ? left.value : right.value
        stack.push({ kind: 'amount', value: amount * scalar })
        continue
      }

      stack.push({ kind: 'number', value: left.value * right.value })
    }
  }

  if (stack.length !== 1) {
    throw new Error('Could not resolve expression.')
  }

  const final = stack[0]
  return final.kind === 'amount' ? final.value : toAmountScrap(final)
}

export const evaluateTokens = (tokens) => {
  if (!tokens.length) {
    return 0
  }

  let depth = 0
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const previous = index > 0 ? tokens[index - 1] : null

    if (isOpenParen(token)) {
      depth += 1
      if (previous && isValueToken(previous)) {
        throw new Error('Missing operator before "(".')
      }
    }

    if (isCloseParen(token)) {
      depth -= 1
      if (depth < 0) {
        throw new Error('Mismatched parentheses.')
      }
      if (!previous || isOperator(previous) || isOpenParen(previous)) {
        throw new Error('Empty parentheses.')
      }
    }

    if (isOperator(token)) {
      if (index === 0 || index === tokens.length - 1) {
        throw new Error('Expression cannot start or end with an operator.')
      }
      if (isOperator(previous) || isOpenParen(previous)) {
        throw new Error('Invalid operator placement.')
      }
    }
  }

  if (depth !== 0) {
    throw new Error('Mismatched parentheses.')
  }

  return Math.round(evaluateRpnToScrap(toRpn(tokens)))
}
