// src/screens/admin/validate-reward.ts — #/admin/validate (admin e gestor)
// Validar o QR Code de uma recompensa no local parceiro (spec 18.9): lê pela câmera (onde o navegador
// tem leitor de QR) ou digita o código; mostra de quem é e confirma o uso. Uso único.
import { Spinner, showToast } from '@/components'
import { adminService, authService } from '@/services'
import type { ValidatedReward } from '@/types'

type Detector = { detect: (src: CanvasImageSource) => Promise<Array<{ rawValue: string }>> }
let stream: MediaStream | null = null
let scanning = false

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.innerHTML = `
    <div class="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      <button id="back-btn" class="w-10 h-10 flex items-center justify-center text-gray-600" aria-label="Voltar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      </button>
      <h1 class="text-lg font-semibold text-gray-900">Validar recompensa</h1>
    </div>
    <div id="val" class="p-4 pb-24 flex flex-col gap-4"></div>
  `
  return el
}

export function mount(): void {
  document.getElementById('back-btn')!.addEventListener('click', () => history.back())
  const root = document.getElementById('val')!
  root.appendChild(Spinner())
  authService.getMe().then(user => {
    if (user.role !== 'admin' && user.role !== 'gestor') {
      root.innerHTML = '<p class="text-center text-gray-500 py-16">🔒 Área exclusiva para administradores e gestores.</p>'
      return
    }
    build(root)
  }).catch(() => { root.innerHTML = '<p class="text-center text-gray-500 py-16">Não foi possível carregar.</p>' })
}

function build(root: HTMLElement): void {
  root.innerHTML = ''
  const box = document.createElement('div')
  box.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3'
  const video = document.createElement('video')
  video.className = 'hidden w-full rounded-xl bg-black aspect-square object-cover'
  video.setAttribute('playsinline', '')
  video.muted = true
  const camBtn = document.createElement('button')
  camBtn.type = 'button'
  camBtn.className = 'w-full py-3 rounded-xl bg-salvee-orange text-white font-semibold'
  camBtn.textContent = '📷 Ler QR Code com a câmera'
  const form = document.createElement('form')
  form.className = 'flex gap-2'
  const input = document.createElement('input')
  input.className = 'flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono uppercase outline-none focus:border-salvee-orange'
  input.placeholder = 'Ou digite o código (SLV-…)'
  input.autocapitalize = 'characters'
  const go = document.createElement('button')
  go.type = 'submit'
  go.className = 'px-4 rounded-xl border border-gray-200 text-sm font-semibold'
  go.textContent = 'Buscar'
  form.append(input, go)
  const result = document.createElement('div')
  box.append(video, camBtn, form)
  root.append(box, result)

  const detectorCtor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector
  if (!detectorCtor) {
    camBtn.textContent = '📷 Câmera indisponível neste navegador: digite o código'
    camBtn.disabled = true
    camBtn.className = 'w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm'
  }

  form.addEventListener('submit', e => { e.preventDefault(); void lookup(input.value, result) })
  camBtn.addEventListener('click', async () => {
    if (!detectorCtor) return
    if (scanning) { stopCamera(video, camBtn); return }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      video.srcObject = stream
      video.classList.remove('hidden')
      await video.play()
      scanning = true
      camBtn.textContent = 'Parar câmera'
      const detector = new detectorCtor({ formats: ['qr_code'] })
      const tick = async () => {
        if (!scanning) return
        try {
          const codes = await detector.detect(video)
          if (codes[0]?.rawValue) {
            stopCamera(video, camBtn)
            input.value = codes[0].rawValue
            void lookup(codes[0].rawValue, result)
            return
          }
        } catch { /* quadro sem QR */ }
        requestAnimationFrame(() => void tick())
      }
      void tick()
    } catch {
      showToast('Não foi possível abrir a câmera. Digite o código.', 'error')
    }
  })
}

function stopCamera(video: HTMLVideoElement, btn: HTMLButtonElement): void {
  scanning = false
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  video.classList.add('hidden')
  btn.textContent = '📷 Ler QR Code com a câmera'
}

async function lookup(code: string, result: HTMLElement): Promise<void> {
  const c = code.trim().toUpperCase()
  if (!c) return
  result.innerHTML = ''
  result.appendChild(Spinner())
  const r = await adminService.validateReward(c, false)
  showResult(result, c, r)
}

// justUsed: o uso acabou de ser confirmado aqui (status já vem 'used', mas é sucesso)
function showResult(result: HTMLElement, code: string, r: { ok: boolean; reward?: ValidatedReward; error?: string }, justUsed = false): void {
  result.innerHTML = ''
  const card = document.createElement('div')
  const ok = justUsed || (r.ok && r.reward?.status === 'available')
  card.className = `rounded-2xl p-4 flex flex-col gap-2 border ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`
  const head = document.createElement('p')
  head.className = `font-bold ${ok ? 'text-green-700' : 'text-red-600'}`
  head.textContent = justUsed ? '✅ Uso confirmado: recompensa marcada como usada' : ok ? '✅ Recompensa válida' : `⛔ ${r.error || 'Recompensa inválida'}`
  card.appendChild(head)
  if (r.reward) {
    const rw = r.reward
    const lines = [
      ['Recompensa', rw.title], ['Parceiro', rw.partnerName || '—'], ['Pessoa', `${rw.userName || '—'}${rw.userEmail ? ` (${rw.userEmail})` : ''}`],
      ['Código', rw.code], ['Validade', rw.expiresAt ? rw.expiresAt.split('-').reverse().join('/') : 'sem validade'],
    ]
    if (rw.usedAt) lines.push(['Usada em', new Date(rw.usedAt).toLocaleString('pt-BR')])
    lines.forEach(([k, v]) => {
      const p = document.createElement('p')
      p.className = 'text-sm text-gray-700'
      const b = document.createElement('b'); b.textContent = `${k}: `
      p.append(b, v)
      card.appendChild(p)
    })
  }
  if (ok && !justUsed) {
    const use = document.createElement('button')
    use.type = 'button'
    use.className = 'mt-2 w-full py-3 rounded-xl bg-green-600 text-white font-semibold'
    use.textContent = 'Confirmar uso (não dá para desfazer)'
    use.addEventListener('click', async () => {
      use.disabled = true
      const res = await adminService.validateReward(code, true)
      if (res.ok) showToast('Recompensa marcada como usada', 'success')
      showResult(result, code, res.ok ? res : { ...res, reward: r.reward }, res.ok)
    })
    card.appendChild(use)
  }
  result.appendChild(card)
}

export function unmount(): void {
  scanning = false
  stream?.getTracks().forEach(t => t.stop())
  stream = null
}
