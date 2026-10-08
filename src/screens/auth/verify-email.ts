// src/screens/auth/verify-email.ts
//  - #/verify-email           → depois do cadastro: "confirme seu e-mail" (reenviar / continuar)
//  - #/verify-email?token=... → link do e-mail: confirma e mostra o resultado
// A confirmação não bloqueia o uso do app.
import { Button, Spinner, showToast } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'
import { getHashQuery } from '@/router'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `<div id="verify-content" class="flex-1 p-6 flex flex-col items-center justify-center text-center gap-6"></div>`
  return el
}

export function mount(): void {
  const content = document.getElementById('verify-content')!
  content.appendChild(Spinner())
  const token = getHashQuery().get('token')
  if (token) void confirmToken(content, token)
  else void showCheckInbox(content)
}

function setContent(content: HTMLElement, icon: string, title: string, text: string): void {
  content.innerHTML = ''
  const iconEl = document.createElement('div')
  iconEl.className = 'w-20 h-20 bg-salvee-orange-bg rounded-full flex items-center justify-center text-4xl'
  iconEl.textContent = icon
  const h1 = document.createElement('h1')
  h1.className = 'text-2xl font-bold text-gray-900'
  h1.textContent = title
  const p = document.createElement('p')
  p.className = 'text-gray-500 text-sm'
  p.textContent = text
  content.append(iconEl, h1, p)
}

function addButton(content: HTMLElement, label: string, variant: 'primary' | 'secondary', onClick: () => void): void {
  const wrap = document.createElement('div')
  wrap.className = 'w-full'
  wrap.appendChild(Button({ label, variant, fullWidth: true, onClick }))
  content.appendChild(wrap)
}

async function confirmToken(content: HTMLElement, token: string): Promise<void> {
  const loggedIn = authService.isAuthenticated()
  const next = () => window.location.replace(loggedIn ? '#/feed' : '#/login')
  try {
    await authService.verifyEmail(token)
    setContent(content, '✅', 'E-mail confirmado!', 'Obrigado. Sua conta Salvee está confirmada.')
  } catch (err) {
    setContent(content, '⚠️', 'Não foi possível confirmar', err instanceof ApiError ? err.message : 'Tente novamente mais tarde.')
  }
  addButton(content, loggedIn ? 'Ir para o app' : 'Entrar', 'primary', next)
}

async function showCheckInbox(content: HTMLElement): Promise<void> {
  const goOn = () => { window.location.hash = '/welcome-success' }
  try {
    const [status, user] = await Promise.all([authService.mailStatus(), authService.getMe()])
    // sem envio de e-mail configurado (ou já confirmado): segue o cadastro sem parar aqui
    if (!status.enabled || user.emailVerified) { window.location.replace('#/welcome-success'); return }
    setContent(content, '✉️', 'Confirme seu e-mail', `Enviamos um link de confirmação para ${user.email}. Abra o e-mail e toque em "Confirmar e-mail". Se não encontrar, veja a caixa de spam.`)
  } catch {
    window.location.replace('#/welcome-success')
    return
  }
  addButton(content, 'Continuar', 'primary', goOn)

  const resend = document.createElement('button')
  resend.type = 'button'
  resend.className = 'text-salvee-orange text-sm font-medium'
  resend.textContent = 'Reenviar e-mail'
  resend.addEventListener('click', async () => {
    try {
      const r = await authService.resendVerification()
      showToast(r.alreadyVerified ? 'Seu e-mail já está confirmado' : 'E-mail reenviado!', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao reenviar', 'error')
    }
  })
  content.appendChild(resend)
}
