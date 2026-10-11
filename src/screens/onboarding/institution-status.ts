// src/screens/onboarding/institution-status.ts — #/institution-status (spec 9.4 e 10)
// Situação de cada instituição pela qual o usuário é responsável: em análise, correção necessária,
// não aprovada ou aprovada. Aparece depois do login enquanto alguma não estiver aprovada e pelo
// atalho em Configurações. Não bloqueia o resto do app: a pessoa também usa o Salvee como doadora.
import { Button, Spinner } from '@/components'
import { institutionService } from '@/services'
import type { MyInstitution } from '@/types'

const STATUS = {
  draft: {
    icon: '📝', title: 'Cadastro não concluído', badge: 'bg-gray-100 text-gray-600',
    text: 'O cadastro foi começado, mas ainda não foi enviado. A equipe do Salvee só analisa depois que você toca em "Enviar para análise" na última etapa.',
  },
  pending: {
    icon: '⏳', title: 'Em análise', badge: 'bg-amber-50 text-amber-700',
    text: 'A equipe do Salvee está analisando o cadastro. Enquanto isso, a instituição não aparece na busca nem no feed e ainda não pode publicar nem receber doações. Volte aqui para acompanhar a análise.',
  },
  needs_revision: {
    icon: '✏️', title: 'Correção necessária', badge: 'bg-blue-50 text-blue-700',
    text: 'A equipe pediu ajustes no cadastro. Corrija os pontos abaixo e envie de novo para análise.',
  },
  rejected: {
    icon: '❌', title: 'Não aprovada', badge: 'bg-red-50 text-red-600',
    text: 'O cadastro não foi aprovado. Se a situação mudou ou você tem novas informações, faça um novo cadastro com os dados atualizados.',
  },
  approved: {
    icon: '✅', title: 'Aprovada', badge: 'bg-green-50 text-green-700',
    text: 'A instituição está ativa: aparece no Salvee e pode publicar posts, eventos e campanhas pelo botão "+" do feed.',
  },
} as const

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Minha instituição</h1>
    </div>
    <div id="status-list" class="flex flex-col gap-4 p-4"></div>
    <div id="status-footer" class="px-4 pb-8"></div>
  `
  return el
}

export function mount(): void {
  // veio direto do login (sem histórico no app): voltar leva ao feed
  document.getElementById('back-btn')!.addEventListener('click', () => {
    if (history.length > 1) history.back()
    else window.location.hash = '/feed'
  })
  const list = document.getElementById('status-list')!
  list.appendChild(Spinner())

  institutionService.listMine().then(mine => {
    list.innerHTML = ''
    if (!mine.length) {
      const p = document.createElement('p')
      p.className = 'text-center text-gray-500 text-sm py-12'
      p.textContent = 'Você ainda não cadastrou nenhuma instituição.'
      list.appendChild(p)
      addFooterButton('Cadastrar instituição', 'primary', '/register/institution')
      return
    }
    // as que precisam de ação primeiro
    const order = { draft: 0, needs_revision: 1, pending: 2, rejected: 3, approved: 4 }
    mine.sort((a, b) => order[a.status] - order[b.status]).forEach(i => list.appendChild(card(i)))
    addFooterButton('Continuar para o Salvee', 'secondary', '/feed')
  }).catch(() => {
    list.innerHTML = ''
    const p = document.createElement('p')
    p.className = 'text-center text-gray-500 text-sm py-12'
    p.textContent = 'Não foi possível carregar a situação da instituição. Tente novamente.'
    list.appendChild(p)
    addFooterButton('Ir para o feed', 'secondary', '/feed')
  })
}

function addFooterButton(label: string, variant: 'primary' | 'secondary', hash: string): void {
  document.getElementById('status-footer')!.appendChild(
    Button({ label, variant, fullWidth: true, onClick: () => { window.location.hash = hash } })
  )
}

function card(inst: MyInstitution): HTMLElement {
  const s = STATUS[inst.status]
  const el = document.createElement('article')
  el.className = 'bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3'

  const head = document.createElement('div')
  head.className = 'flex items-center gap-3'
  const icon = document.createElement('div')
  icon.className = 'w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0'
  icon.textContent = s.icon
  const names = document.createElement('div')
  names.className = 'min-w-0'
  const name = document.createElement('p')
  name.className = 'font-bold text-gray-900 truncate'
  name.textContent = inst.name
  const badge = document.createElement('span')
  badge.className = `inline-block mt-1 text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full ${s.badge}`
  badge.textContent = s.title
  names.append(name, badge)
  head.append(icon, names)
  el.appendChild(head)

  const text = document.createElement('p')
  text.className = 'text-sm text-gray-600 leading-relaxed'
  text.textContent = s.text
  el.appendChild(text)

  // o que corrigir / motivo: cada linha vira um item (spec 10.2 "listar pontos a corrigir")
  if (inst.rejectionReason && (inst.status === 'needs_revision' || inst.status === 'rejected')) {
    const box = document.createElement('div')
    box.className = `rounded-xl px-4 py-3 ${inst.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'}`
    const title = document.createElement('p')
    title.className = 'text-xs font-semibold text-gray-700 mb-1'
    title.textContent = inst.status === 'rejected' ? 'Motivo informado pela equipe' : 'O que corrigir'
    const ul = document.createElement('ul')
    ul.className = 'list-disc pl-5 text-sm text-gray-700 flex flex-col gap-0.5'
    inst.rejectionReason.split(/\r?\n/).map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).forEach(line => {
      const li = document.createElement('li')
      li.textContent = line
      ul.appendChild(li)
    })
    box.append(title, ul)
    el.appendChild(box)
  }

  const when = document.createElement('p')
  when.className = 'text-xs text-gray-400'
  const date = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  when.textContent = inst.status === 'pending' ? `Enviado em ${date(inst.updatedAt || inst.createdAt)}`
    : inst.status === 'draft' ? `Começado em ${date(inst.createdAt)}` : `Atualizado em ${date(inst.updatedAt || inst.createdAt)}`
  el.appendChild(when)

  if (inst.status === 'draft') {
    el.appendChild(Button({ label: 'Continuar cadastro', variant: 'primary', fullWidth: true,
      onClick: () => { window.location.hash = `/register/institution?corrigir=${encodeURIComponent(inst.id)}` } }))
  } else if (inst.status === 'needs_revision') {
    el.appendChild(Button({ label: 'Corrigir cadastro', variant: 'primary', fullWidth: true,
      onClick: () => { window.location.hash = `/register/institution?corrigir=${encodeURIComponent(inst.id)}` } }))
  } else if (inst.status === 'rejected') {
    el.appendChild(Button({ label: 'Fazer novo cadastro', variant: 'secondary', fullWidth: true,
      onClick: () => { window.location.hash = '/register/institution' } }))
  } else if (inst.status === 'approved') {
    el.appendChild(Button({ label: 'Ver perfil público', variant: 'secondary', fullWidth: true,
      onClick: () => { window.location.hash = `/institution/${inst.id}` } }))
    // aprovada continua gerenciando dados e fotos do perfil (spec 13.3 e 23.2)
    el.appendChild(Button({ label: 'Editar dados e fotos', variant: 'ghost', fullWidth: true,
      onClick: () => { window.location.hash = `/register/institution?corrigir=${encodeURIComponent(inst.id)}` } }))
  }
  return el
}
