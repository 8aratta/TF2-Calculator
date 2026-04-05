# @tf2calc/react-ui Package Documentation

## Overview

`@tf2calc/react-ui` is a reusable React component that provides an interactive calculator interface for Team Fortress 2 metal calculations. It can be embedded in any React application.

## Installation

### Prerequisites

- React 19.0.0 or higher
- React DOM 19.0.0 or higher

### Install Package

```bash
npm install @tf2calc/react-ui react react-dom
```

## Basic Usage

### Minimal Setup

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import TF2Calculator from '@tf2calc/react-ui'
import '@tf2calc/react-ui/styles.css'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(<TF2Calculator />)
```

### In an Existing Application

```jsx
import TF2Calculator from '@tf2calc/react-ui'
import '@tf2calc/react-ui/styles.css'

export default function App() {
  return (
    <div className="app">
      <h1>TF2 Metal Calculator</h1>
      <TF2Calculator />
    </div>
  )
}
```

## Component API

### Default Export

```jsx
import TF2Calculator from '@tf2calc/react-ui'

<TF2Calculator {...props} />
```

### Named Export

```jsx
import { TF2Calculator } from '@tf2calc/react-ui'

<TF2Calculator {...props} />
```

## Props

### `metalIcons` (optional)

Override the default metal and item icons with custom images.

**Type:** Object

**Properties:**
- `Scrap` (string) – URL to Scrap metal icon
- `Reclaimed` (string) – URL to Reclaimed metal icon
- `Refined` (string) – URL to Refined metal icon
- `Key` (string) – URL to Key icon

**Example:**

```jsx
<TF2Calculator
  metalIcons={{
    Scrap: '/assets/scrap.png',
    Reclaimed: '/assets/reclaimed.png',
    Refined: '/assets/refined.png',
    Key: '/assets/key.png',
  }}
/>
```

**Default Icons:**

The component includes built-in TF2 metal icons (PNG images in the package assets). If you don't provide `metalIcons`, these defaults are used.

### Future Props

The component may accept additional props in future versions:
- `initialExpression` – Pre-populate the calculator with an expression
- `theme` – Light/dark mode preference
- `onResult` – Callback when calculation completes

## Styling

### CSS Module

Import the main stylesheet:

```jsx
import '@tf2calc/react-ui/styles.css'
```

This includes:
- Component layout and responsive design
- Light theme (default)
- Dark theme CSS variables (automatically applied based on system preference)

### CSS Variables

The component uses CSS custom properties for theming:

```css
/* Light theme (default) */
--color-bg: white
--color-text: #333
--color-border: #ddd
--color-button-bg: #f9f9f9
--color-button-hover: #efefef
--color-button-active: #e0e0e0
--color-result: #4CAF50
--color-error: #f44336

/* Dark theme (media query prefers-color-scheme: dark) */
--color-bg: #1e1e1e
--color-text: #e0e0e0
--color-border: #333
--color-button-bg: #2d2d2d
--color-button-hover: #3a3a3a
--color-button-active: #444
--color-result: #66BB6A
--color-error: #EF5350
```

### Custom Theming

To override colors, define CSS variables in your stylesheet:

```css
:root {
  --color-bg: #f0f0f0;
  --color-text: #222;
  --color-button-bg: #e8e8e8;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0a0a0a;
    --color-text: #f0f0f0;
    --color-button-bg: #1a1a1a;
  }
}
```

### Component Classes

For granular styling, the component provides these class names:

```
.tf2-calculator              /* Main container */
  .tf2-calculator-header     /* Top section */
  .tf2-calculator-display    /* Result display area */
    .tf2-display-value       /* Large result text */
    .tf2-display-breakdown   /* Metal breakdown */
  .tf2-calculator-input      /* Input expression area */
    .tf2-input-field         /* Text input */
  .tf2-calculator-buttons    /* Button grid */
    .tf2-button-group        /* Group of buttons (metals, operators, etc.) */
    .tf2-button              /* Individual button */
      .tf2-button-metal      /* Metal buttons with icons */
      .tf2-button-operator   /* Operator buttons */
  .tf2-calculator-footer     /* Bottom section */
```

### Example: Custom Styling

```css
.tf2-calculator {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
}

.tf2-display-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-result);
}

.tf2-button {
  border-radius: 4px;
  font-size: 1.1rem;
  transition: all 0.15s;
}

