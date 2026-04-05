# @tf2calc/cli

Command-line calculator for Team Fortress 2 metal math.

## Install

Global:

```bash
npm i -g @tf2calc/cli
```

No global install:

```bash
npm exec @tf2calc/cli -- "1.33 ref + 2 rec"
```

## Usage

```bash
tf2calc "1.33 ref + 2 rec"
tf2calc convert "2.55 ref" --to mixed
tf2calc normalize "1.333"
tf2calc sum "1.11 ref" "2 rec" "3 scrap"
tf2calc mul "1.22 ref" 3
tf2calc avg "1.00 ref" "2.00 ref"
tf2calc explain "2 * (Reclaimed + Scrap)"
tf2calc compare "1.33 ref" "12 scrap"
tf2calc profit buy="1.22 ref" sell="1.44 ref"
tf2calc split "5.00 ref" 3
```

## Flags

- `--quiet` prints only the final ref value
- `--help` prints command help
