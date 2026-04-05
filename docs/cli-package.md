# @tf2calc/cli Package Documentation

## Overview

`@tf2calc/cli` is a command-line calculator for Team Fortress 2 metal math. It reuses the core calculation engine and provides ergonomic commands for common workflows.

## Installation

### Global Installation

```bash
npm install -g @tf2calc/cli
```

Then use:

```bash
tf2calc "1.33 ref + 2 rec"
```

### Without Global Install

```bash
npm exec @tf2calc/cli -- "1.33 ref + 2 rec"
```

Or as a project dependency:

```bash
npm install --save-dev @tf2calc/cli

npx tf2calc "1.33 ref + 2 rec"
```

## Basic Usage

```bash
tf2calc <expression> [options]
```

**Examples:**

```bash
tf2calc "1.33 ref + 2 rec"           # Two items, two units
tf2calc "1.33 + 2"                   # Assumed ref, then refined metal
tf2calc "1.33ref+2rec"               # Compact syntax (no spaces)
tf2calc "2 * (Refined + Scrap)"      # Parentheses and operators
```

## Global Options

### `--quiet` or `-q`

Output only the final ref value, one per line. Useful for scripting.

```bash
$ tf2calc "1.33 + 2 rec" --quiet
2.11 ref
```

### `--help` or `-h`

Print usage information and exit.

```bash
$ tf2calc --help
```

## Commands

### Default Expression Mode

Evaluate a mathematical expression and return the result.

**Format:**
```bash
tf2calc <expression>
```

**Examples:**

```bash
$ tf2calc "1.00 ref + 1.00 ref"
2.00 ref

$ tf2calc "10 scrap - 3 scrap"
0.77 ref

$ tf2calc "1.33 * 3"
3.99 ref

$ tf2calc "Refined * 5"
5.00 ref

$ tf2calc "(1 + 2 rec) * 2"
1.66 ref
```

### `convert` Command

Convert a metal value between different formats.

**Format:**
```bash
tf2calc convert <value> [--to ref|scrap|mixed]
```

**Output Modes:**

- `ref` – Formatted refined notation (default)
- `scrap` – Total scrap unit count
- `mixed` – Breakdown as refined/reclaimed/scrap string

**Examples:**

```bash
$ tf2calc convert "45 scrap"
5.00 ref

$ tf2calc convert "45 scrap" --to scrap
45

$ tf2calc convert "2.55 ref" --to mixed
2 refined, 1 reclaimed, 6 scrap

$ tf2calc convert "3.44 ref" --to mixed
3 refined, 4 reclaimed, 0 scrap
```

### `normalize` Command

Parse and normalize a value to standard ref format.

**Format:**
```bash
tf2calc normalize <value>
```

**Examples:**

```bash
$ tf2calc normalize "1.333"
1.33 ref

$ tf2calc normalize "10 scrap"
1.11 ref

$ tf2calc normalize "1 rec + 1 scrap"
0.44 ref
```

### `sum` Command

Add multiple values together.

**Format:**
```bash
tf2calc sum <value1> <value2> [value3] ...
```

**Examples:**

```bash
$ tf2calc sum "1.00 ref" "2.00 ref"
3.00 ref

$ tf2calc sum "1 ref" "5 scrap" "2 rec"
1.88 ref

$ tf2calc sum "1.11 ref" "2.22 ref" "3.33 ref" "4.44 ref"
11.10 ref
```

### `mul` Command

Multiply a value by a number.

**Format:**
```bash
tf2calc mul <base> <multiplier>
```

**Examples:**

```bash
$ tf2calc mul "1.33 ref" 3
3.99 ref

$ tf2calc mul "Reclaimed" 10
3.33 ref

$ tf2calc mul "0.44 ref" 2.5
Error: "2.5" is not a valid multiplier (must be integer)
```

**Note:** Multiplier must be an integer.

### `avg` Command

Calculate the average of multiple values.

**Format:**
```bash
tf2calc avg <value1> <value2> [value3] ...
```

**Examples:**

```bash
$ tf2calc avg "1.00 ref" "2.00 ref"
1.50 ref (well, 1.44 ref with TF2 increments)

$ tf2calc avg "1.00 ref" "2.00 ref" "3.00 ref"
2.00 ref
```

**Note:** Result is rounded to nearest valid TF2 increment.

### `explain` Command

Show detailed breakdown of an expression.

**Format:**
```bash
tf2calc explain <expression>
```

**Examples:**

```bash
$ tf2calc explain "1.33 + Reclaimed"
Expression: 1.33 + Reclaimed
= 12 scrap + 3 scrap
= 15 scrap
= 1.66 ref

$ tf2calc explain "2 * (1.00 + Reclaimed)"
Expression: 2 * (1.00 + Reclaimed)
= 2 * (9 scrap + 3 scrap)
= 2 * 12 scrap
= 24 scrap
= 2.66 ref
```

