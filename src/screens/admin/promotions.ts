// src/screens/admin/promotions.ts — #/admin/promotions (admin e gestor)
// Banners "Promoções & metas" do topo da busca: título, texto, imagem, link (campanha ou
// instituição), período e ativo. Sem nenhum ativo, a busca mostra as campanhas em destaque.
import { Spinner, showToast } from '@/components'
import { adminService, authService, institutionService, searchService } from '@/services'
import { ApiError } from '@/services/api'
import type { AdminPromotion, PromotionPayload } from '@/types'

const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-salvee-orange'
let links: { campaigns: Array<{ id: string; label: string }>; institutions: Array<{ id: string; label: string }> } = { campaigns: [], institutions: [] }

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900 flex-1">Promoções da busca</h1>
      <button id="new-btn" class="hidden px-3 py-1.5 rounded-full bg-salvee-orange text-white text-xs font-semibold">+ Nova</button>
    </div>
    <div id="promo-admin" class="p-4 pb-24 flex flex-col gap-3"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const root = document.getElementById('promo-admin')!
  root.appendChild(Spinner())

  authService.getMe().then(async user => {
    if (user.role !== 'admin' && user.role !== 'gestor') {
      root.innerHTML = '<p class="text-center text-gray-500 py-16">🔒 Área exclusiva para administradores e gestores.</p>'
      return
    }
    // opções de link: campanhas em andamento e instituições aprovadas
    const [campaigns, institutions] = await Promise.all([
      searchService.listCausas().catch(() => []),
      institutionService.list().catch(() => []),
    ])
    links = {
      campaigns: campaigns.map(c => ({ id: c.id, label: `${c.title} · ${c.institutionName}` })),
      institutions: institutions.map(i => ({ id: i.id, label: i.name })),
    }
    const newBtn = document.getElementById('new-btn')!
    newBtn.classList.remove('hidden')
    newBtn.addEventListener('click', () => openForm(null))
    loadList()
  }).catch(() => {
    root.innerHTML = '<p class="text-center text-gray-500 py-16">Não foi possível carregar.</p>'
  })
}

function loadList(): void {
  const root = document.getElementById('promo-admin')!
  root.innerHTML = ''
  const intro = document.createElement('p')
  intro.className = 'text-xs text-gray-500'
  intro.textContent = 'Os banners ativos (dentro do período) aparecem no topo da tela Buscar, na ordem abaixo. Sem nenhum ativo, aparecem as campanhas em destaque.'
  root.appendChild(intro)
  const list = document.createElement('div')
  list.className = 'flex flex-col gap-3'
  root.appendChild(list)
  list.appendChild(Spinner())
  adminService.listPromotions().then(items => {
    list.innerHTML = ''
    if (!items.length) {
      const p = document.createElement('p')
      p.className = 'text-center text-gray-400 text-sm py-10'
      p.textContent = 'Nenhuma promoção cadastrada. Toque em "+ Nova".'
      list.appendChild(p)
      return
    }
    items.forEach(p => list.appendChild(promoRow(p)))
  }).catch(() => {
    list.innerHTML = ''
    showToast('Erro ao carregar promoções', 'error')
  })
}

