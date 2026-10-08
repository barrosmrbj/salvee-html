// src/screens/donation.ts
import { Button, NumericKeyboard, showToast, LoadingOverlay } from '@/components'
import { donationService, institutionService } from '@/services'
import type { Institution, PaymentMethod } from '@/types'
import girlSvg from '../../.Documentacao/ilustracoes_salvee/__girl_salvee_004.svg?url'

type DonationStep = 'amount' | 'payment' | 'summary' | 'success'

let step: DonationStep = 'amount'
let amount = 0
let message = ''
let paymentMethod: PaymentMethod = 'pix'
let anonymous = false
let institution: Institution | null = null
let xpEarned = 0
let salvesEarned = 0

export function render(params?: Record<string, string>): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.dataset['institutionId'] = params?.id ?? ''
  el.innerHTML = `<div id="donation-screen" class="flex flex-col h-full"></div>`
  return el
}

export function mount(): void {
  const el = document.querySelector('[data-institution-id]') as HTMLElement
  const id = el?.dataset['institutionId'] ?? ''

  institutionService.getById(id).then(inst => {
    institution = inst
    renderStep()
  }).catch(() => {
    institution = {
      id,
      name: 'Nome da instituição',
      category: 'Categoria',
      verified: true,
      status: 'approved',
      description: '',
      photos: [],
    }
    renderStep()
  })
}

function renderStep(): void {
  const screen = document.getElementById('donation-screen')!
  screen.innerHTML = ''

  if (step === 'success') {
    renderSuccessStep(screen)
    return
  }

  const header = document.createElement('div')
  header.className = 'flex items-center gap-3 p-4 border-b border-gray-100 flex-shrink-0'

  const backBtn = document.createElement('button')
  backBtn.className = 'w-10 h-10 flex items-center justify-center text-gray-600'
  backBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>'
  backBtn.addEventListener('click', () => {
    if (step === 'amount') history.back()
    else if (step === 'payment') { step = 'amount'; renderStep() }
    else if (step === 'summary') { step = 'payment'; renderStep() }
    else history.back()
  })
  header.appendChild(backBtn)

  const title = document.createElement('h1')
  title.className = 'text-base font-semibold text-gray-900'
  const titles: Record<DonationStep, string> = {
    amount: 'Doação',
    payment: 'Forma de pagamento',
    summary: 'Resumo da doação',
    success: 'Confirmação',
  }
  title.textContent = titles[step]
  header.appendChild(title)
  screen.appendChild(header)

  const content = document.createElement('div')
  content.className = 'flex-1 overflow-y-auto'
  screen.appendChild(content)

  if (step === 'amount') renderAmountStep(content)
  else if (step === 'payment') renderPaymentStep(content)
  else renderSummaryStep(content)
}

