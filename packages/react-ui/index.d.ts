import type { FC } from 'react'

export interface TF2CalculatorProps {
  metalIcons?: Record<string, string>
}

declare const TF2Calculator: FC<TF2CalculatorProps>

export { TF2Calculator }
export default TF2Calculator