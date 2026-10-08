// src/screens/auth/reset-password.ts — link do e-mail "Criar nova senha": #/reset-password?token=...
import { Button, Input, getInputValue, showToast, LoadingOverlay } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'
import { getHashQuery } from '@/router'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-white'
  el.innerHTML = `
    <div class="flex items-center p-4 border-b border-gray-100">
      <h1 class="text-lg font-semibold ml-2">Criar nova senha</h1>
    </div>
    <div class="flex-1 p-6 flex flex-col gap-6">
      <p class="text-gray-500 text-sm">Escolha a nova senha da sua conta Salvee.</p>
      <form id="reset-form" class="flex flex-col gap-4">
        <div id="field-password"></div>
        <div id="field-confirm"></div>
        <div id="btn-save" class="mt-2"></div>
      </form>
    </div>
  `
  return el
}

export function mount(): void {
  const token = getHashQuery().get('token') ?? ''
  if (!token) {
    showToast('Link inválido. Peça um novo em "Esqueci minha senha".', 'error')
    window.location.replace('#/forgot-password')
    return
  }

  const form = document.getElementById('reset-form')!
  form.querySelector('#field-password')!.appendChild(
    Input({ id: 'password', label: 'Nova senha', type: 'password', placeholder: 'Mínimo de 6 caracteres', required: true })
  )
  form.querySelector('#field-confirm')!.appendChild(
    Input({ id: 'confirm', label: 'Confirme a nova senha', type: 'password', placeholder: '••••••••', required: true })
  )
  document.getElementById('btn-save')!.appendChild(
    Button({ label: 'Salvar nova senha', variant: 'primary', fullWidth: true, type: 'submit' })
  )

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const password = getInputValue(form, 'password')
    const confirm = getInputValue(form, 'confirm')
    if (password.length < 6) { showToast('A senha precisa ter pelo menos 6 caracteres', 'error'); return }
    if (password !== confirm) { showToast('As senhas não coincidem', 'error'); return }

    const overlay = LoadingOverlay()
    document.body.appendChild(overlay)
    try {
      await authService.resetPassword(token, password)
      showToast('Senha alterada! Entre com a nova senha.', 'success')
      // replace: o link (com o token) não fica no histórico
      window.location.replace('#/login')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao salvar. Tente novamente.', 'error')
    } finally {
      overlay.remove()
    }
  })
}
