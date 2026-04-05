import { describe, it, expect } from 'vitest'
import {
  isOperator,
  isOpenParen,
  isCloseParen,
  isNumberToken,
  isInProgressNumberToken,
  isMetalToken,
  isValueToken,
  tokenToDisplayChar,
  expressionToDisplay,
  getExpressionDisplayParts,
  formatRefFromScrap,
  toMetalBreakdown,
  evaluateTokens,
} from './calculatorEngine.js'

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

describe('isOperator', () => {
  it('returns true for +, -, *', () => {
    expect(isOperator('+')).toBe(true)
    expect(isOperator('-')).toBe(true)
    expect(isOperator('*')).toBe(true)
  })

  it('returns false for non-operators', () => {
    expect(isOperator('(')).toBe(false)
    expect(isOperator('Refined')).toBe(false)
    expect(isOperator('1.00')).toBe(false)
    expect(isOperator(undefined)).toBe(false)
  })
})

describe('isOpenParen', () => {
  it('returns true only for "("', () => {
    expect(isOpenParen('(')).toBe(true)
    expect(isOpenParen(')')).toBe(false)
    expect(isOpenParen('1.00')).toBe(false)
  })
})

describe('isCloseParen', () => {
  it('returns true only for ")"', () => {
    expect(isCloseParen(')')).toBe(true)
    expect(isCloseParen('(')).toBe(false)
    expect(isCloseParen('+')).toBe(false)
  })
})

describe('isNumberToken', () => {
  it('accepts valid ref-format numbers', () => {
    expect(isNumberToken('0')).toBe(true)
    expect(isNumberToken('1')).toBe(true)
    expect(isNumberToken('1.00')).toBe(true)
    expect(isNumberToken('10.88')).toBe(true)
    expect(isNumberToken('100.11')).toBe(true)
  })

  it('rejects tokens with partial or invalid decimals', () => {
    expect(isNumberToken('1.')).toBe(false)
    expect(isNumberToken('1.1')).toBe(false)
    expect(isNumberToken('1.123')).toBe(false)
  })

  it('rejects non-numbers', () => {
    expect(isNumberToken('Refined')).toBe(false)
    expect(isNumberToken('+')).toBe(false)
    expect(isNumberToken(undefined)).toBe(false)
  })
})

describe('isInProgressNumberToken', () => {
  it('accepts complete and partial decimal inputs', () => {
    expect(isInProgressNumberToken('1')).toBe(true)
    expect(isInProgressNumberToken('1.')).toBe(true)
    expect(isInProgressNumberToken('1.1')).toBe(true)
    expect(isInProgressNumberToken('1.00')).toBe(true)
  })

  it('rejects more than two decimal places', () => {
    expect(isInProgressNumberToken('1.123')).toBe(false)
  })
})

describe('isMetalToken', () => {
  it('returns true for Scrap, Reclaimed, Refined', () => {
    expect(isMetalToken('Scrap')).toBe(true)
    expect(isMetalToken('Reclaimed')).toBe(true)
    expect(isMetalToken('Refined')).toBe(true)
  })

  it('returns false for other tokens', () => {
    expect(isMetalToken('1.00')).toBe(false)
    expect(isMetalToken('+')).toBe(false)
    expect(isMetalToken(undefined)).toBe(false)
  })
})

