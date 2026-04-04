# TF2 Calculator Math Documentation

## 1) Core Unit System
All internal arithmetic is performed in **scrap units**.

- `1 Scrap = 1` internal unit
- `1 Reclaimed = 3` internal units
- `1 Refined = 9` internal units

So, for any amount in refined metal (`ref`):

$$
\text{scrapUnits} = 9 \cdot \lfloor \text{ref} \rfloor + \text{remainderScrap}
$$

where `remainderScrap` must be an integer from `0` to `8`.

## 2) Valid Ref Decimal Steps
The calculator accepts ref decimals only in TF2-valid steps:

- `.00`, `.11`, `.22`, `.33`, `.44`, `.55`, `.66`, `.77`, `.88`

Invalid examples:

- `.09`, `.10`, `.99`, `.34`

A numeric token is parsed as:

- `W.DD`, where `W` is whole ref and `DD` is exactly two digits
- `DD` must have repeated digits and be in range `00..88`

Converted to scrap:

$$
\text{scrapUnits} = 9W + d
$$

where `d` is the repeated decimal digit (`0..8`).

Example:

- `1.33` -> $9 \cdot 1 + 3 = 12$ scrap units

## 3) Display Formatting
Computed result in scrap units is converted back to ref display using:

$$
\text{refDisplay} = \lfloor S/9 \rfloor + (S \bmod 9) \cdot 0.11
$$

where `S` is absolute scrap units.

Sign is reapplied after formatting.

This guarantees no impossible `.99` display.

## 4) Operator Semantics
Supported operators:

- `+`
- `-`
- `*`
- Parentheses `(` `)`

Division is intentionally unsupported.

### Typed evaluation model
Operands are evaluated as either:

- `amount`: already in scrap units (metals, or converted ref amounts)
- `number`: scalar numeric literal

Rules:

- `amount + amount` (or number converted to amount) -> amount
- `amount - amount` (or number converted to amount) -> amount
- `amount * number` or `number * amount` -> amount
- `number * number` -> number (converted to amount at finalization)
- `amount * amount` -> invalid

## 5) Precedence and Parsing
Parsing uses a standard infix-to-RPN (Shunting-yard) pipeline.

Precedence:

1. Parentheses
2. Multiplication `*`
3. Addition/Subtraction `+`, `-`

Evaluation occurs on RPN stack and final result is rounded to nearest scrap unit.

## 6) Practical Examples
- `Refined * 5`
  - `Refined = 9 scrap`
  - `9 * 5 = 45 scrap`
  - `45 scrap = 5.00 ref`

- `1.11 + Scrap`
  - `1.11 = 10 scrap`
  - `Scrap = 1 scrap`
  - total `11 scrap = 1.22 ref`

- `2 * (Reclaimed)`
  - `Reclaimed = 3 scrap`
  - `2 * 3 = 6 scrap = 0.66 ref`

## 7) Input Behavior Relevant to Math
- Whole numbers represent whole refined values (e.g., `1` means `1.00 ref`).
- Decimal entry is constrained to TF2 increments.
- Once a value reaches two decimal digits (e.g., `1.33`), entering another digit starts an implicit multiplication term instead of extending the decimal.
