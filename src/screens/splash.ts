import { authService } from '@/services'
import inicioImg from '../../.Documentacao/inicio.jpg'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-[#FF6B00]'

  el.innerHTML = `
    <img src="${inicioImg}" alt="Salvee" class="w-full max-w-xs object-contain" />
  `
  return el
}

export function mount(): void {
  setTimeout(() => {
    if (authService.isAuthenticated()) {
      window.location.hash = '/feed'
    } else {
      window.location.hash = '/welcome'
    }
  }, 1800)
}
