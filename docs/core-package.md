# @tf2calc/core Package Documentation

## Overview

`@tf2calc/core` is the shared calculation engine used by all TF2 Calculator packages. It handles tokenization, expression parsing, evaluation, and formatting of Team Fortress 2 metal calculations.

## Installation

```bash
npm install @tf2calc/core
```

## Core Concepts

### Metal Units

All internal calculations use **scrap units**:

- `1 Scrap = 1` unit
- `1 Reclaimed = 3` units
- `1 Refined = 9` units

This allows integer arithmetic without floating-point precision issues.

### Valid Decimal Increments

Refined values only accept TF2-valid decimal increments (repeating digits):

Valid: `.00`, `.11`, `.22`, `.33`, `.44`, `.55`, `.66`, `.77`, `.88`

Invalid: `.09`, `.10`, `.99`, `.34`

Internally, `1.33` is stored as $9 \times 1 + 3 = 12$ scrap units.

## Main APIs

### `evaluateTokens(tokens: string[]): number`

Evaluates a normalized token array and returns the result in scrap units.

```js
import { evaluateTokens } from '@tf2calc/core'

const scrapUnits = evaluateTokens(['1.33', '+', 'Reclaimed'])
console.log(scrapUnits) // 13 (12 from 1.33 + 1 from Reclaimed... wait, Reclaimed is 3)
// Actually: 12 + 3 = 15
```

**Operators:**
- `+` (addition)
- `-` (subtraction)
- `*` (multiplication, number must be on right)
- `(` `)` (parentheses for grouping)

**Token Types:**
- Numeric: `"1.33"`, `"0.00"`
- Metals: `"Scrap"`, `"Reclaimed"`, `"Refined"`, `"Key"`
- Operators: `"+"`, `"-"`, `"*"`
- Parentheses: `"("`, `")"`

**Errors:**

Throws an error for:
- Invalid syntax (unmatched parens, consecutive operators, etc.)
- Type mismatches (e.g., `Scrap * Reclaimed`)
- Division attempts

### `formatRefFromScrap(scrapUnits: number): string`

Converts scrap units back to Refined display format.

```js
import { formatRefFromScrap } from '@tf2calc/core'

console.log(formatRefFromScrap(12)) // "1.33 ref"
console.log(formatRefFromScrap(9))  // "1.00 ref"
console.log(formatRefFromScrap(1))  // "0.11 ref"
```

**Returns:** String in format `"N.DD ref"` where N ≥ 0 and DD is valid increment.

### `toMetalBreakdown(scrapUnits: number): { refined, reclaimed, scrap }`

Decomposes scrap units into metal components.

```js
import { toMetalBreakdown } from '@tf2calc/core'

const breakdown = toMetalBreakdown(45) // 5 refined
console.log(breakdown)
// { refined: 5, reclaimed: 0, scrap: 0 }

const breakdown2 = toMetalBreakdown(28) // 3 refined, 1 reclaimed, 1 scrap
console.log(breakdown2)
// { refined: 3, reclaimed: 1, scrap: 1 }
```

### `expressionToDisplay(tokens: string[]): string`

Converts token array to human-readable expression.

```js
import { expressionToDisplay } from '@tf2calc/core'

const display = expressionToDisplay(['1.33', '+', 'Scrap', '*', '2'])
console.log(display) // "1.33 + Scrap * 2"
```

### `getExpressionDisplayParts(tokens: string[]): { parts: string[], positions: number[] }`

Returns styled display parts for UI rendering.

```js
import { getExpressionDisplayParts } from '@tf2calc/core'

const { parts, positions } = getExpressionDisplayParts(['1.33', '+', 'Scrap'])
console.log(parts)     // ["1.33", "+", "Scrap"]
console.log(positions) // [0, 5, 7]
```

## Classification Functions

### `isMetalToken(token: string): boolean`

Returns true if token is a metal constant (`"Scrap"`, `"Reclaimed"`, `"Refined"`, `"Key"`).

### `isOperator(token: string): boolean`

Returns true if token is `"+"`, `"-"`, or `"*"`.

### `isOpenParen(token: string): boolean` / `isCloseParen(token: string): boolean`

Returns true for `"("` and `")"` respectively.

### `isNumberToken(token: string): boolean`

Returns true if token is a valid numeric literal (e.g., `"1.33"`, `"0"`, `"9.99"`).

### `isInProgressNumberToken(token: string): boolean`

Returns true if token is a partially-typed number (for UI input parsing). Allows single `.` and incomplete decimals.

### `isValueToken(token: string): boolean`

