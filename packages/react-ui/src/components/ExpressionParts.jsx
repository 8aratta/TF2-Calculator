import { getExpressionDisplayParts } from '@tf2calc/core'

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
          {parts.map((part) => {
            const icon = metalIcons[part.value]
            return part.type === 'metal' && icon ? (
              <span key={part.id} className="expression-metal-chip" aria-label={part.value}>
                <img
                  src={icon}
                  alt={part.value}
                  className="expression-metal-icon"
                />
              </span>
            ) : (
              <span key={part.id}>{part.value}</span>
            )
          })}
        </span>
      )}
    </p>
  )
}