function promoRow(p: AdminPromotion): HTMLElement {
  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl border border-gray-100 p-3 flex gap-3'
  const thumb = document.createElement('div')
  thumb.className = 'w-20 h-20 rounded-xl bg-salvee-orange-bg flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl'
  if (p.imageUrl) {
    const img = document.createElement('img')
    img.src = p.imageUrl
    img.alt = ''
    img.className = 'w-full h-full object-cover'
    thumb.appendChild(img)
  } else {
    thumb.textContent = '📣'
  }
  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0 flex flex-col gap-0.5'
  const title = document.createElement('p')
  title.className = 'font-semibold text-gray-900 text-sm truncate'
  title.textContent = p.title
  const sub = document.createElement('p')
  sub.className = 'text-xs text-gray-500 truncate'
  sub.textContent = p.subtitle || '—'
  const meta = document.createElement('p')
  meta.className = 'text-[11px] text-gray-400'
  const period = p.startsAt || p.endsAt ? `${p.startsAt ? fmt(p.startsAt) : '…'} a ${p.endsAt ? fmt(p.endsAt) : '…'}` : 'sem período'
  const link = p.linkType === 'campaign' ? 'campanha' : p.linkType === 'institution' ? 'instituição' : 'sem link'
  meta.textContent = `${period} · ${link} · ordem ${p.sortOrder}`
  const actions = document.createElement('div')
  actions.className = 'flex gap-3 mt-1 text-xs font-semibold'
  const toggle = document.createElement('button')
  toggle.className = p.active ? 'text-green-600' : 'text-gray-400'
  toggle.textContent = p.active ? '● Ativa' : '○ Inativa'
  toggle.addEventListener('click', async () => {
    try { await adminService.updatePromotion(p.id, { active: !p.active }); loadList() } catch { showToast('Erro ao atualizar', 'error') }
  })
  const editBtn = document.createElement('button')
  editBtn.className = 'text-salvee-orange'
  editBtn.textContent = 'Editar'
  editBtn.addEventListener('click', () => openForm(p))
  const del = document.createElement('button')
  del.className = 'text-red-500'
  del.textContent = 'Excluir'
  del.addEventListener('click', async () => {
    if (del.dataset['confirm'] !== '1') { del.dataset['confirm'] = '1'; del.textContent = 'Confirmar?'; return }
    try { await adminService.deletePromotion(p.id); showToast('Promoção excluída', 'success'); loadList() } catch { showToast('Erro ao excluir', 'error') }
  })
  actions.append(toggle, editBtn, del)
  info.append(title, sub, meta, actions)
  card.append(thumb, info)
  return card
}

function fmt(ymd: string): string {
  const [y, m, d] = ymd.split('-')
  return `${d}/${m}/${y}`
}

