// src/screens/settings.ts
import { authService } from '@/services'

interface SettingItem {
  label: string
  icon: string
  action: () => void
  destructive?: boolean
}

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Configurações</h1>
    </div>
    <div id="settings-list" class="flex flex-col gap-2 p-4 pb-safe"></div>
    <p id="app-version" class="text-center text-xs text-gray-300 pb-4"></p>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  document.getElementById('app-version')!.textContent = 'Versão 1.0.0'

  const groups: Array<{ title?: string; items: SettingItem[] }> = [
    {
      items: [
        { label: 'Perfil', icon: '👤', action: () => { window.location.hash = '/profile' } },
        { label: 'Notificações', icon: '🔔', action: () => {} },
        { label: 'Geral', icon: '⚙️', action: () => {} },
        { label: 'Acessibilidade', icon: '♿', action: () => {} },
      ],
    },
    {
      items: [
        { label: 'Pagamentos & assinaturas', icon: '💳', action: () => {} },
        { label: 'Segurança', icon: '🔒', action: () => {} },
      ],
    },
    {
      items: [
        { label: 'Centro de ajuda', icon: '❓', action: () => {} },
        { label: 'Sobre Salvee', icon: 'ℹ️', action: () => {} },
      ],
    },
    {
      items: [
        { label: 'Sair', icon: '🚪', action: () => { authService.logout(); window.location.hash = '/welcome' }, destructive: true },
      ],
    },
  ]

  const container = document.getElementById('settings-list')!

  groups.forEach((group, gi) => {
    if (gi > 0) {
      const divider = document.createElement('div')
      divider.className = 'h-2'
      container.appendChild(divider)
    }

    const section = document.createElement('div')
    section.className = 'bg-white rounded-2xl overflow-hidden border border-gray-100'

    if (group.title) {
      const sectionTitle = document.createElement('p')
      sectionTitle.className = 'px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100'
      sectionTitle.textContent = group.title
      section.appendChild(sectionTitle)
    }

    group.items.forEach((item, ii) => {
      const btn = document.createElement('button')
      btn.className = `w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors ${item.destructive ? 'text-red-500' : 'text-gray-700'}`
      if (ii > 0) btn.className += ' border-t border-gray-50'

      const iconSpan = document.createElement('span')
      iconSpan.className = 'text-xl w-8 text-center'
      iconSpan.textContent = item.icon

      const labelSpan = document.createElement('span')
      labelSpan.className = 'flex-1 text-sm font-medium'
      labelSpan.textContent = item.label

      const chevron = document.createElement('span')
      chevron.className = 'text-gray-300'
      chevron.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>'

      btn.appendChild(iconSpan)
      btn.appendChild(labelSpan)
      if (!item.destructive) btn.appendChild(chevron)

      btn.addEventListener('click', item.action)
      section.appendChild(btn)
    })

    container.appendChild(section)
  })
}

export function unmount(): void {
  // settings screen has no persistent DOM outside its own render root
}
