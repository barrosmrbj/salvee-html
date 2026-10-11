type NavItem = { icon: string; label: string; hash: string }

const NAV_ITEMS: NavItem[] = [
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    label: 'Feed',
    hash: '#/feed',
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    label: 'Buscar',
    hash: '#/search',
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    label: 'Agenda',
    hash: '#/calendar',
  },
  {
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    label: 'Perfil',
    hash: '#/profile',
  },
]

export function BottomNav(): HTMLElement {
  const nav = document.createElement('nav')
  nav.id = 'bottom-nav'
  // celular/tablet: barra fixa embaixo; computador (>= 1024px): menu lateral à esquerda (global.css, #bottom-nav)
  nav.className = 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-100 flex items-center justify-around pb-safe z-40'
  nav.setAttribute('aria-label', 'Navegação principal')

  // logo só aparece no menu lateral do computador
  const logo = document.createElement('a')
  logo.href = '#/feed'
  logo.className = 'nav-logo hidden items-center gap-2 px-3 pb-4 mb-2 border-b border-gray-200 w-full'
  logo.innerHTML = '<img src="/icons/icon-192.png" alt="" class="w-8 h-8 rounded-lg" /><span class="text-lg font-bold text-salvee-orange">Salvee</span>'
  nav.appendChild(logo)

  NAV_ITEMS.forEach(item => {
    const btn = document.createElement('button')
    const isActive = window.location.hash === item.hash
    btn.className = `flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${isActive ? 'text-salvee-orange' : 'text-gray-400'}`
    if (isActive) btn.setAttribute('aria-current', 'page')
    btn.innerHTML = `${item.icon}<span class="text-[0.625rem] font-medium">${item.label}</span>`
    btn.addEventListener('click', () => { window.location.hash = item.hash })
    nav.appendChild(btn)
  })

  return nav
}