// formulário de criar/editar (mesma tela)
function openForm(p: AdminPromotion | null): void {
  const root = document.getElementById('promo-admin')!
  root.innerHTML = ''
  let imageUrl: string | null = p?.imageUrl ?? null

  const form = document.createElement('form')
  form.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3'
  form.noValidate = true
  const label = (text: string, input: HTMLElement) => {
    const w = document.createElement('label')
    w.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'
    w.append(text, input)
    form.appendChild(w)
    return input
  }
  const input = (value: string, type = 'text', max = 0) => {
    const i = document.createElement('input')
    i.type = type
    i.value = value
    i.className = field
    if (max) i.maxLength = max
    return i
  }

  const heading = document.createElement('h2')
  heading.className = 'font-bold text-gray-900'
  heading.textContent = p ? 'Editar promoção' : 'Nova promoção'
  form.appendChild(heading)

  const title = label('Título *', input(p?.title ?? '', 'text', 80)) as HTMLInputElement
  title.placeholder = 'Ex.: Promoções & metas do dia 5'
  const subtitle = label('Texto', input(p?.subtitle ?? '', 'text', 140)) as HTMLInputElement
  subtitle.placeholder = 'Ex.: Doe hoje e ajude a bater a meta'

  // imagem
  const imgBox = document.createElement('div')
  imgBox.className = 'flex items-center gap-3'
  const preview = document.createElement('div')
  preview.className = 'w-24 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-xs text-gray-400'
  const paintImg = () => {
    preview.innerHTML = ''
    if (imageUrl) {
      const img = document.createElement('img')
      img.src = imageUrl
      img.alt = ''
      img.className = 'w-full h-full object-cover'
      preview.appendChild(img)
    } else {
      preview.textContent = 'sem imagem'
    }
  }
  paintImg()
  const file = document.createElement('input')
  file.type = 'file'
  file.accept = 'image/jpeg,image/png'
  file.className = 'text-xs'
  file.addEventListener('change', async () => {
    const f = file.files?.[0]
    if (!f) return
    try { imageUrl = await institutionService.uploadFile(f); paintImg() } catch (err) { showToast(err instanceof Error ? err.message : 'Erro no envio', 'error') }
  })
  imgBox.append(preview, file)
  label('Imagem (paisagem, até 1 MB)', imgBox)

  // link
  const linkType = document.createElement('select')
  linkType.className = field
  ;[['none', 'Sem link'], ['campaign', 'Campanha'], ['institution', 'Instituição']].forEach(([v, t]) => {
    const o = document.createElement('option'); o.value = v; o.textContent = t; linkType.appendChild(o)
  })
  linkType.value = p?.linkType ?? 'none'
  const linkId = document.createElement('select')
  linkId.className = field
  const fillLinks = () => {
    linkId.innerHTML = ''
    const opts = linkType.value === 'campaign' ? links.campaigns : linkType.value === 'institution' ? links.institutions : []
    linkId.disabled = !opts.length
    if (!opts.length) {
      const o = document.createElement('option')
      o.textContent = linkType.value === 'none' ? '—' : 'Nenhuma disponível'
      linkId.appendChild(o)
    }
    opts.forEach(x => { const o = document.createElement('option'); o.value = x.id; o.textContent = x.label; linkId.appendChild(o) })
    if (p?.linkId && opts.some(x => x.id === p.linkId)) linkId.value = p.linkId
  }
  linkType.addEventListener('change', fillLinks)
  label('Ao tocar no banner, abrir', linkType)
  label('Qual', linkId)
  fillLinks()

  const row = document.createElement('div')
  row.className = 'grid grid-cols-2 gap-2'
  const starts = input(p?.startsAt ?? '', 'date')
  const ends = input(p?.endsAt ?? '', 'date')
  const sw = document.createElement('label'); sw.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'; sw.append('Início (opcional)', starts)
  const ew = document.createElement('label'); ew.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'; ew.append('Fim (opcional)', ends)
  row.append(sw, ew)
  form.appendChild(row)
  const order = label('Ordem (menor aparece primeiro)', input(String(p?.sortOrder ?? 0), 'number')) as HTMLInputElement

  const active = document.createElement('input')
  active.type = 'checkbox'
  active.checked = p?.active ?? true
  active.className = 'accent-salvee-orange'
  const aw = document.createElement('label')
  aw.className = 'flex items-center gap-2 text-sm text-gray-700'
  aw.append(active, 'Ativa')
  form.appendChild(aw)

  const buttons = document.createElement('div')
  buttons.className = 'flex gap-2 mt-2'
  const save = document.createElement('button')
  save.type = 'submit'
  save.className = 'flex-1 py-2.5 rounded-xl bg-salvee-orange text-white text-sm font-semibold'
  save.textContent = 'Salvar'
  const cancel = document.createElement('button')
  cancel.type = 'button'
  cancel.className = 'flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold'
  cancel.textContent = 'Cancelar'
  cancel.addEventListener('click', loadList)
  buttons.append(save, cancel)
  form.appendChild(buttons)

  form.addEventListener('submit', async e => {
    e.preventDefault()
    if (!title.value.trim()) { showToast('Informe o título', 'error'); return }
    const payload: PromotionPayload = {
      title: title.value.trim(),
      subtitle: subtitle.value.trim(),
      imageUrl,
      linkType: linkType.value as PromotionPayload['linkType'],
      linkId: linkType.value === 'none' || linkId.disabled ? null : linkId.value,
      startsAt: starts.value || null,
      endsAt: ends.value || null,
      sortOrder: Number(order.value) || 0,
      active: active.checked,
    }
    if (payload.linkType !== 'none' && !payload.linkId) payload.linkType = 'none'
    save.disabled = true
    try {
      if (p) await adminService.updatePromotion(p.id, payload)
      else await adminService.createPromotion(payload)
      showToast('Promoção salva', 'success')
      loadList()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao salvar', 'error')
      save.disabled = false
    }
  })
  root.appendChild(form)
}

export function unmount(): void {
  links = { campaigns: [], institutions: [] }
}