### `compare` Command

Compare two values and show the difference.

**Format:**
```bash
tf2calc compare <value1> <value2>
```

**Examples:**

```bash
$ tf2calc compare "2.00 ref" "1.50 ref"
2.00 ref is 0.55 ref more than 1.50 ref

$ tf2calc compare "1.00 ref" "15 scrap"
1.00 ref is 0.00 ref different from 15 scrap
```

### `profit` Command

Calculate profit from a buy/sell trade.

**Format:**
```bash
tf2calc profit buy=<buy_price> sell=<sell_price>
```

**Examples:**

```bash
$ tf2calc profit buy="1.22 ref" sell="1.44 ref"
Profit: 0.22 ref per item

$ tf2calc profit buy="1.33 ref" sell="1.33 ref"
Profit: 0.00 ref per item (break even)

$ tf2calc profit buy="1.55 ref" sell="1.33 ref"
Profit: -0.22 ref per item (loss)
```

### `split` Command

Divide a value evenly among N parties.

**Format:**
```bash
tf2calc split <total> <parties>
```

**Examples:**

```bash
$ tf2calc split "5.00 ref" 3
1.66 ref per person

$ tf2calc split "1.00 ref" 2
0.55 ref per person

$ tf2calc split "10 scrap" 3
0.33 ref per person
```

**Note:** Uses banker's rounding (round to nearest even on tie).

## Input Format Rules

### Metal Units

All of these are equivalent:

```bash
tf2calc "1.33 ref"             # Explicit unit
tf2calc "1.33 ref"             # Space optional
tf2calc "1.33ref"              # Compact form
```

### Unit Aliases

- `ref`, `refined` → Refined (9 scrap)
- `rec`, `reclaimed` → Reclaimed (3 scrap)
- `scrap` → Scrap (1 scrap)

All aliases are case-insensitive in input (normalized to capitalized).

### Decimal Validation

Only TF2-valid decimals accepted:

- Valid: `.00`, `.11`, `.22`, `.33`, `.44`, `.55`, `.66`, `.77`, `.88`
- Invalid: `.10`, `.99`, `.50`, etc.

### Operators

- `+` addition
- `-` subtraction
- `*` multiplication (right operand must be a number)
- `(` `)` parentheses

Division `/` and `÷` are intentionally rejected.

### Shorthand

Metal constants can be used without numbers:

```bash
tf2calc "Refined + Reclaimed + Scrap"
# = 9 + 3 + 1 = 13 scrap = 1.44 ref
```

## Exit Codes

- `0` – Success
- `1` – Invalid syntax or calculation error
- `2` – Wrong number of arguments for command

## Scripting Examples

### Example 1: Calculate Total Inventory Value

```bash
#!/bin/bash

total=0
while IFS= read -r item value; do
  result=$(tf2calc "$value" --quiet)
  echo "$item: $result"
  total=$(tf2calc "sum $total $result" --quiet)
done < inventory.txt

echo "Total: $total"
```

### Example 2: Check Trade Profit

```bash
#!/bin/bash

buy_price=$1
sell_price=$2

profit=$(tf2calc profit buy="$buy_price" sell="$sell_price" --quiet)
echo "$profit"
```

### Example 3: Batch Price Conversion

```bash
# Convert all prices from scrap to ref format

for scrap in 30 45 99 156; do
  ref=$(tf2calc convert "$scrap scrap" --to ref --quiet)
  echo "$scrap scrap = $ref"
done
```

## Common Use Cases

### Trading Calculations

```bash
# How much profit on 5 items?
tf2calc profit buy="1.22 ref" sell="1.44 ref"

# Is this a good bulk deal?
tf2calc "100 ref / 50 keys"    # Not supported, but...
tf2calc compare "100 ref" "50 keys"  # Use compare instead
```

### Price Standardization

```bash
# Normalize prices to standard format
tf2calc normalize "1.333"
tf2calc normalize "2 rec 5 scrap"
```

### Inventory Management

```bash
# Total metal in inventory
tf2calc sum "10.00 ref" "5 rec" "3 scrap" "1 key"

# Break down a total into refined/reclaimed/scrap
tf2calc convert "123 scrap" --to mixed
```

### Calculation Verification

```bash
# Verify manual math
tf2calc explain "2 * (Refined + 1.33)"

# Double-check item splits
tf2calc split "100 ref" 7
```

## Performance

- Calculation is instant for single expressions
- Bulk operations (100+ calls) complete in milliseconds
- Suitable for real-time scripting

## Limitations

- Division and modulo operations not supported (intentional TF2 design)
- Negative results possible but unusual (edge case for scripting)
- Maximum integer precision: JavaScript Number max safe integer (~9 quadrillion scrap = ~1 billion trillion ref)
- No built-in history or session state
