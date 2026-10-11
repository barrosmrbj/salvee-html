// Regras de cadastro usadas no servidor (o app confere as mesmas em src/utils/validation.ts)
const PASSWORD_MIN = 8
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function isEmail(email) {
  return EMAIL_RE.test(email) && email.length <= 254
}

// mensagem de erro ou null; senhas antigas mais curtas continuam entrando, a regra vale ao criar/trocar
function passwordError(password) {
  const p = String(password || '')
  if (p.length < PASSWORD_MIN) return `A senha precisa ter pelo menos ${PASSWORD_MIN} caracteres`
  if (p.length > 128) return 'A senha pode ter no máximo 128 caracteres'
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return 'A senha precisa ter letras e números'
  return null
}

module.exports = { PASSWORD_MIN, normalizeEmail, isEmail, passwordError }
