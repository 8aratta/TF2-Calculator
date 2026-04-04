# TF2 Calculator

TF2 Calculator is a desktop calculator (Electron + React) and CLI tool for Team Fortress 2 metal math.
It evaluates expressions using TF2-valid increments and integer scrap arithmetic, then formats output back to ref values.

## Core Rules

- Internal math is done in scrap units (`Scrap=1`, `Reclaimed=3`, `Refined=9`)
- Division is unsupported
- Valid ref decimal increments are `.00`, `.11`, `.22`, `.33`, `.44`, `.55`, `.66`, `.77`, `.88`
- Formatting uses the shared engine so desktop and CLI outputs stay consistent

## Desktop App

```bash
npm install
npm run desktop:dev
```

## CLI

Run locally:

```bash
npm run cli -- "1.33 ref + 2 rec"
```

Use through npm bin:

```bash
npm exec tf2calc -- "1.33 ref + 2 rec"
```

Global install (after publish):

```bash
npm i -g tf2-calculator
tf2calc "1.33 ref + 2 rec"
```

### Commands

```bash
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
```

Global flag:

```bash
--quiet
```

`--quiet` prints only the final ref value.

### Value Input

- Accepts aliases: `ref`, `rec`, `scrap`
- Accepts canonical names: `Refined`, `Reclaimed`, `Scrap`
- Accepts compact and spaced expressions

Examples:

```bash
tf2calc "2ref + 1 scrap"
tf2calc convert "1.33 ref" --to scrap
tf2calc mul "1.11 ref" 3
tf2calc profit buy="1 ref" sell="1.33 ref"
```

## Development

```bash
npm run lint
npm run build
```
