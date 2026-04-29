import { authService } from '@/services'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-salvee-orange'

  el.innerHTML = `
    <div class="flex flex-col items-center gap-4">
      <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 6C12.268 6 6 12.268 6 20s6.268 14 14 14 14-6.268 14-14S27.732 6 20 6z" fill="#FF6B00"/>
          <path d="M14 20l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1 class="text-white text-4xl font-bold tracking-tight">salvee</h1>
      <p class="text-white/70 text-sm">Conectando corações a causas</p>
    </div>
    <div class="absolute bottom-12 left-1/2 -translate-x-1/2">
      <div class="w-8 h-1 bg-white/40 rounded-full animate-pulse"></div>
    </div>
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
