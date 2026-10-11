// src/screens/admin/rewards.ts — #/admin/rewards (admin e gestor)
// Recompensas e parceiros (spec 22.1): criar, editar, ativar/desativar e excluir (só se ninguém resgatou).
import { Spinner, showToast } from '@/components'
import { adminService, authService, institutionService } from '@/services'
import { ApiError } from '@/services/api'
import type { AdminReward, RewardPayload } from '@/types'

const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-salvee-orange'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900 flex-1">Recompensas e parceiros</h1>
      <button id="new-btn" class="hidden px-3 py-1.5 rounded-full bg-salvee-orange text-white text-xs font-semibold">+ Nova</button>
    </div>
    <div id="rw-admin" class="p-4 pb-24 flex flex-col gap-3"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const root = document.getElementById('rw-admin')!
  root.appendChild(Spinner())
  authService.getMe().then(user => {
    if (user.role !== 'admin' && user.role !== 'gestor') {
      root.innerHTML = '<p class="text-center text-gray-500 py-16">🔒 Área exclusiva para administradores e gestores.</p>'
      return
    }
    const btn = document.getElementById('new-btn')!
    btn.classList.remove('hidden')
    btn.addEventListener('click', () => openForm(null))
    loadList()
  }).catch(() => { root.innerHTML = '<p class="text-center text-gray-500 py-16">Não foi possível carregar.</p>' })
}

function loadList(): void {
  const root = document.getElementById('rw-admin')!
  root.innerHTML = ''
  root.appendChild(Spinner())
  adminService.listRewards().then(items => {
    root.innerHTML = ''
    if (!items.length) {
      root.innerHTML = '<p class="text-center text-gray-400 text-sm py-10">Nenhuma recompensa cadastrada. Toque em "+ Nova".</p>'
      return
    }
    items.forEach(r => root.appendChild(row(r)))
  }).catch(() => { root.innerHTML = ''; showToast('Erro ao carregar recompensas', 'error') })
}

function row(r: AdminReward): HTMLElement {
  const card = document.createElement('div')
  card.className = `bg-white rounded-2xl border border-gray-100 p-3 flex gap-3 ${r.active ? '' : 'opacity-60'}`
  const logo = document.createElement('div')
  logo.className = 'w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-2xl flex-shrink-0'
  if (r.partnerLogoUrl) {
    const img = document.createElement('img'); img.src = r.partnerLogoUrl; img.alt = ''; img.className = 'w-full h-full object-cover'; logo.appendChild(img)
  } else logo.textContent = '🎁'
  const info = document.createElement('div')
  info.className = 'flex-1 min-w-0 flex flex-col gap-0.5'
  const t = document.createElement('p'); t.className = 'font-semibold text-gray-900 text-sm truncate'; t.textContent = r.title
  const p = document.createElement('p'); p.className = 'text-xs text-gray-500 truncate'; p.textContent = [r.partnerName, r.rewardType].filter(Boolean).join(' · ') || '—'
  const m = document.createElement('p'); m.className = 'text-[0.6875rem] text-gray-400'
  m.textContent = `${r.cost} Salves${r.minLevel ? ` · nível ${r.minLevel}+` : ''}${r.validUntil ? ` · até ${r.validUntil.split('-').reverse().join('/')}` : ''} · ${r.redeemed} resgate(s)`
  const actions = document.createElement('div')
  actions.className = 'flex gap-3 mt-1 text-xs font-semibold'
  const tog = document.createElement('button')
  tog.className = r.active ? 'text-green-600' : 'text-gray-400'
  tog.textContent = r.active ? '● Ativa' : '○ Inativa'
  tog.addEventListener('click', async () => {
    try { await adminService.updateReward(r.id, { active: !r.active }); loadList() } catch { showToast('Erro ao atualizar', 'error') }
  })
  const ed = document.createElement('button'); ed.className = 'text-salvee-orange'; ed.textContent = 'Editar'; ed.addEventListener('click', () => openForm(r))
  const del = document.createElement('button'); del.className = 'text-red-500'; del.textContent = 'Excluir'
  del.addEventListener('click', async () => {
    if (del.dataset['confirm'] !== '1') { del.dataset['confirm'] = '1'; del.textContent = 'Confirmar?'; return }
    try { await adminService.deleteReward(r.id); showToast('Recompensa excluída', 'success'); loadList() } catch (err) { showToast(err instanceof ApiError ? err.message : 'Erro ao excluir', 'error') }
  })
  actions.append(tog, ed, del)
  info.append(t, p, m, actions)
  card.append(logo, info)
  return card
}

