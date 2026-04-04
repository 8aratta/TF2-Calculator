import { ExpressionParts } from './ExpressionParts'

export function HistoryPanel({ history, materialValueView, metalIcons }) {
  return (
    <aside className="history-card">
      <h2>History</h2>
      {history.length === 0 ? (
        <p className="history-empty">No calculations yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((entry, index) => (
            <li key={`${entry.result}-${index}`}>
              <ExpressionParts
                expressionTokens={entry.expressionTokens}
                materialValueView={materialValueView}
                metalIcons={metalIcons}
                className="history-expression"
              />
              <strong>{entry.result}</strong>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