Returns true if token is either a number or metal constant.

## Constants

```js
import {
  METAL_SCRAP,
  METAL_RECLAIMED,
  METAL_REFINED,
  METAL_KEY,
  METAL_DISPLAY_VALUE
} from '@tf2calc/core'

console.log(METAL_SCRAP)        // 1
console.log(METAL_RECLAIMED)    // 3
console.log(METAL_REFINED)      // 9
console.log(METAL_DISPLAY_VALUE) // 0.11 (the decimal step)
```

## Error Handling

All evaluation errors are thrown as JavaScript errors with descriptive messages:

```js
import { evaluateTokens } from '@tf2calc/core'

try {
  evaluateTokens(['1.33', '+', 'Scrap', '+'])
} catch (err) {
  console.error(err.message)
  // "Unexpected end of expression"
}

try {
  evaluateTokens(['Scrap', '*', 'Reclaimed'])
} catch (err) {
  console.error(err.message)
  // "Cannot multiply two amounts"
}
```

## Operator Precedence

1. Parentheses `( )`
2. Multiplication `*`
3. Addition/Subtraction `+`, `-`

```js
import { evaluateTokens, formatRefFromScrap } from '@tf2calc/core'

// Precedence: * before +
const result1 = evaluateTokens(['1', '+', '2', '*', '3'])
console.log(formatRefFromScrap(result1)) // 1.00 + (2 * 3) = 1.66 ref

// Parentheses override
const result2 = evaluateTokens(['(', '1', '+', '2', ')', '*', '3'])
console.log(formatRefFromScrap(result2)) // (1 + 2) * 3 = 9.00 ref
```

## Type System

The evaluator uses a typed system:

- **amount** – A refined metal value (result of any additive expression)
- **number** – A scalar multiplier (must be right operand of `*`)

Rules:
- `amount + amount` → `amount`
- `amount - amount` → `amount`
- `amount * number` → `amount`
- `number * number` → `number` (treated as `1 * 1 * ... = amount`)
- `amount * amount` → Error

```js
// Valid: 2 * Refined = 2 * 9 = 18 scrap
// Valid: Refined * 2 = 9 * 2 = 18 scrap
// Invalid: Refined * Refined
```

## Architecture

### File Structure

```
packages/core/
├── src/
│   ├── index.js              # Main exports
│   ├── calculatorEngine.js   # Core evaluation logic
│   └── calculatorConfig.js   # Constants and helpers
└── package.json
```

### Data Flow

1. **Tokenization** (CLI/UI only) – Raw input → token array
2. **Validation** – Tokens checked for syntax
3. **RPN Conversion** – Infix tokens → Reverse Polish Notation
4. **Evaluation** – RPN stack evaluation with type checking
5. **Formatting** – Scrap result → Display string

## Usage Examples

### Example 1: Simple Addition

```js
import { evaluateTokens, formatRefFromScrap } from '@tf2calc/core'

const tokens = ['1.33', '+', '2.22']
const scrapUnits = evaluateTokens(tokens)
const result = formatRefFromScrap(scrapUnits)
console.log(result) // "3.55 ref"
```

### Example 2: Mixed Units

```js
const tokens = ['1.00', '+', 'Reclaimed', '+', 'Scrap']
// 1.00 ref (9 scrap) + 3 scrap + 1 scrap = 13 scrap
const scrapUnits = evaluateTokens(tokens)
const result = formatRefFromScrap(scrapUnits)
console.log(result) // "1.44 ref"
```

### Example 3: Multiplication

```js
const tokens = ['1.22', '*', '2']
// 11 scrap * 2 = 22 scrap = 2.44 ref
const scrapUnits = evaluateTokens(tokens)
const result = formatRefFromScrap(scrapUnits)
console.log(result) // "2.44 ref"
```

### Example 4: Complex Expression

```js
const tokens = ['2', '*', '(', 'Refined', '+', '1.33', ')']
// 2 * (9 + 12) = 2 * 21 = 42 scrap = 4.66 ref
const scrapUnits = evaluateTokens(tokens)
const result = formatRefFromScrap(scrapUnits)
console.log(result) // "4.66 ref"
```

## Performance Notes

- All operations use integer arithmetic (no floating-point).
- Evaluation is O(n) where n is number of tokens.
- Token arrays are not modified in place.
- Safe for repeated use in loops without memory leaks.

## Limitations

- Division is intentionally not supported (TF2 does not use fractional metal).
- Percentage operations not supported.
- Exponentiation not supported.
- Negative results are supported but unusual (edge case for calculus-style math).
