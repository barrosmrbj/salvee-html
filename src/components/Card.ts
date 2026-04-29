export function Card(children: HTMLElement | string, className = ''): HTMLDivElement {
  const card = document.createElement('div')
  card.className = `bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`
  if (typeof children === 'string') {
    card.innerHTML = children
  } else {
    card.appendChild(children)
  }
  return card
}
