# @tf2calc/core

Shared TF2 metal calculation engine used by the CLI and React UI packages.

## Install

```bash
npm i @tf2calc/core
```

## What it provides

- Token normalization and validation helpers
- Infix to RPN evaluation for supported TF2 expressions
- Formatting and display helpers for TF2 ref increments
- Metal conversion constants (`Scrap=1`, `Reclaimed=3`, `Refined=9`)

## Example

```js
import { evaluateTokens, formatRefFromScrap } from '@tf2calc/core'

const scrap = evaluateTokens(['1.33', '+', 'Reclaimed'])
console.log(formatRefFromScrap(scrap))
```

## Key exports

- `evaluateTokens`
- `formatRefFromScrap`
- `toMetalBreakdown`
- `expressionToDisplay`
- `getExpressionDisplayParts`
- `isOperator`, `isOpenParen`, `isCloseParen`
- `isNumberToken`, `isInProgressNumberToken`, `isMetalToken`, `isValueToken`
- `METAL_SCRAP`, `METAL_DISPLAY_VALUE`
