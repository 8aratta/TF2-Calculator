import { getExpressionDisplayParts } from '../lib/calculatorEngine'

export function ExpressionParts({
  expressionTokens,
  materialValueView,
  metalIcons,
  emptyText,
  className = 'expression',
}) {
  const parts = getExpressionDisplayParts(expressionTokens, materialValueView)

  return (
    <p className={className} title={parts.length === 0 ? 'No expression' : undefined}>
      {parts.length === 0 ? (
        emptyText
      ) : (
        <span className="expression-parts">
          {parts.map((part) =>
            part.type === 'metal' ? (
              <span key={part.id} className="expression-metal-chip" aria-label={part.value}>
                <img
                  src={metalIcons[part.value]}
                  alt={part.value}
                  className="expression-metal-icon"
                />
              </span>
            ) : (
              <span key={part.id}>{part.value}</span>
            ),
          )}
        </span>
      )}
    </p>
  )
}
