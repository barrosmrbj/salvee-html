// Cabeçalho padrão das telas internas: botão voltar + título.
// Tela aberta direto pelo link (ex.: Termos numa aba nova) não tem para onde voltar: vai para `fallback`.
export function PageHeader(title: string, fallback = '#/settings'): HTMLElement {
  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30'
  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'w-10 h-10 flex items-center justify-center text-gray-600'
  back.setAttribute('aria-label', 'Voltar')
  back.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>'
  back.addEventListener('click', () => {
    if (history.length > 1) history.back()
    else window.location.hash = fallback
  })
  const h1 = document.createElement('h1')
  h1.className = 'text-lg font-semibold text-gray-900'
  h1.textContent = title
  header.append(back, h1)
  return header
}
