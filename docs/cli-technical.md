# TF2 Calculator CLI Technical Documentation

## 1. Purpose
The CLI provides terminal and scripting access to the same TF2 metal calculation engine used by the desktop app.

Design goals:
- Reuse existing engine logic for parsing, evaluation, and formatting
- Keep CLI handlers thin and deterministic
- Preserve integer scrap arithmetic and TF2 increment validation
- Provide command-oriented workflows for automation

## 2. Entry Point and Module Wiring
CLI entrypoint:
- bin/tf2calc.js

Package mapping:
- package.json -> bin.tf2calc = ./bin/tf2calc.js

Local script:
- package.json -> scripts.cli = node ./bin/tf2calc.js

The project uses ES modules. The engine import in src/lib/calculatorEngine.js uses explicit .js extension so Node can resolve it outside Vite bundling.

## 3. Reused Engine APIs
The CLI does not re-implement core math. It delegates to:
- evaluateTokens(tokens): infix validation and typed evaluation to scrap integer
- formatRefFromScrap(scrap): ref formatting (for example 1.33 ref)
- toMetalBreakdown(scrap): refined/reclaimed/scrap decomposition
- expressionToDisplay(tokens): display-friendly expression rendering for explain output

## 4. Input Normalization Layer (CLI-only)
The CLI layer is responsible for text normalization only.

### 4.1 Alias normalization
Accepted aliases:
- ref, refined -> Refined
- rec, reclaimed -> Reclaimed
- scrap -> Scrap

### 4.2 Tokenization
Tokenizer accepts both spaced and compact input.
Examples:
- 1.33 ref + 2 rec
- 1.33ref+2rec

Recognized token groups:
- Numeric fragments
- Alpha words
- Operators and parentheses

### 4.3 Unit expansion
Number + unit is expanded before engine evaluation:
- N ref -> N
- N rec -> N * Reclaimed
- N scrap -> N * Scrap

This allows ergonomic unit syntax while still feeding engine-compatible tokens.

### 4.4 Division rejection
The CLI rejects / and ÷ before evaluation to keep behavior explicit and aligned with project rules.

## 5. Global Flags
Supported global flags:
- --help or -h: print usage and exit
- --quiet: output only final ref value

Quiet mode is intentionally stable for scripts.

## 6. Command Contracts

### 6.1 Default expression mode
Format:
- tf2calc <expression>

Behavior:
- Tokenize and normalize expression
- Evaluate through evaluateTokens
- Output final ref with formatRefFromScrap

### 6.2 convert
Format:
- tf2calc convert <value> [--to ref|scrap|mixed]

Output modes:
- ref: formatted ref output
- scrap: integer scrap count
- mixed: refined/reclaimed/scrap string

### 6.3 normalize
Format:
- tf2calc normalize <value>

Behavior:
- Evaluate value expression
- Output normalized ref string only

### 6.4 sum
Format:
- tf2calc sum <value1> <value2> ...

Behavior:
- Evaluate each input independently
- Sum scraps as integers
- Output formatted ref

### 6.5 mul
Format:
- tf2calc mul <value> <integer>

Rules:
- Multiplier must be strict integer
- Non-integer multipliers are rejected

### 6.6 avg
Format:
- tf2calc avg <value1> <value2> ...

Behavior:
- Evaluate each value to integer scrap
- Compute average as round(total / count)
- Output formatted ref

### 6.7 explain
Format:
- tf2calc explain <expression>

Behavior:
- Print additive term breakdown with term scrap values
- Print total scrap
- Print final formatted result

### 6.8 compare
Format:
- tf2calc compare <a> <b>

Behavior:
- Compute a - b
- Output scrap difference and formatted difference

### 6.9 profit
Format:
- tf2calc profit buy=<value> sell=<value>

Behavior:
- Compute sell - buy
- Output scrap difference and formatted difference

### 6.10 split
Format:
- tf2calc split <value> <integer>

Behavior:
- Evaluate total scrap
- each = trunc(total / shares)
- remainder = total - each * shares
- Output each share and remainder scrap

## 7. Error Handling Model
Error policy:
- Command argument errors and parser errors exit with code 1
- Message format starts with Error:

Common error classes:
- Missing required args
- Unknown token
- Invalid --to value
- Invalid integer multiplier/share count
- Division attempt
- Engine-level expression validation errors

The CLI preserves engine errors for TF2 increment constraints and operator validity.

## 8. Arithmetic and Precision Guarantees
- All final computation is integer scrap based
- No floating-point business logic in command handlers
- Formatter output is always derived from shared engine formatter

This keeps desktop and CLI outputs behaviorally consistent.

## 9. Windows and npm Compatibility
The tf2calc command is exposed via npm bin mapping.

Expected usage paths:
- npm run cli -- <args>
- npm exec tf2calc -- <args>
- global install usage after publish

On Windows, npm generates the command shim automatically.

## 10. Maintenance Notes
If calculator rules evolve, update only the shared engine first.
CLI should remain a routing and normalization layer, not a business-rule layer.

Recommended regression checks after engine changes:
- Increment validation
- Multiplication type restrictions
- Quiet mode stability
- Each subcommand happy-path and failure-path execution
