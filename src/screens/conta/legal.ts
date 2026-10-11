// src/screens/conta/legal.ts — #/termos e #/privacidade (públicas: as lojas de apps exigem link aberto)
import { PageHeader } from '@/components'
import { authService } from '@/services'
import { privacidade, termos, type LegalDoc } from '@/content/legal'

export function render(): HTMLElement {
  const isPrivacy = window.location.hash.startsWith('#/privacidade')
  const doc: LegalDoc = isPrivacy ? privacidade() : termos()
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.appendChild(PageHeader(doc.titulo, authService.isAuthenticated() ? '#/settings' : '#/welcome'))

  const body = document.createElement('article')
  body.className = 'p-5 pb-16 flex flex-col gap-4 text-sm leading-relaxed text-gray-700'
  const intro = document.createElement('p')
  intro.className = 'text-xs text-gray-500 bg-gray-50 rounded-xl p-3'
  intro.textContent = doc.resumo
  body.appendChild(intro)

  doc.secoes.forEach(sec => {
    const h2 = document.createElement('h2')
    h2.className = 'text-base font-semibold text-gray-900 mt-2'
    h2.textContent = sec.titulo
    body.appendChild(h2)
    sec.blocos.forEach(b => {
      if (Array.isArray(b)) {
        const ul = document.createElement('ul')
        ul.className = 'list-disc pl-5 flex flex-col gap-1.5'
        b.forEach(item => { const li = document.createElement('li'); li.textContent = item; ul.appendChild(li) })
        body.appendChild(ul)
      } else {
        const p = document.createElement('p')
        p.textContent = b
        body.appendChild(p)
      }
    })
  })

  const other = document.createElement('a')
  other.href = isPrivacy ? '#/termos' : '#/privacidade'
  other.className = 'mt-4 text-salvee-orange font-medium underline'
  other.textContent = isPrivacy ? 'Ler os Termos de uso' : 'Ler a Política de privacidade'
  body.appendChild(other)

  el.appendChild(body)
  return el
}

export function mount(): void {
  window.scrollTo(0, 0)
}
