// src/screens/campaign.ts — #/campanha/:id: tela focada na campanha (spec 15.4), caminho rápido para doar.
// Título, imagens, instituição, meta e progresso, prazo, descrição e o botão Doar fixo embaixo.
import { Avatar, Button, ProgressBar, Spinner, VerifiedBadge } from '@/components'
import { feedService } from '@/services'
import { ApiError } from '@/services/api'
import type { Post } from '@/types'

let campaignId = ''

export function render(params?: Record<string, string>): HTMLElement {
  campaignId = params?.id ?? ''
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Campanha</h1>
    </div>
    <div id="campaign" class="pb-32"></div>
    <div id="campaign-footer" class="hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app p-4 pb-safe bg-white border-t border-gray-100"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const root = document.getElementById('campaign')!
  const loading = document.createElement('div')
  loading.className = 'flex justify-center py-16'
  loading.appendChild(Spinner())
  root.appendChild(loading)

  feedService.getPostById(campaignId).then(post => {
    root.innerHTML = ''
    // não é campanha: mostra o detalhe comum
    if (post.type !== 'campaign') { window.location.replace(`#/post/${post.id}`); return }
    renderCampaign(root, post)
  }).catch(err => {
    root.innerHTML = ''
    const p = document.createElement('p')
    p.className = 'text-center text-gray-400 text-sm py-16 px-4'
    p.textContent = err instanceof ApiError && err.status === 404 ? 'Esta campanha não está mais disponível.' : 'Não foi possível carregar a campanha.'
    root.appendChild(p)
  })
}

function renderCampaign(root: HTMLElement, post: Post): void {
  const images = post.images?.length ? post.images : (post.imageUrl ? [post.imageUrl] : [])
  if (images.length) {
    const strip = document.createElement('div')
    strip.className = 'flex overflow-x-auto snap-x snap-mandatory scrollbar-hide'
    images.forEach(src => {
      const img = document.createElement('img')
      img.src = src
      img.alt = ''
      img.className = 'w-full h-60 object-cover flex-shrink-0 snap-center bg-gray-100'
      strip.appendChild(img)
    })
    root.appendChild(strip)
  }

  const body = document.createElement('div')
  body.className = 'p-4 flex flex-col gap-4'

  const tag = document.createElement('span')
  tag.className = 'self-start text-[11px] font-semibold px-2 py-0.5 rounded-full bg-salvee-orange-bg text-salvee-orange'
  tag.textContent = '🎯 Campanha'
  const title = document.createElement('h2')
  title.className = 'text-2xl font-bold text-gray-900 leading-tight'
  title.textContent = post.title || 'Campanha'
  body.append(tag, title)

  // instituição responsável → perfil
  const who = document.createElement('button')
  who.type = 'button'
  who.className = 'flex items-center gap-2 text-left'
  who.appendChild(Avatar(post.institutionName, post.institutionLogoUrl, 'sm'))
  const name = document.createElement('span')
  name.className = 'text-sm font-semibold text-gray-700'
  name.textContent = post.institutionName
  who.appendChild(name)
  if (post.institutionVerified) who.appendChild(VerifiedBadge())
  who.addEventListener('click', () => { window.location.hash = `/institution/${post.institutionId}` })
  body.appendChild(who)

  // meta e progresso (spec 15.3 e 27.3)
  const goal = post.campaignGoal ?? 0
  const current = post.campaignCurrent ?? 0
  const box = document.createElement('div')
  box.className = 'bg-gray-50 rounded-2xl p-4 flex flex-col gap-3'
  const raised = document.createElement('p')
  raised.className = 'text-gray-600 text-sm'
  const strong = document.createElement('span')
  strong.className = 'block text-3xl font-bold text-salvee-orange'
  strong.textContent = `R$ ${current.toLocaleString('pt-BR')}`
  raised.appendChild(strong)
  raised.append(`arrecadados de R$ ${goal.toLocaleString('pt-BR')}`)
  box.appendChild(raised)
  if (goal > 0) box.appendChild(ProgressBar(current, goal, false))

  const stats = document.createElement('div')
  stats.className = 'grid grid-cols-2 gap-2 text-center'
  const stat = (value: string, label: string) => {
    const s = document.createElement('div')
    s.className = 'bg-white rounded-xl py-2'
    const v = document.createElement('p')
    v.className = 'font-bold text-gray-900'
    v.textContent = value
    const l = document.createElement('p')
    l.className = 'text-[11px] text-gray-500'
    l.textContent = label
    s.append(v, l)
    stats.appendChild(s)
  }
  const n = post.campaignDonations ?? 0
  stat(String(n), n === 1 ? 'doação confirmada' : 'doações confirmadas')
  stat(deadlineText(post.campaignDeadline), post.campaignDeadline ? `prazo: ${formatDate(post.campaignDeadline)}` : 'prazo')
  box.appendChild(stats)
  body.appendChild(box)

  const desc = document.createElement('p')
  desc.className = 'text-sm text-gray-700 leading-relaxed whitespace-pre-line'
  desc.textContent = post.content
  body.appendChild(desc)

  // comentários ficam no detalhe da publicação
  const comments = document.createElement('button')
  comments.type = 'button'
  comments.className = 'self-start text-sm font-semibold text-salvee-orange'
  const c = post.commentCount ?? 0
  comments.textContent = c ? `Ver ${c} ${c === 1 ? 'comentário' : 'comentários'}` : 'Comentar'
  comments.addEventListener('click', () => { window.location.hash = `/post/${post.id}` })
  body.appendChild(comments)
  root.appendChild(body)

  const footer = document.getElementById('campaign-footer')!
  footer.classList.remove('hidden')
  footer.appendChild(Button({
    label: 'Doar para esta campanha',
    variant: 'primary',
    fullWidth: true,
    onClick: () => { window.location.hash = `/donate/${post.institutionId}?campanha=${encodeURIComponent(post.id)}` },
  }))
}

// "faltam 12 dias", "último dia", "encerrada" ou "sem prazo"
function deadlineText(ymd?: string | null): string {
  if (!ymd) return 'Sem prazo'
  const [y, m, d] = ymd.split('-').map(Number)
  const end = new Date(y, m - 1, d, 23, 59, 59)
  const days = Math.ceil((end.getTime() - Date.now()) / 86400000)
  if (days < 1) return end.getTime() >= Date.now() ? 'Último dia' : 'Encerrada'
  return days === 1 ? 'Falta 1 dia' : `Faltam ${days} dias`
}

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

export function unmount(): void {
  campaignId = ''
}