function renderAmountStep(container: HTMLElement): void {
  const topSection = document.createElement('div')
  topSection.className = 'flex flex-col items-center p-6 gap-4'

  const instRow = document.createElement('div')
  instRow.className = 'flex items-center gap-3'

  const logoDiv = document.createElement('div')
  logoDiv.className = 'w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400'
  if (institution?.logoUrl) {
    const img = document.createElement('img')
    img.src = institution.logoUrl
    img.className = 'w-full h-full object-cover'
    img.alt = ''
    logoDiv.appendChild(img)
  } else {
    logoDiv.textContent = '🏢'
  }
  instRow.appendChild(logoDiv)

  const instInfo = document.createElement('div')
  const instName = document.createElement('p')
  instName.className = 'font-semibold text-gray-900 text-sm'
  instName.textContent = institution?.name ?? ''
  instInfo.appendChild(instName)

  const metaRow = document.createElement('div')
  metaRow.className = 'flex items-center gap-1'
  const catSpan = document.createElement('span')
  catSpan.className = 'text-xs text-gray-400'
  catSpan.textContent = institution?.category ?? ''
  metaRow.appendChild(catSpan)
  if (institution?.verified) {
    const badge = document.createElement('span')
    badge.className = 'inline-flex items-center justify-center w-3.5 h-3.5 bg-salvee-orange rounded-full'
    badge.innerHTML = '<svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    metaRow.appendChild(badge)
  }
  instInfo.appendChild(metaRow)
  instRow.appendChild(instInfo)
  topSection.appendChild(instRow)

  const amountDisplay = document.createElement('div')
  amountDisplay.id = 'amount-display'
  amountDisplay.className = 'text-5xl font-bold text-salvee-orange'
  amountDisplay.textContent = 'R$ 0'
  topSection.appendChild(amountDisplay)

  const textarea = document.createElement('textarea')
  textarea.id = 'donation-message'
  textarea.placeholder = 'Mensagem opcional'
  textarea.maxLength = 200
  textarea.rows = 2
  textarea.className = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm resize-none outline-none focus:border-salvee-orange'
  textarea.addEventListener('input', () => {
    message = textarea.value
    charCount.textContent = `${message.length}/200`
  })
  topSection.appendChild(textarea)

  const charCount = document.createElement('p')
  charCount.className = 'self-end text-xs text-gray-400'
  charCount.textContent = '0/200'
  topSection.appendChild(charCount)

  container.appendChild(topSection)

  const keyboardContainer = document.createElement('div')
  keyboardContainer.appendChild(
    NumericKeyboard({
      onInput: (val) => {
        amount = parseInt(val, 10) || 0
        amountDisplay.textContent = `R$ ${amount.toLocaleString('pt-BR')}`
      },
    })
  )
  container.appendChild(keyboardContainer)

  const btnWrapper = document.createElement('div')
  btnWrapper.className = 'p-4 pb-safe'
  btnWrapper.appendChild(
    Button({
      label: 'Avançar',
      variant: 'primary',
      fullWidth: true,
      onClick: () => {
        if (amount <= 0) { showToast('Digite um valor para doar', 'error'); return }
        step = 'payment'
        renderStep()
      },
    })
  )
  container.appendChild(btnWrapper)
}

function renderPaymentStep(container: HTMLElement): void {
  const methods: Array<{ id: PaymentMethod; label: string; icon: string }> = [
    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
    { id: 'google_pay', label: 'Google Pay', icon: 'G' },
    { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'pix', label: 'Pix código', icon: '⚡' },
    { id: 'card', label: 'Cartão', icon: '💳' },
  ]

  const list = document.createElement('div')
  list.className = 'p-6 flex flex-col gap-3'

  methods.forEach(m => {
    const btn = document.createElement('button')
    const isSelected = paymentMethod === m.id
    btn.className = `w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-colors ${isSelected ? 'border-salvee-orange bg-salvee-orange-bg' : 'border-gray-100 bg-white'}`

    const iconSpan = document.createElement('span')
    iconSpan.className = 'text-2xl w-8 text-center'
    iconSpan.textContent = m.icon

    const labelSpan = document.createElement('span')
    labelSpan.className = 'font-medium text-gray-900 flex-1 text-left'
    labelSpan.textContent = m.label

    const radio = document.createElement('div')
    radio.className = `w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-salvee-orange' : 'border-gray-300'}`
    if (isSelected) {
      const dot = document.createElement('div')
      dot.className = 'w-3 h-3 rounded-full bg-salvee-orange'
      radio.appendChild(dot)
    }

    btn.appendChild(iconSpan)
    btn.appendChild(labelSpan)
    btn.appendChild(radio)
    btn.addEventListener('click', () => {
      paymentMethod = m.id
      renderPaymentStep(container)
    })
    list.appendChild(btn)
  })

  container.innerHTML = ''
  container.appendChild(list)

  const btnWrapper = document.createElement('div')
  btnWrapper.className = 'p-4 pb-safe'
  btnWrapper.appendChild(
    Button({
      label: 'Avançar',
      variant: 'primary',
      fullWidth: true,
      onClick: () => { step = 'summary'; renderStep() },
    })
  )
  container.appendChild(btnWrapper)
}

