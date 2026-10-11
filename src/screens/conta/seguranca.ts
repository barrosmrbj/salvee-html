// src/screens/conta/seguranca.ts — #/settings/seguranca: alterar senha e excluir conta (spec 20)
import { Button, Input, PageHeader, getInputValue, showToast } from '@/components'
import { authService } from '@/services'
import { ApiError } from '@/services/api'
import { PASSWORD_HINT, passwordError } from '@/utils/validation'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.appendChild(PageHeader('Segurança'))
  const box = document.createElement('div')
  box.className = 'p-4 pb-24 flex flex-col gap-4'
  box.innerHTML = `
    <form id="pw-form" class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4">
      <h2 class="font-semibold text-gray-900">Alterar senha</h2>
      <div id="f-current"></div>
      <div id="f-new"></div>
      <div id="f-confirm"></div>
      <div id="f-save"></div>
      <a href="#/forgot-password" class="text-sm text-salvee-orange text-center">Não sei a senha atual (entrei com Google, Facebook ou Apple)</a>
    </form>
    <div class="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
      <h2 class="font-semibold text-gray-900">Excluir conta</h2>
      <p class="text-sm text-gray-500">Apaga sua conta e seus dados de forma definitiva.</p>
      <a href="#/excluir-conta" class="mt-1 w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-center">Excluir minha conta</a>
    </div>
  `
  el.appendChild(box)
  return el
}

export function mount(): void {
  const form = document.getElementById('pw-form') as HTMLFormElement
  form.querySelector('#f-current')!.appendChild(Input({ id: 'current', label: 'Senha atual', type: 'password', required: true }))
  form.querySelector('#f-new')!.appendChild(Input({ id: 'new', label: 'Nova senha', type: 'password', placeholder: PASSWORD_HINT, required: true }))
  form.querySelector('#f-confirm')!.appendChild(Input({ id: 'confirm', label: 'Confirme a nova senha', type: 'password', required: true }))
  form.querySelector('#f-save')!.appendChild(Button({ label: 'Salvar nova senha', variant: 'primary', fullWidth: true, type: 'submit' }))

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const current = getInputValue(form, 'current')
    const next = getInputValue(form, 'new')
    if (!current) { showToast('Informe a senha atual', 'error'); return }
    const pwError = passwordError(next)
    if (pwError) { showToast(pwError, 'error'); return }
    if (next !== getInputValue(form, 'confirm')) { showToast('As senhas não coincidem', 'error'); return }
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    btn.disabled = true
    try {
      await authService.changePassword(current, next)
      form.reset()
      showToast('Senha alterada', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao alterar a senha', 'error')
    } finally {
      btn.disabled = false
    }
  })
}