function openForm(r: AdminReward | null): void {
  const root = document.getElementById('rw-admin')!
  root.innerHTML = ''
  let logoUrl: string | null = r?.partnerLogoUrl ?? null
  const form = document.createElement('form')
  form.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3'
  form.noValidate = true
  const h = document.createElement('h2'); h.className = 'font-bold text-gray-900'; h.textContent = r ? 'Editar recompensa' : 'Nova recompensa'
  form.appendChild(h)
  const add = (label: string, el: HTMLElement) => {
    const w = document.createElement('label'); w.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'; w.append(label, el); form.appendChild(w); return el
  }
  const input = (v: string, type = 'text', max = 0) => { const i = document.createElement('input'); i.type = type; i.value = v; i.className = field; if (max) i.maxLength = max; return i }
  const title = add('Nome da recompensa *', input(r?.title ?? '', 'text', 120)) as HTMLInputElement
  title.placeholder = 'Ex.: Café grátis'
  const description = add('Descrição curta', input(r?.description ?? '', 'text', 500)) as HTMLInputElement
  const partner = add('Parceiro / local', input(r?.partnerName ?? '', 'text', 120)) as HTMLInputElement
  const type = add('Tipo', input(r?.rewardType ?? '', 'text', 60)) as HTMLInputElement
  type.placeholder = 'Ex.: Desconto, Brinde, Serviço'
  const cost = add('Custo em Salves *', input(String(r?.cost ?? ''), 'number')) as HTMLInputElement
  cost.min = '1'
  const minLevel = add('Nível mínimo (0 = qualquer)', input(String(r?.minLevel ?? 0), 'number')) as HTMLInputElement
  minLevel.min = '0'
  const valid = add('Validade (opcional)', input(r?.validUntil ?? '', 'date')) as HTMLInputElement

  const logoBox = document.createElement('div')
  logoBox.className = 'flex items-center gap-3'
  const preview = document.createElement('div')
  preview.className = 'w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-xl'
  const paint = () => { preview.innerHTML = ''; if (logoUrl) { const i = document.createElement('img'); i.src = logoUrl; i.alt = ''; i.className = 'w-full h-full object-cover'; preview.appendChild(i) } else preview.textContent = '🎁' }
  paint()
  const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/jpeg,image/png'; file.className = 'text-xs'
  file.addEventListener('change', async () => {
    const f = file.files?.[0]; if (!f) return
    try { logoUrl = await institutionService.uploadFile(f); paint() } catch (err) { showToast(err instanceof Error ? err.message : 'Erro no envio', 'error') }
  })
  logoBox.append(preview, file)
  add('Logo do parceiro', logoBox)

  const active = document.createElement('input'); active.type = 'checkbox'; active.checked = r?.active ?? true; active.className = 'w-5 h-5 accent-salvee-orange'
  const aw = document.createElement('label'); aw.className = 'flex items-center gap-2 text-sm text-gray-700'; aw.append(active, 'Ativa (aparece em Disponíveis)')
  form.appendChild(aw)

  const buttons = document.createElement('div'); buttons.className = 'flex gap-2 mt-2'
  const save = document.createElement('button'); save.type = 'submit'; save.className = 'flex-1 py-2.5 rounded-xl bg-salvee-orange text-white text-sm font-semibold'; save.textContent = 'Salvar'
  const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold'; cancel.textContent = 'Cancelar'
  cancel.addEventListener('click', loadList)
  buttons.append(save, cancel)
  form.appendChild(buttons)

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const payload: RewardPayload = {
      title: title.value.trim(), description: description.value.trim(), partnerName: partner.value.trim(),
      rewardType: type.value.trim(), cost: Number(cost.value), minLevel: Number(minLevel.value) || 0,
      validUntil: valid.value || null, partnerLogoUrl: logoUrl, active: active.checked,
    }
    if (!payload.title) { showToast('Informe o nome', 'error'); return }
    if (!Number.isInteger(payload.cost) || (payload.cost ?? 0) <= 0) { showToast('Custo em Salves: número inteiro maior que zero', 'error'); return }
    save.disabled = true
    try {
      if (r) await adminService.updateReward(r.id, payload)
      else await adminService.createReward(payload)
      showToast('Recompensa salva', 'success')
      loadList()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao salvar', 'error')
      save.disabled = false
    }
  })
  root.appendChild(form)
}
