export function Avatar(name: string, imageUrl?: string, size: 'sm' | 'md' | 'lg' = 'md'): HTMLDivElement {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' }
  const el = document.createElement('div')
  el.className = `${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-salvee-orange text-white font-semibold flex-shrink-0`

  if (imageUrl) {
    const img = document.createElement('img')
    img.src = imageUrl
    img.alt = name
    img.className = 'w-full h-full object-cover'
    el.appendChild(img)
  } else {
    const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    el.textContent = initials
  }

  return el
}
