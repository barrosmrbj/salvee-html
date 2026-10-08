// src/screens/auth/oauth.ts — retorno do login social: #/oauth?token=...
import { Spinner } from '@/components'
import { getHashQuery } from '@/router'
import { goAfterLogin } from './after-login'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white flex items-center justify-center'
  el.appendChild(Spinner())
  return el
}

export function mount(): void {
  const token = getHashQuery().get('token')
  if (!token) {
    window.location.replace('#/login?erro=' + encodeURIComponent('Não foi possível entrar. Tente novamente.'))
    return
  }
  localStorage.setItem('accessToken', token)
  localStorage.setItem('refreshToken', token)
  // replace: o token não fica no histórico do navegador
  void goAfterLogin()
}
