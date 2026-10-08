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

  if (type === 'password') addPasswordToggle(wrapper.querySelector('input')!)

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

const EYE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
const EYE_OFF = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>'

// botão de olho dentro do campo de senha: mostra/oculta o que foi digitado
function addPasswordToggle(input: HTMLInputElement): void {
  const box = document.createElement('div')
  box.className = 'relative'
  input.replaceWith(box)
  box.appendChild(input)
  input.classList.add('pr-12')

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-gray-600'
  const sync = () => {
    const visible = input.type === 'text'
    btn.innerHTML = visible ? EYE_OFF : EYE
    btn.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha')
    btn.title = visible ? 'Ocultar senha' : 'Mostrar senha'
  }
  btn.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password'
    sync()
    input.focus()
  })
  sync()
  box.appendChild(btn)
}

export function getInputValue(container: HTMLElement, id: string): string {
  return (container.querySelector(`#${id}`) as HTMLInputElement)?.value ?? ''
}
