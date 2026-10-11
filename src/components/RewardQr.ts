// QR Code de uma recompensa resgatada (spec 18.8 e 18.9): mostrado no local parceiro, que valida e
// marca como usada. O código também aparece em texto, para digitar se a câmera não ler.
import { BottomSheet } from './BottomSheet'
import type { MyReward } from '@/types'

const STATUS_TEXT: Record<MyReward['status'], string> = {
  available: 'Mostre este QR Code no local parceiro. Ele vale uma vez só.',
  used: 'Esta recompensa já foi usada.',
  expired: 'Esta recompensa está vencida.',
}

export function showRewardQr(reward: MyReward): void {
  const box = document.createElement('div')
  box.className = 'flex flex-col items-center gap-3 text-center'

  const partner = document.createElement('p')
  partner.className = 'text-sm text-gray-500'
  partner.textContent = reward.partnerName
  const qrWrap = document.createElement('div')
  qrWrap.className = `w-64 h-64 rounded-2xl bg-white border border-gray-100 flex items-center justify-center ${reward.status === 'available' ? '' : 'opacity-30 grayscale'}`
  qrWrap.textContent = '…'
  const code = document.createElement('p')
  code.className = 'font-mono text-xl font-bold tracking-widest text-gray-900 select-all'
  code.textContent = reward.code
  const info = document.createElement('p')
  info.className = 'text-xs text-gray-500 max-w-xs'
  info.textContent = STATUS_TEXT[reward.status]
  box.append(partner, qrWrap, code, info)
  if (reward.expiresAt) {
    const [y, m, d] = reward.expiresAt.split('-')
    const exp = document.createElement('p')
    exp.className = 'text-xs text-gray-400'
    exp.textContent = `Válida até ${d}/${m}/${y}`
    box.appendChild(exp)
  }

  BottomSheet({ title: reward.title, content: box })

  // biblioteca do QR só é baixada quando precisa
  void import('qrcode').then(QR => QR.toDataURL(reward.code, { width: 512, margin: 1, errorCorrectionLevel: 'M' })).then(url => {
    qrWrap.textContent = ''
    const img = document.createElement('img')
    img.src = url
    img.alt = `QR Code ${reward.code}`
    img.className = 'w-full h-full p-2'
    qrWrap.appendChild(img)
  }).catch(() => { qrWrap.textContent = 'Use o código abaixo' })
}