.tf2-button:active {
  transform: scale(0.95);
}
```

## Features

### Keyboard Support

The calculator supports keyboard input:

- **Numbers:** 0–9
- **Operators:** `+`, `-`, `*`, `=`
- **Backspace:** Delete last token
- **Enter:** Calculate expression
- **Escape:** Clear expression
- **Metal Buttons:** Press `S` (Scrap), `R` (Reclaimed), `F` (Refined), `K` (Key)

### Display

- **Current Expression:** Shows tokens in human-readable format
- **Calculation History:** Displays previous 5–10 calculations
- **Error Handling:** Shows validation messages for invalid input
- **Metal Breakdown:** Displays result as "Refined/Reclaimed/Scrap" when applicable

### Input Validation

- Prevents invalid decimal increments in real-time
- Rejects division and unsupported operators
- Shows helpful error messages
- Highlights invalid tokens

## Architecture

### Component Structure

```
TF2Calculator (Main Component)
├── Display (Result showing + Breakdown)
├── InputField (Expression input)
├── ButtonGrid
│   ├── MetalButtons (Scrap, Reclaimed, Refined, Key)
│   ├── OperatorButtons (+, -, *, (, ))
│   ├── NumberButtons (0-9, .)
│   ├── ActionButtons (Calculate, Clear, Backspace)
│   └── SettingsButton
├── History (Recent calculations)
└── Settings (Theme toggle, etc.)
```

### State Management

The component uses React hooks internally:

- `useState` – Manage expression tokens, result, error state
- `useEffect` – Handle keyboard events
- `useCallback` – Memoize button handlers

### Bundled Dependency

The component bundles `@tf2calc/core` internally, so you don't need to install it separately. This means:

- Calculation engine is always available
- No additional npm dependency to manage
- Works completely standalone

## Customization Examples

### Example 1: Custom Icons with Local Assets

```jsx
import TF2Calculator from '@tf2calc/react-ui'
import scrapIcon from './assets/scrap.png'
import reclaimedIcon from './assets/reclaimed.png'
import refinedIcon from './assets/refined.png'
import keyIcon from './assets/key.png'

export default function MyCalculator() {
  return (
    <TF2Calculator
      metalIcons={{
        Scrap: scrapIcon,
        Reclaimed: reclaimedIcon,
        Refined: refinedIcon,
        Key: keyIcon,
      }}
    />
  )
}
```

### Example 2: Dark Theme Support

```jsx
import TF2Calculator from '@tf2calc/react-ui'
import '@tf2calc/react-ui/styles.css'

export default function App() {
  const [theme, setTheme] = React.useState('light')

  return (
    <div className={`app theme-${theme}`}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <TF2Calculator />
    </div>
  )
}
```

With CSS:

```css
.app {
  color-scheme: light;
}

.app.theme-dark {
  color-scheme: dark;
}
```

### Example 3: Styled Wrapper

```jsx
import TF2Calculator from '@tf2calc/react-ui'
import '@tf2calc/react-ui/styles.css'
import './calculator.css'

export default function CalculatorWidget() {
  return (
    <div className="calculator-wrapper">
      <div className="calculator-card">
        <h2>Quick Price Check</h2>
        <TF2Calculator />
        <p className="calculator-footer">
          All calculations are instant and accurate to TF2 metal increments.
        </p>
      </div>
    </div>
  )
}
```

With styles:

```css
.calculator-wrapper {
  padding: 2rem;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 8px;
}

.calculator-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calculator-card h2 {
  margin-top: 0;
  color: #333;
}

.calculator-footer {
  font-size: 0.9rem;
  color: #666;
  margin-top: 1rem;
  text-align: center;
}
```

## Performance

- Initial render: ~5–15ms
- Button clicks: <1ms response (no lag)
- Expressions with 20+ tokens: <1ms evaluation
- Memory footprint: ~100KB (component + bundled core)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations

- No standalone ES5 transpiled version (React 19 requires modern browser)
- Copy/paste not yet supported in expression input
- Mobile keyboard doesn't auto-capitalize metal units
- No undo/redo within a session

## API Stability

The component API is currently stable but may receive additions:

- ✅ `metalIcons` prop is stable
- ⏳ `initialExpression` prop may be added
- ⏳ `onResult` callback may be added
- ⏳ `theme` prop may be added

All additions will be backward compatible.

## Package Contents

Inside `node_modules/@tf2calc/react-ui`:

```
dist/
  index.js          # Main component bundle
  index.css         # Compiled styles
src/
  styles.css        # Source styles (CSS variables)
  base.css          # Base styles
  assets/
    *.png           # Metal icons (Scrap, Reclaimed, Refined, Key)
package.json
README.md
```

## Reporting Issues

If you encounter issues with the component:

1. Check the browser console for error messages
2. Verify React version is 19.0.0 or higher
3. Ensure styles are imported (`import '@tf2calc/react-ui/styles.css'`)
4. Try clearing node_modules and reinstalling

## Contributing

For bug reports or feature requests, visit the [GitHub repository](https://github.com/8aratta/TF2-Calculator).
