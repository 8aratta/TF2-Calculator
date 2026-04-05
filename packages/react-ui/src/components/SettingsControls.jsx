export function SettingsControls({
  darkMode,
  materialValueView,
  setDarkMode,
  setMaterialValueView,
}) {
  return (
    <div className="settings-controls">
      <label className="settings-field">
        <span>Material View</span>
        <select
          className="settings-select"
          value={materialValueView}
          onChange={(event) => setMaterialValueView(event.target.value)}
        >
          <option value="visual">Visual</option>
          <option value="ref-value">Ref Value</option>
        </select>
      </label>
      <button
        type="button"
        className="mode-toggle"
        onClick={() => setDarkMode((prev) => !prev)}
      >
        {darkMode ? 'Light' : 'Dark'}
      </button>
    </div>
  )
}
