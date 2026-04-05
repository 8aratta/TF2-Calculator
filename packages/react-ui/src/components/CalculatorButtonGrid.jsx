import { BUTTON_ROWS } from '../config/uiConfig.js'

export function CalculatorButtonGrid({ actions, expressionTokens, metalIcons }) {
  return (
    <div className="button-grid">
      {BUTTON_ROWS.flat().map((button) => {
        const value = button.value || button.label
        const classes = ['btn', `btn-${button.type}`]
        if (button.wide) {
          classes.push('btn-wide')
        }

        if (button.type === 'operator' && expressionTokens.at(-1) === value) {
          classes.push('active-operator')
        }

        const handleClick = () => {
          if (button.type === 'digit') actions.pushDigit(value)
          else if (button.type === 'operator') actions.pushOperator(value)
          else if (button.type === 'paren') actions.pushParen(value)
          else if (button.type === 'metal') actions.insertMetal(value)
          else if (button.type === 'equals') actions.calculate()
          else if (button.label === 'Back') actions.backspace()
          else if (button.label === 'C') actions.clearAll()
        }

        const icon = metalIcons[button.label]

        return (
          <button
            key={`${button.type}-${button.label}`}
            type="button"
            className={classes.join(' ')}
            onClick={handleClick}
            aria-label={button.type === 'metal' ? `${button.label} metal` : button.label}
            title={button.type === 'metal' ? button.label : undefined}
          >
            {button.type === 'metal' && icon ? (
              <img
                src={icon}
                alt={`${button.label} metal`}
                className="metal-icon"
              />
            ) : (
              button.label
            )}
          </button>
        )
      })}
    </div>
  )
}
