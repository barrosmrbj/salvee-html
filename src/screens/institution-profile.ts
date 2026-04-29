export function render(params?: Record<string, string>): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-white'
  el.innerHTML = `<p class="text-gray-400 text-lg font-medium">Tela: Institution Profile (id: ${params?.id ?? '?'})</p>`
  return el
}
