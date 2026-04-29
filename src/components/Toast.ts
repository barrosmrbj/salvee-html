export type ToastType = 'success' | 'error' | 'info'

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}

const colors: Record<ToastType, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-salvee-orange',
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000): void {
  const existing = document.getElementById('salvee-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'salvee-toast'
  toast.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg max-w-xs w-full ${colors[type]} transition-all duration-300 opacity-0`
  toast.innerHTML = `<span class="font-bold">${icons[type]}</span> ${message}`

  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.replace('opacity-0', 'opacity-100'))

  setTimeout(() => {
    toast.classList.replace('opacity-100', 'opacity-0')
    setTimeout(() => toast.remove(), 300)
  }, duration)
}
