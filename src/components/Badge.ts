export function VerifiedBadge(): HTMLSpanElement {
  const badge = document.createElement('span')
  badge.className = 'inline-flex items-center justify-center w-4 h-4 bg-salvee-orange rounded-full flex-shrink-0'
  badge.title = 'Instituição verificada'
  badge.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
  return badge
}
