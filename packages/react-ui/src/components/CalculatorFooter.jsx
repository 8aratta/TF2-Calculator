export function CalculatorFooter({ breakdown }) {
  return (
    <footer className="breakdown">
      <p>
        {breakdown.negative ? '−' : ''}
        {breakdown.refined} ref / {breakdown.reclaimed} rec / {breakdown.scrap} scrap
      </p>
      <p className="hint">0-9 · . · + - × · ( ) · Enter · Backspace · Esc</p>
    </footer>
  )
}
