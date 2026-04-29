export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

export interface ButtonOptions {
  label: string
  variant?: ButtonVariant
  fullWidth?: boolean
  disabled?: boolean
  onClick?: (e: MouseEvent) => void
  type?: 'button' | 'submit'
  icon?: string
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-salvee-orange text-white hover:bg-salvee-orange-dark active:scale-95',
  secondary: 'border-2 border-salvee-orange text-salvee-orange bg-white hover:bg-salvee-orange-bg',
  ghost: 'text-salvee-orange bg-transparent hover:bg-salvee-orange-bg',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
}

export function Button(options: ButtonOptions): HTMLButtonElement {
  const {
    label,
    variant = 'primary',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    icon,
  } = options

  const btn = document.createElement('button')
  btn.type = type
  btn.disabled = disabled
  btn.className = [
    'px-6 py-3 rounded-xl font-semibold text-base transition-all duration-150',
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].filter(Boolean).join(' ')

  btn.innerHTML = icon
    ? `<span class="flex items-center justify-center gap-2">${icon}${label}</span>`
    : label

  if (onClick) btn.addEventListener('click', onClick)
  return btn
}
