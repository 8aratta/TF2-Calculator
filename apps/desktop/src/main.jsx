import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TF2Calculator from '../../../packages/react-ui/src/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TF2Calculator />
  </StrictMode>,
)
