export interface NumericKeyboardOptions {
  onInput: (value: string) => void
}

export function NumericKeyboard(options: NumericKeyboardOptions): HTMLDivElement {
  let display = '0'

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓']

  const kb = document.createElement('div')
  kb.className = 'grid grid-cols-3 gap-2 p-4'

  keys.forEach(key => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = [
      'h-14 rounded-2xl text-xl font-medium flex items-center justify-center transition-all active:scale-95',
      key === '✓' ? 'bg-salvee-orange text-white' :
      key === '⌫' ? 'bg-gray-100 text-gray-600' :
      'bg-gray-50 text-gray-900 hover:bg-gray-100',
    ].join(' ')
    btn.textContent = key

    btn.addEventListener('click', () => {
      if (key === '⌫') {
        display = display.length > 1 ? display.slice(0, -1) : '0'
      } else if (key === '✓') {
        options.onInput(display)
        return
      } else {
        if (display === '0') {
          display = key
        } else if (display.length < 8) {
          display = display + key
        }
      }
      options.onInput(display)
    })

    kb.appendChild(btn)
  })

  return kb
}
