import { ExpressionParts } from './ExpressionParts.jsx'

export function CalculatorDisplay({
  error,
  expressionTokens,
  materialValueView,
  metalIcons,
  resultText,
}) {
  return (
    <div className="display">
      <ExpressionParts
        expressionTokens={expressionTokens}
        materialValueView={materialValueView}
        metalIcons={metalIcons}
        emptyText="Start with a number or metal button"
      />
      <p className="result">{resultText}</p>
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  )
}
