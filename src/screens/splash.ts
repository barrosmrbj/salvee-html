import { authService } from '@/services'

export function render(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'screen items-center justify-center bg-salvee-orange'

  el.innerHTML = `
    <div class="flex items-center gap-4">
      <!-- Salvee logo mark: oval ring + hands -->
      <svg width="70" height="64" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer oval ring with gap at top-right (1–2 o'clock) -->
        <path d="M 89 32 A 43 47 0 1 1 74 14"
              stroke="white" stroke-width="15" stroke-linecap="round" fill="none"/>
        <!-- Back hand: palm at top, 4 fingers pointing down, enters through ring gap -->
        <path d="
          M 70 16
          C 74 22, 74 34, 71 48
          L 70 57 C 70 63, 67 66, 65 64
          L 65 57 L 62 57
          L 62 62 C 62 67, 59 69, 57 67
          L 57 57 L 54 57
          L 54 62 C 54 67, 51 69, 49 67
          L 49 57 L 46 57
          L 46 62 C 46 67, 43 68, 41 66
          L 41 53
          C 38 41, 38 27, 42 18
          C 50 10, 64 10, 70 16 Z
        " fill="white"/>
        <!-- Front hand: open palm silhouette (right side, white filled) -->
        <path d="
          M 85 34
          C 89 40, 89 50, 87 60
          L 86 68 C 86 73, 83 75, 81 73
          L 81 65 L 78 65
          L 78 72 C 78 76, 75 78, 73 76
          L 73 65 L 70 65
          L 70 72 C 70 76, 67 77, 66 75
          L 67 61
          C 64 55, 65 44, 68 36
          C 74 28, 82 28, 85 34 Z
        " fill="white"/>
      </svg>

      <!-- Logotype text -->
      <span class="text-white font-bold" style="font-size: 2.7rem; line-height: 1; letter-spacing: -0.02em;">
        salvee<sup style="font-size: 0.38em; vertical-align: 0.65em; letter-spacing: 0;">®</sup>
      </span>
    </div>

    <div class="absolute bottom-10 left-1/2 -translate-x-1/2">
      <div class="w-24 h-1 bg-white/30 rounded-full"></div>
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
