export const METAL_SCRAP = {
  Scrap: 1,
  Reclaimed: 3,
  Refined: 9,
}

export const METAL_DISPLAY_VALUE = {
  Scrap: '0.11',
  Reclaimed: '0.33',
  Refined: '1.00',
}

export const BUTTON_ROWS = [
  [
    { label: 'Scrap', type: 'metal' },
    { label: 'Reclaimed', type: 'metal' },
    { label: 'Refined', type: 'metal' },
    { label: 'C', type: 'action' },
  ],
  [
    { label: '(', type: 'paren', value: '(' },
    { label: ')', type: 'paren', value: ')' },
    { label: 'Back', type: 'action' },
    { label: '.', type: 'digit' },
  ],
  [
    { label: '7', type: 'digit' },
    { label: '8', type: 'digit' },
    { label: '9', type: 'digit' },
    { label: '×', type: 'operator', value: '*' },
  ],
  [
    { label: '4', type: 'digit' },
    { label: '5', type: 'digit' },
    { label: '6', type: 'digit' },
    { label: '−', type: 'operator', value: '-' },
  ],
  [
    { label: '1', type: 'digit' },
    { label: '2', type: 'digit' },
    { label: '3', type: 'digit' },
    { label: '+', type: 'operator', value: '+' },
  ],
  [
    { label: '0', type: 'digit' },
    { label: '=', type: 'equals', wide: true },
  ],
]
