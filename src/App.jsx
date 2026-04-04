import './App.css'
import scrapIcon from './assets/Scrap_Metal.png'
import reclaimedIcon from './assets/Reclaimed_Metal.png'
import refinedIcon from './assets/Refined_Metal.png'
import { CalculatorButtonGrid } from './components/CalculatorButtonGrid'
import { CalculatorDisplay } from './components/CalculatorDisplay'
import { CalculatorFooter } from './components/CalculatorFooter'
import { HistoryPanel } from './components/HistoryPanel'
import { SettingsControls } from './components/SettingsControls'
import { useCalculator } from './hooks/useCalculator'

const metalIcons = {
  Scrap: scrapIcon,
  Reclaimed: reclaimedIcon,
  Refined: refinedIcon,
}

function App() {
  const {
    actions,
    breakdown,
    darkMode,
    error,
    expressionTokens,
    history,
    materialValueView,
    resultText,
    setDarkMode,
    setMaterialValueView,
  } = useCalculator()

  return (
    <main className={`app-shell ${darkMode ? 'dark' : ''}`}>
      <div className="bg-layer" aria-hidden="true" />

      <section className="calculator-card">
        <header className="top-bar">
          <div>
            <p className="eyebrow">TF2 Metal Calculator</p>
            <h1>Desktop Trade Math</h1>
          </div>
          <SettingsControls
            darkMode={darkMode}
            materialValueView={materialValueView}
            setDarkMode={setDarkMode}
            setMaterialValueView={setMaterialValueView}
          />
        </header>

        <CalculatorDisplay
          error={error}
          expressionTokens={expressionTokens}
          materialValueView={materialValueView}
          metalIcons={metalIcons}
          resultText={resultText}
        />

        <CalculatorButtonGrid
          actions={actions}
          expressionTokens={expressionTokens}
          metalIcons={metalIcons}
        />

        <CalculatorFooter breakdown={breakdown} />
      </section>

      <HistoryPanel
        history={history}
        materialValueView={materialValueView}
        metalIcons={metalIcons}
      />
    </main>
  )
}

export default App
