// src/screens/admin/gamification-settings.ts — #/admin/gamification (só admin)
// Regra de pontos configurável (spec 18.11 e 27.6): liga/desliga a pontuação, R$ por XP e por Salve,
// promoção com multiplicador e período; liga/desliga o resgate de recompensas para todos.
import { Spinner, showToast } from '@/components'
import { adminService, authService } from '@/services'
import { ApiError } from '@/services/api'
import type { GamificationSettings } from '@/types'

const field = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-salvee-orange'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Pontos e recompensas</h1>
    </div>
    <div id="cfg" class="p-4 pb-24 flex flex-col gap-4"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const root = document.getElementById('cfg')!
  root.appendChild(Spinner())
  authService.getMe().then(async user => {
    if (user.role !== 'admin') { root.innerHTML = '<p class="text-center text-gray-500 py-16">🔒 Área exclusiva para administradores.</p>'; return }
    build(root, await adminService.getGamificationSettings())
  }).catch(() => { root.innerHTML = '<p class="text-center text-gray-500 py-16">Não foi possível carregar.</p>' })
}

function section(title: string, hint: string): HTMLElement {
  const s = document.createElement('section')
  s.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3'
  const h = document.createElement('h2')
  h.className = 'font-bold text-gray-900'
  h.textContent = title
  const p = document.createElement('p')
  p.className = 'text-xs text-gray-500 -mt-2'
  p.textContent = hint
  s.append(h, p)
  return s
}

function toggle(label: string, checked: boolean): { row: HTMLElement; input: HTMLInputElement } {
  const row = document.createElement('label')
  row.className = 'flex items-center justify-between gap-3 text-sm font-medium text-gray-800 cursor-pointer'
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = checked
  input.className = 'w-5 h-5 accent-salvee-orange'
  row.append(label, input)
  return { row, input }
}

function numberField(label: string, value: number, step = '0.5', min = '0.5'): { wrap: HTMLElement; input: HTMLInputElement } {
  const wrap = document.createElement('label')
  wrap.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'
  const input = document.createElement('input')
  input.type = 'number'
  input.step = step
  input.min = min
  input.value = String(value)
  input.className = field
  input.inputMode = 'decimal'
  wrap.append(label, input)
  return { wrap, input }
}

function build(root: HTMLElement, s: GamificationSettings): void {
  root.innerHTML = ''

  // pontuação geral
  const points = section('Pontuação por doação', 'Os pontos entram quando a doação é confirmada. Desligada, doações confirmadas não geram XP nem Salves.')
  const enabled = toggle('Pontuação ativa', s.points.enabled)
  const xp = numberField('Reais para 1 XP', s.points.reaisPerXp)
  const slv = numberField('Reais para 1 Salve', s.points.reaisPerSalve)
  const example = document.createElement('p')
  example.className = 'text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2'
  points.append(enabled.row, xp.wrap, slv.wrap, example)
  root.appendChild(points)

  // promoção (ex.: Salves em dobro)
  const promo = section('Promoção de pontos', 'Multiplica os pontos das doações feitas no período (ex.: Salves em dobro no Natal). Aparece na aba Prêmios e na doação.')
  const pEnabled = toggle('Promoção ativa', s.points.promo.enabled)
  const labelWrap = document.createElement('label')
  labelWrap.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'
  const label = document.createElement('input')
  label.className = field
  label.maxLength = 80
  label.placeholder = 'Ex.: Natal Solidário'
  label.value = s.points.promo.label
  labelWrap.append('Nome da promoção', label)
  const row = document.createElement('div')
  row.className = 'grid grid-cols-2 gap-2'
  const xpMul = numberField('XP ×', s.points.promo.xpMultiplier, '0.5', '1')
  const slvMul = numberField('Salves ×', s.points.promo.salvesMultiplier, '0.5', '1')
  row.append(xpMul.wrap, slvMul.wrap)
  const dates = document.createElement('div')
  dates.className = 'grid grid-cols-2 gap-2'
  const mkDate = (text: string, v: string | null) => {
    const w = document.createElement('label')
    w.className = 'flex flex-col gap-1 text-sm font-medium text-gray-700'
    const i = document.createElement('input')
    i.type = 'date'
    i.className = field
    i.value = v ?? ''
    w.append(text, i)
    dates.appendChild(w)
    return i
  }
  const starts = mkDate('Início (opcional)', s.points.promo.startsAt)
  const ends = mkDate('Fim (opcional)', s.points.promo.endsAt)
  promo.append(pEnabled.row, labelWrap, row, dates)
  root.appendChild(promo)

  // recompensas
  const rewards = section('Recompensas e QR Code', 'Desligado, a aba Prêmios continua mostrando as recompensas, mas ninguém consegue resgatar. Cada recompensa também pode ser ativada ou desativada em "Recompensas e parceiros".')
  const rEnabled = toggle('Resgates ativos', s.rewards.enabled)
  rewards.appendChild(rEnabled.row)
  root.appendChild(rewards)

  // exemplo ao vivo: quanto R$ 100 rende com a regra atual
  const paintExample = () => {
    const r = (v: string) => Math.max(0.01, Number(v) || 1)
    const mx = pEnabled.input.checked ? Number(xpMul.input.value) || 1 : 1
    const ms = pEnabled.input.checked ? Number(slvMul.input.value) || 1 : 1
    example.textContent = enabled.input.checked
      ? `Exemplo: doação de R$ 100 = ${Math.floor((100 / r(xp.input.value)) * mx)} XP e ${Math.floor((100 / r(slv.input.value)) * ms)} Salves${pEnabled.input.checked ? ' (com a promoção, se estiver no período)' : ''}.`
      : 'Pontuação desligada: doações não geram pontos.'
  }
  ;[enabled.input, xp.input, slv.input, pEnabled.input, xpMul.input, slvMul.input].forEach(i => i.addEventListener('input', paintExample))
  paintExample()

  const save = document.createElement('button')
  save.type = 'button'
  save.className = 'w-full py-3 rounded-xl bg-salvee-orange text-white font-semibold'
  save.textContent = 'Salvar configurações'
  save.addEventListener('click', async () => {
    save.disabled = true
    try {
      const saved = await adminService.saveGamificationSettings({
        points: {
          enabled: enabled.input.checked,
          reaisPerXp: Number(xp.input.value),
          reaisPerSalve: Number(slv.input.value),
          promo: {
            enabled: pEnabled.input.checked,
            label: label.value.trim(),
            xpMultiplier: Number(xpMul.input.value),
            salvesMultiplier: Number(slvMul.input.value),
            startsAt: starts.value || null,
            endsAt: ends.value || null,
          },
        },
        rewards: { enabled: rEnabled.input.checked },
      })
      showToast('Configurações salvas', 'success')
      build(root, saved)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao salvar', 'error')
      save.disabled = false
    }
  })
  root.appendChild(save)
}