function renderSummaryStep(container: HTMLElement): void {
  const xp = Math.floor(amount / 2)
  const salves = Math.floor(amount / 4)

  const wrapper = document.createElement('div')
  wrapper.className = 'p-6 flex flex-col gap-4'

  // Institution row
  const instRow = document.createElement('div')
  instRow.className = 'flex items-center gap-3 p-4 bg-gray-50 rounded-2xl'
  const logoDiv = document.createElement('div')
  logoDiv.className = 'w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden'
  if (institution?.logoUrl) {
    const img = document.createElement('img')
    img.src = institution.logoUrl
    img.className = 'w-full h-full object-cover'
    img.alt = ''
    logoDiv.appendChild(img)
  } else {
    logoDiv.textContent = '🏢'
  }
  instRow.appendChild(logoDiv)
  const instName = document.createElement('span')
  instName.className = 'font-semibold text-gray-900'
  instName.textContent = institution?.name ?? ''
  instRow.appendChild(instName)
  if (institution?.verified) {
    const badge = document.createElement('span')
    badge.className = 'inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full ml-auto'
    badge.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    instRow.appendChild(badge)
  }
  wrapper.appendChild(instRow)

  // Details rows
  const details = document.createElement('div')
  details.className = 'flex flex-col gap-2'

  const addRow = (label: string, valueText: string, valueClass = 'font-medium text-gray-900') => {
    const row = document.createElement('div')
    row.className = 'flex justify-between'
    const lSpan = document.createElement('span')
    lSpan.className = 'text-gray-500'
    lSpan.textContent = label
    const vSpan = document.createElement('span')
    vSpan.className = valueClass
    vSpan.textContent = valueText
    row.appendChild(lSpan)
    row.appendChild(vSpan)
    details.appendChild(row)
  }

  addRow('Valor', `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'font-bold text-salvee-orange text-lg')
  addRow('Pontuação', `+${xp}XP · +${salves}SLV`)
  addRow('', 'Creditada após a confirmação do pagamento', 'text-xs text-gray-400')
  if (message) addRow('Mensagem', message)
  wrapper.appendChild(details)

  // Anonymous toggle
  const anonRow = document.createElement('div')
  anonRow.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-2xl'
  const anonLabel = document.createElement('span')
  anonLabel.className = 'text-gray-700 font-medium'
  anonLabel.textContent = 'Doação anônima'
  const toggleLabel = document.createElement('label')
  toggleLabel.className = 'relative inline-flex items-center cursor-pointer'
  const toggleInput = document.createElement('input')
  toggleInput.type = 'checkbox'
  toggleInput.className = 'sr-only peer'
  if (anonymous) toggleInput.checked = true
  toggleInput.addEventListener('change', () => { anonymous = toggleInput.checked })
  const toggleDiv = document.createElement('div')
  toggleDiv.className = "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-salvee-orange"
  toggleLabel.appendChild(toggleInput)
  toggleLabel.appendChild(toggleDiv)
  anonRow.appendChild(anonLabel)
  anonRow.appendChild(toggleLabel)
  wrapper.appendChild(anonRow)

  // Payment method row
  const paymentIconMap: Record<PaymentMethod, string> = { pix: '⚡', paypal: '🅿️', google_pay: 'G', apple_pay: '🍎', card: '💳' }
  const paymentLabelMap: Record<PaymentMethod, string> = { pix: 'Pix', paypal: 'PayPal', google_pay: 'Google Pay', apple_pay: 'Apple Pay', card: 'Cartão' }
  const payRow = document.createElement('div')
  payRow.className = 'flex items-center gap-3 p-4 bg-gray-50 rounded-2xl'
  const payIcon = document.createElement('span')
  payIcon.className = 'text-2xl'
  payIcon.textContent = paymentIconMap[paymentMethod]
  const payName = document.createElement('span')
  payName.className = 'font-medium text-gray-900 flex-1'
  payName.textContent = paymentLabelMap[paymentMethod]
  const changeBtn = document.createElement('button')
  changeBtn.className = 'text-salvee-orange text-sm font-medium'
  changeBtn.textContent = 'Trocar'
  changeBtn.addEventListener('click', () => { step = 'payment'; renderStep() })
  payRow.appendChild(payIcon)
  payRow.appendChild(payName)
  payRow.appendChild(changeBtn)
  wrapper.appendChild(payRow)

  container.appendChild(wrapper)

  const btnWrapper = document.createElement('div')
  btnWrapper.className = 'p-4 pb-safe'
  btnWrapper.appendChild(
    Button({
      label: 'Confirmar',
      variant: 'primary',
      fullWidth: true,
      onClick: async () => {
        const overlay = LoadingOverlay()
        document.body.appendChild(overlay)
        try {
          const result = await donationService.initiate({
            institutionId: institution?.id ?? '',
            amount,
            message,
            paymentMethod,
            anonymous,
          })
          xpEarned = result.xpEarned
          salvesEarned = result.salvesEarned
          step = 'success'
          renderStep()
        } catch {
          // sem registro no servidor não há doação: fica no resumo para tentar de novo
          showToast('Não foi possível registrar a doação. Tente novamente.', 'error')
        } finally {
          overlay.remove()
        }
      },
    })
  )
  container.appendChild(btnWrapper)
}

function renderSuccessStep(screen: HTMLElement): void {
  screen.className = 'flex flex-col h-full items-center justify-between'

  const main = document.createElement('div')
  main.className = 'flex flex-col items-center justify-center flex-1 p-6 gap-6 text-center'

  const emoji = document.createElement('img')
  emoji.src = girlSvg
  emoji.alt = 'Parabéns'
  emoji.className = 'w-48 h-48 object-contain'
  main.appendChild(emoji)

  const textBlock = document.createElement('div')
  const h2 = document.createElement('h2')
  h2.className = 'text-2xl font-bold text-gray-900 mb-2'
  h2.textContent = 'Obrigado!'
  const p = document.createElement('p')
  p.className = 'text-gray-500 text-sm'
  p.textContent = 'Sua doação foi registrada e está aguardando a confirmação do pagamento. Os pontos abaixo entram na sua conta assim que ela for confirmada.'
  textBlock.appendChild(h2)
  textBlock.appendChild(p)
  main.appendChild(textBlock)

  const scores = document.createElement('div')
  scores.className = 'flex gap-4'

  const xpCard = document.createElement('div')
  xpCard.className = 'bg-salvee-orange-bg px-6 py-3 rounded-2xl text-center'
  const xpVal = document.createElement('p')
  xpVal.className = 'text-salvee-orange font-bold text-xl'
  xpVal.textContent = `+${xpEarned}XP`
  const xpLabel = document.createElement('p')
  xpLabel.className = 'text-xs text-gray-500'
  xpLabel.textContent = 'Experiência'
  xpCard.appendChild(xpVal)
  xpCard.appendChild(xpLabel)

  const slvCard = document.createElement('div')
  slvCard.className = 'bg-salvee-orange-bg px-6 py-3 rounded-2xl text-center'
  const slvVal = document.createElement('p')
  slvVal.className = 'text-salvee-orange font-bold text-xl'
  slvVal.textContent = `+${salvesEarned}SLV`
  const slvLabel = document.createElement('p')
  slvLabel.className = 'text-xs text-gray-500'
  slvLabel.textContent = 'Salves'
  slvCard.appendChild(slvVal)
  slvCard.appendChild(slvLabel)

  scores.appendChild(xpCard)
  scores.appendChild(slvCard)
  main.appendChild(scores)
  screen.appendChild(main)

  const btnWrapper = document.createElement('div')
  btnWrapper.className = 'w-full p-4 pb-safe'
  btnWrapper.appendChild(
    Button({
      label: 'Continuar',
      variant: 'primary',
      fullWidth: true,
      onClick: () => { window.location.hash = '/feed' },
    })
  )
  screen.appendChild(btnWrapper)
}

export function unmount(): void {
  step = 'amount'
  amount = 0
  message = ''
  paymentMethod = 'pix'
  anonymous = false
  institution = null
  xpEarned = 0
  salvesEarned = 0
}
