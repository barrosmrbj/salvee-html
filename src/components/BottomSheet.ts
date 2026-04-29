export interface BottomSheetOptions {
  title?: string
  content: HTMLElement
  onClose?: () => void
}

export interface BottomSheetInstance {
  el: HTMLElement
  close: () => void
}

export function BottomSheet(options: BottomSheetOptions): BottomSheetInstance {
  const { title, content, onClose } = options

  const overlay = document.createElement('div')
  overlay.className = 'fixed inset-0 bg-black/40 z-50 flex items-end justify-center'

  const sheet = document.createElement('div')
  sheet.className = 'w-full max-w-app bg-white rounded-t-3xl p-6 pb-safe transform transition-transform duration-300 translate-y-full'

  const header = document.createElement('div')
  header.className = 'flex items-center justify-between mb-4'

  if (title) {
    const titleEl = document.createElement('h3')
    titleEl.className = 'text-lg font-semibold text-gray-900'
    titleEl.textContent = title
    header.appendChild(titleEl)
  } else {
    header.appendChild(document.createElement('div'))
  }

  const closeBtn = document.createElement('button')
  closeBtn.className = 'w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600'
  closeBtn.textContent = '✕'
  header.appendChild(closeBtn)

  sheet.appendChild(header)
  sheet.appendChild(content)
  overlay.appendChild(sheet)
  document.body.appendChild(overlay)

  requestAnimationFrame(() => sheet.classList.replace('translate-y-full', 'translate-y-0'))

  const close = (): void => {
    sheet.classList.replace('translate-y-0', 'translate-y-full')
    setTimeout(() => {
      overlay.remove()
      onClose?.()
    }, 300)
  }

  closeBtn.addEventListener('click', close)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close()
  })

  return { el: overlay, close }
}
