# TF2 Calculator

TF2 Calculator is a big ol' monorepo that provides:

- A shared TF2 metal math engine: `@tf2calc/core`
- A reusable React component: `@tf2calc/react-ui`
- A desktop app (Electron + React) under `apps/desktop`
- A CLI tool: `@tf2calc/cli` (BECAUSE I F'ING CAN, felt cute might delete later...)

It evaluates expressions using TF2-valid increments and integer scrap arithmetic, then formats output back to ref values.
Basically.. its a calculator... for TF2... because i was sick and tired of calculating the sum value of like  32+ items a rando offers me for my low tier unusual on a random ass server.

I COULDNT FIND ONE GOOD CALCULATOR.... LIKE THE GAME IS LIKE 20 YEARS OLD.. ok crashout is over lets continue:

## Core Rules

- Internal math is done in scrap units (`Scrap=1`, `Reclaimed=3`, `Refined=9`)
- Division is unsupported ... I tried and failed miserably (maybe i'll try again later)
- Valid ref decimal increments are `.00`, `.11`, `.22`, `.33`, `.44`, `.55`, `.66`, `.77`, `.88` (because .99 is a ref, duh')
- Formatting uses the shared calc engine so desktop app, React UI and CLI try to stay consistent... so far it has worked... 

## Packages

- `@tf2calc/core` - Shared parser/evaluator/formatter engine aka the lib you want if you need a calculator
- `@tf2calc/cli` - Command-line tool (`tf2calc`)
- `@tf2calc/react-ui` - Embeddable React calculator component (also the base for the desktop app soo yeah)

## Quick Start

Install workspace dependencies:

```bash
npm install
```

Run desktop app in development:

```bash
npm run desktop:dev
```

Run CLI locally:

```bash
npm run cli -- "1.33 ref + 2 rec"
```

Run CLI via npm exec:

```bash
npm exec tf2calc -- "1.33 ref + 2 rec"
```

## CLI Usage

Install globally (published package):

```bash
npm i -g @tf2calc/cli
tf2calc "1.33 ref + 2 rec"
```

Commands:

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

Global flags:

- `--quiet` (print only final ref value)
- `--help` (print usage)

Value input:

- Aliases: `ref`, `rec`, `scrap`
- Canonical names: `Refined`, `Reclaimed`, `Scrap`
- Both compact and spaced expressions are supported

Examples:

```bash
tf2calc "2ref + 1 scrap"
tf2calc convert "1.33 ref" --to scrap
tf2calc mul "1.11 ref" 3
tf2calc profit buy="1 ref" sell="1.33 ref"
```

## Development

Common scripts:

```bash
npm run lint
npm run build
npm run build:desktop
npm run build:react-ui
```

Publish scripts:

```bash
npm run release:core
npm run release:cli
npm run release:react-ui
npm run release
```

### GitHub Actions Release Automation

Automated release workflows are available under `.github/workflows`:

- `publish-npm-packages.yml`
	- Triggers: manual dispatch and `v*` tag push
	- Validates lint + core tests + build
	- Fails early if target package version already exists on npm
	- Publishes in order: `@tf2calc/core` -> `@tf2calc/cli` -> `@tf2calc/react-ui`
- `release-desktop-installer.yml`
	- Triggers: manual dispatch (requires `release_tag`) and `v*` tag push
	- Builds desktop installer and uploads `.exe` artifacts to GitHub Releases

    Two ways baby!

## Documentation

- [docs/calculation-math.md](docs/calculation-math.md)
- [docs/cli-technical.md](docs/cli-technical.md)
- [docs/core-package.md](docs/core-package.md)
- [docs/cli-package.md](docs/cli-package.md)
- [docs/react-ui-package.md](docs/react-ui-package.md)
- [docs/desktop-app.md](docs/desktop-app.md)
