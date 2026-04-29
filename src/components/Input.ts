export interface InputOptions {
  id: string
  label: string
  type?: string
  placeholder?: string
  value?: string
  error?: string
  required?: boolean
  onInput?: (value: string) => void
}

export function Input(options: InputOptions): HTMLDivElement {
  const { id, label, type = 'text', placeholder = '', value = '', error, required, onInput } = options

  const wrapper = document.createElement('div')
  wrapper.className = 'flex flex-col gap-1'

  wrapper.innerHTML = `
    <label for="${id}" class="text-sm font-medium text-gray-700">
      ${label}${required ? ' <span class="text-red-500">*</span>' : ''}
    </label>
    <input
      id="${id}"
      type="${type}"
      placeholder="${placeholder}"
      value="${value}"
      class="w-full px-4 py-3 rounded-xl border ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} text-gray-900 text-base outline-none focus:border-salvee-orange transition-colors"
    />
  `

  if (error) {
    const errorEl = document.createElement('span')
    errorEl.className = 'text-xs text-red-500'
    errorEl.textContent = error  // safe: textContent never interprets HTML
    wrapper.appendChild(errorEl)
  }

  if (onInput) {
    const input = wrapper.querySelector('input')!
    input.addEventListener('input', () => onInput(input.value))
  }

  return wrapper
}

export function getInputValue(container: HTMLElement, id: string): string {
  return (container.querySelector(`#${id}`) as HTMLInputElement)?.value ?? ''
}
