# @tf2calc/react-ui

Reusable React calculator component for TF2 metal expressions.

## Install

```bash
npm i @tf2calc/react-ui react react-dom
```

## Basic usage

```jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import TF2Calculator from '@tf2calc/react-ui'
import '@tf2calc/react-ui/styles.css'

createRoot(document.getElementById('root')).render(<TF2Calculator />)
```

## Named export

```jsx
import { TF2Calculator } from '@tf2calc/react-ui'
```

## Custom icons

Pass a `metalIcons` prop to override the default icon set:

```jsx
<TF2Calculator
  metalIcons={{
    Scrap: '/icons/scrap.png',
    Reclaimed: '/icons/reclaimed.png',
    Refined: '/icons/refined.png',
    Key: '/icons/key.png',
  }}
/>
```
