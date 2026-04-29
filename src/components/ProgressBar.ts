export function ProgressBar(current: number, goal: number, showLabel = true): HTMLDivElement {
  const pct = Math.min(Math.round((current / goal) * 100), 100)
  const el = document.createElement('div')
  el.className = 'flex flex-col gap-1'

  if (showLabel) {
    const labelRow = document.createElement('div')
    labelRow.className = 'flex justify-between text-xs text-gray-500'

    const leftLabel = document.createElement('span')
    leftLabel.textContent = `R$ ${current.toLocaleString('pt-BR')}`

    const rightLabel = document.createElement('span')
    rightLabel.textContent = `Meta: R$ ${goal.toLocaleString('pt-BR')}`

    labelRow.appendChild(leftLabel)
    labelRow.appendChild(rightLabel)
    el.appendChild(labelRow)
  }

  const track = document.createElement('div')
  track.className = 'w-full bg-gray-100 rounded-full h-2'

  const bar = document.createElement('div')
  bar.className = 'bg-salvee-orange h-2 rounded-full transition-all duration-500'
  bar.style.width = `${pct}%`
  track.appendChild(bar)
  el.appendChild(track)

  const pctLabel = document.createElement('span')
  pctLabel.className = 'text-xs text-salvee-orange font-medium'
  pctLabel.textContent = `${pct}% arrecadado`
  el.appendChild(pctLabel)

  return el
}
