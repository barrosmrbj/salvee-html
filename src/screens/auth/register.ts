export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-white'
  el.innerHTML = '<p class="text-gray-400 text-lg font-medium">Tela: Register</p>'
  return el
}
