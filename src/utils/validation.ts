// Mesmas regras de server/validation.js (o servidor confere de novo)
export const PASSWORD_MIN = 8
export const PASSWORD_HINT = `Mínimo de ${PASSWORD_MIN} caracteres, com letras e números`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim()) && email.trim().length <= 254
}

/** mensagem de erro ou null */
export function passwordError(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres`
  if (password.length > 128) return 'A senha pode ter no máximo 128 caracteres'
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'A senha precisa ter letras e números'
  return null
}
