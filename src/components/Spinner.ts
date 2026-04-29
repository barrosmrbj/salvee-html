export function Spinner(size: 'sm' | 'md' | 'lg' = 'md'): HTMLDivElement {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  const el = document.createElement('div')
  el.className = `${sizes[size]} border-4 border-gray-200 border-t-salvee-orange rounded-full animate-spin`
  return el
}

export function LoadingOverlay(): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 bg-white/80 flex items-center justify-center z-50'
  overlay.appendChild(Spinner('lg'))
  return overlay
}