describe('isValueToken', () => {
  it('returns true for numbers, metals, and close paren', () => {
    expect(isValueToken('1.00')).toBe(true)
    expect(isValueToken('Refined')).toBe(true)
    expect(isValueToken(')')).toBe(true)
  })

  it('returns false for operators and open paren', () => {
    expect(isValueToken('+')).toBe(false)
    expect(isValueToken('(')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Display utilities
// ---------------------------------------------------------------------------

describe('tokenToDisplayChar', () => {
  it('converts * to ×', () => {
    expect(tokenToDisplayChar('*')).toBe('×')
  })

  it('converts - to −', () => {
    expect(tokenToDisplayChar('-')).toBe('−')
  })

  it('converts metal tokens to their ref-value strings', () => {
    expect(tokenToDisplayChar('Scrap')).toBe('0.11')
    expect(tokenToDisplayChar('Reclaimed')).toBe('0.33')
    expect(tokenToDisplayChar('Refined')).toBe('1.00')
  })

  it('passes other tokens through unchanged', () => {
    expect(tokenToDisplayChar('+')).toBe('+')
    expect(tokenToDisplayChar('(')).toBe('(')
    expect(tokenToDisplayChar(')')).toBe(')')
    expect(tokenToDisplayChar('2.00')).toBe('2.00')
  })
})

describe('expressionToDisplay', () => {
  it('joins tokens as display chars separated by spaces', () => {
    expect(expressionToDisplay(['Refined', '+', 'Scrap'])).toBe('1.00 + 0.11')
    expect(expressionToDisplay(['Refined', '*', '2'])).toBe('1.00 × 2')
    expect(expressionToDisplay(['(', 'Refined', '-', 'Scrap', ')'])).toBe('( 1.00 − 0.11 )')
  })

  it('returns empty string for empty array', () => {
    expect(expressionToDisplay([])).toBe('')
  })
})

describe('getExpressionDisplayParts', () => {
  it('renders metal tokens as text in ref-value view', () => {
    const parts = getExpressionDisplayParts(['Refined'], 'ref-value')
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe('text')
    expect(parts[0].value).toBe('1.00')
  })

  it('renders metal tokens as metal type chips in visual view', () => {
    const parts = getExpressionDisplayParts(['Refined'], 'visual')
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe('metal')
    expect(parts[0].value).toBe('Refined')
  })

  it('renders parentheses as text in both views', () => {
    for (const view of ['visual', 'ref-value']) {
      const parts = getExpressionDisplayParts(['(', ')'], view)
      expect(parts).toHaveLength(2)
      expect(parts[0]).toMatchObject({ type: 'text', value: '(' })
      expect(parts[1]).toMatchObject({ type: 'text', value: ')' })
    }
  })

  it('renders operators with their display chars', () => {
    const parts = getExpressionDisplayParts(['+', '-', '*'], 'ref-value')
    expect(parts[0].value).toBe('+')
    expect(parts[1].value).toBe('−')
    expect(parts[2].value).toBe('×')
  })

  it('includes a stable id on each part', () => {
    const parts = getExpressionDisplayParts(['Refined', '+', 'Scrap'])
    expect(parts[0].id).toBeTruthy()
    expect(parts[1].id).toBeTruthy()
    expect(parts[2].id).toBeTruthy()
  })

  it('defaults to ref-value view', () => {
    const parts = getExpressionDisplayParts(['Refined'])
    expect(parts[0].type).toBe('text')
    expect(parts[0].value).toBe('1.00')
  })
})

// ---------------------------------------------------------------------------
// formatRefFromScrap
// ---------------------------------------------------------------------------

describe('formatRefFromScrap', () => {
  it('formats whole ref values', () => {
    expect(formatRefFromScrap(9)).toBe('1.00 ref')
    expect(formatRefFromScrap(18)).toBe('2.00 ref')
    expect(formatRefFromScrap(0)).toBe('0.00 ref')
  })

  it('formats fractional ref values', () => {
    expect(formatRefFromScrap(1)).toBe('0.11 ref')   // 1 scrap
    expect(formatRefFromScrap(3)).toBe('0.33 ref')   // 1 rec
    expect(formatRefFromScrap(10)).toBe('1.11 ref')  // 1 ref + 1 scrap
  })

  it('formats negative scrap counts', () => {
    expect(formatRefFromScrap(-9)).toBe('-1.00 ref')
    expect(formatRefFromScrap(-1)).toBe('-0.11 ref')
  })
})

// ---------------------------------------------------------------------------
// toMetalBreakdown
// ---------------------------------------------------------------------------

describe('toMetalBreakdown', () => {
  it('breaks down pure refined', () => {
    expect(toMetalBreakdown(9)).toEqual({ refined: 1, reclaimed: 0, scrap: 0, negative: false })
    expect(toMetalBreakdown(18)).toEqual({ refined: 2, reclaimed: 0, scrap: 0, negative: false })
  })

  it('breaks down pure reclaimed', () => {
    expect(toMetalBreakdown(3)).toEqual({ refined: 0, reclaimed: 1, scrap: 0, negative: false })
  })

  it('breaks down pure scrap', () => {
    expect(toMetalBreakdown(1)).toEqual({ refined: 0, reclaimed: 0, scrap: 1, negative: false })
  })

  it('breaks down mixed values', () => {
    // 13 scrap = 1 ref (9) + 1 rec (3) + 1 scrap (1)
    expect(toMetalBreakdown(13)).toEqual({ refined: 1, reclaimed: 1, scrap: 1, negative: false })
  })

  it('sets negative flag for negative values', () => {
    expect(toMetalBreakdown(-9)).toEqual({ refined: 1, reclaimed: 0, scrap: 0, negative: true })
    expect(toMetalBreakdown(-1)).toEqual({ refined: 0, reclaimed: 0, scrap: 1, negative: true })
  })

  it('handles zero', () => {
    expect(toMetalBreakdown(0)).toEqual({ refined: 0, reclaimed: 0, scrap: 0, negative: false })
  })
})

// ---------------------------------------------------------------------------
// evaluateTokens
// ---------------------------------------------------------------------------

describe('evaluateTokens', () => {
  describe('empty expression', () => {
    it('returns 0 for empty token array', () => {
      expect(evaluateTokens([])).toBe(0)
    })
  })

  describe('single value tokens', () => {
    it('evaluates a single metal token to its scrap value', () => {
      expect(evaluateTokens(['Scrap'])).toBe(1)
      expect(evaluateTokens(['Reclaimed'])).toBe(3)
      expect(evaluateTokens(['Refined'])).toBe(9)
    })

    it('evaluates a single ref-format number', () => {
      expect(evaluateTokens(['1.00'])).toBe(9)   // 1 ref = 9 scrap
      expect(evaluateTokens(['0.11'])).toBe(1)   // 1 scrap
      expect(evaluateTokens(['0.33'])).toBe(3)   // 1 rec
      expect(evaluateTokens(['2.00'])).toBe(18)
    })
  })

  describe('basic arithmetic', () => {
    it('adds metal tokens', () => {
      expect(evaluateTokens(['Refined', '+', 'Scrap'])).toBe(10)        // 9 + 1
      expect(evaluateTokens(['Refined', '+', 'Reclaimed'])).toBe(12)    // 9 + 3
      expect(evaluateTokens(['Refined', '+', 'Refined'])).toBe(18)      // 9 + 9
    })

    it('subtracts metal tokens', () => {
      expect(evaluateTokens(['Refined', '-', 'Scrap'])).toBe(8)         // 9 - 1
      expect(evaluateTokens(['Refined', '-', 'Reclaimed'])).toBe(6)     // 9 - 3
    })

    it('multiplies a metal token by a scalar', () => {
      expect(evaluateTokens(['Refined', '*', '2'])).toBe(18)   // 9 * 2
      expect(evaluateTokens(['Scrap', '*', '3'])).toBe(3)      // 1 * 3
      expect(evaluateTokens(['2', '*', 'Refined'])).toBe(18)   // commutative
    })

    it('multiplies two plain numbers (result treated as ref, then converted to scrap)', () => {
      // '2' * '3' = number 6, then 6.00 ref → refNumberToScrap(6) = 54 scrap
      expect(evaluateTokens(['2', '*', '3'])).toBe(54)
    })
  })

  describe('operator precedence', () => {
    it('applies * before + without parens', () => {
      // Scrap + Scrap * 2 = 1 + (1 * 2) = 1 + 2 = 3 (not left-to-right (1+1)*2=4)
      expect(evaluateTokens(['Scrap', '+', 'Scrap', '*', '2'])).toBe(3)
    })

    it('applies * before - without parens', () => {
      // Refined - Scrap * 2 = 9 - (1 * 2) = 9 - 2 = 7
      expect(evaluateTokens(['Refined', '-', 'Scrap', '*', '2'])).toBe(7)
    })
  })

  describe('parentheses', () => {
    it('overrides precedence with parentheses', () => {
      // (Scrap + Scrap) * 2 = 2 * 2 = 4 (without parens: 1 + 1*2 = 3)
      expect(evaluateTokens(['(', 'Scrap', '+', 'Scrap', ')', '*', '2'])).toBe(4)
    })

    it('evaluates nested parentheses', () => {
      // ((Scrap + Scrap) + Reclaimed) * 2 = (2 + 3) * 2 = 10
      expect(evaluateTokens(['(', '(', 'Scrap', '+', 'Scrap', ')', '+', 'Reclaimed', ')', '*', '2'])).toBe(10)
    })

    it('handles multiple parenthesised groups', () => {
      // (Refined + Scrap) + (Scrap * 2) = 10 + 2 = 12
      expect(evaluateTokens(['(', 'Refined', '+', 'Scrap', ')', '+', '(', 'Scrap', '*', '2', ')'])).toBe(12)
    })
  })

  describe('validation errors', () => {
    it('throws when expression starts with an operator', () => {
      expect(() => evaluateTokens(['+', 'Refined'])).toThrow('Expression cannot start or end with an operator.')
    })

    it('throws when expression ends with an operator', () => {
      expect(() => evaluateTokens(['Refined', '+'])).toThrow('Expression cannot start or end with an operator.')
    })

    it('throws on consecutive operators', () => {
      expect(() => evaluateTokens(['Refined', '+', '+', 'Scrap'])).toThrow('Invalid operator placement.')
    })

    it('throws on operator immediately after open paren', () => {
      expect(() => evaluateTokens(['(', '+', 'Refined', ')'])).toThrow('Invalid operator placement.')
    })

    it('throws on mismatched open paren', () => {
      expect(() => evaluateTokens(['(', 'Refined'])).toThrow('Mismatched parentheses.')
    })

    it('throws on mismatched close paren', () => {
      expect(() => evaluateTokens(['Refined', ')'])).toThrow('Mismatched parentheses.')
    })

    it('throws on empty parentheses', () => {
      expect(() => evaluateTokens(['(', ')'])).toThrow('Empty parentheses.')
    })

    it('throws when multiplying two metal amounts', () => {
      expect(() => evaluateTokens(['Refined', '*', 'Scrap'])).toThrow('Use a numeric multiplier, not amount × amount.')
    })

    it('throws on operator before open paren without a value before it', () => {
      // Operator immediately before paren (at start) — starts with operator
      expect(() => evaluateTokens(['+', '(', 'Refined', ')'])).toThrow('Expression cannot start or end with an operator.')
    })

    it('throws on value immediately before open paren (missing operator)', () => {
      expect(() => evaluateTokens(['Refined', '(', 'Scrap', ')'])).toThrow('Missing operator before "(".')
    })
  })
})
