// src/screens/conta/editar-perfil.ts — #/settings/perfil: nome e foto (spec 20)
import { Avatar, Button, Input, PageHeader, Spinner, showToast } from '@/components'
import { institutionService, userService } from '@/services'
import { ApiError } from '@/services/api'
import type { User } from '@/types'

let avatarUrl: string | null = null

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen bg-gray-50'
  el.appendChild(PageHeader('Editar perfil'))
  const box = document.createElement('div')
  box.id = 'edit-profile'
  box.className = 'p-4 pb-24 flex flex-col gap-4'
  el.appendChild(box)
  return el
}

export function mount(): void {
  const root = document.getElementById('edit-profile')!
  root.appendChild(Spinner())
  userService.getProfile()
    .then(user => build(root, user))
    .catch(() => { root.innerHTML = '<p class="text-center text-gray-500 py-16">Não foi possível carregar o perfil.</p>' })
}

function build(root: HTMLElement, user: User): void {
  root.innerHTML = ''
  avatarUrl = user.avatarUrl || null

  const card = document.createElement('div')
  card.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-3'
  const avatarSlot = document.createElement('div')
  const paint = (name: string) => { avatarSlot.innerHTML = ''; avatarSlot.appendChild(Avatar(name || user.name, avatarUrl || undefined, 'lg')) }
  paint(user.name)

  const file = document.createElement('input')
  file.type = 'file'
  file.accept = 'image/jpeg,image/png'
  file.className = 'hidden'
  const photoBtns = document.createElement('div')
  photoBtns.className = 'flex gap-2'
  const change = document.createElement('button')
  change.type = 'button'
  change.className = 'px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700'
  change.textContent = '📷 Trocar foto'
  const remove = document.createElement('button')
  remove.type = 'button'
  remove.className = 'px-3 py-1.5 rounded-lg text-sm text-red-500'
  remove.textContent = 'Remover'
  photoBtns.append(change, remove)
  const note = document.createElement('p')
  note.className = 'text-xs text-gray-400'
  note.textContent = 'JPG ou PNG, até 1 MB'
  card.append(avatarSlot, photoBtns, note, file)

  change.addEventListener('click', () => file.click())
  remove.addEventListener('click', () => { avatarUrl = null; paint(nameValue()) })
  file.addEventListener('change', async () => {
    const f = file.files?.[0]
    file.value = ''
    if (!f) return
    if (f.size > 1_048_576) { showToast('Foto muito grande. Máximo: 1 MB.', 'error'); return }
    change.disabled = true
    change.textContent = 'Enviando…'
    try {
      avatarUrl = await institutionService.uploadFile(f)
      paint(nameValue())
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar a foto', 'error')
    } finally {
      change.disabled = false
      change.textContent = '📷 Trocar foto'
    }
  })

  const form = document.createElement('form')
  form.className = 'bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-4'
  const nameField = Input({ id: 'profile-name', label: 'Nome', required: true })
  const nameInput = nameField.querySelector('input')!
  nameInput.value = user.name
  nameInput.maxLength = 120
  const nameValue = () => nameInput.value.trim()
  const emailInfo = document.createElement('div')
  emailInfo.className = 'flex flex-col gap-1'
  const emailLabel = document.createElement('span')
  emailLabel.className = 'text-sm font-medium text-gray-700'
  emailLabel.textContent = 'E-mail'
  const emailValue = document.createElement('p')
  emailValue.className = 'px-4 py-3 rounded-xl bg-gray-50 text-gray-500 text-base break-all'
  emailValue.textContent = user.email
  const emailNote = document.createElement('p')
  emailNote.className = 'text-xs text-gray-400'
  emailNote.textContent = 'O e-mail é o seu login e não pode ser trocado por aqui. Precisa mudar? Fale com o suporte (Ajuda).'
  emailInfo.append(emailLabel, emailValue, emailNote)
  form.append(nameField, emailInfo, Button({ label: 'Salvar', variant: 'primary', fullWidth: true, type: 'submit' }))

  form.addEventListener('submit', async e => {
    e.preventDefault()
    if (nameValue().length < 2) { showToast('Informe o seu nome', 'error'); return }
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    btn.disabled = true
    try {
      await userService.updateProfile({ name: nameValue(), avatarUrl })
      showToast('Perfil atualizado', 'success')
      history.back()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Erro ao salvar', 'error')
    } finally {
      btn.disabled = false
    }
  })

  root.append(card, form)
}

export function unmount(): void {
  avatarUrl = null
}
