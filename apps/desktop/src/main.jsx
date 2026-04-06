import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TF2Calculator from '@tf2calc/react-ui'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TF2Calculator />
  </StrictMode>,
)
