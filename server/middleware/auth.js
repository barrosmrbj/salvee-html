const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'salvee-dev-secret-change-in-prod'

function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '30d' })
}

module.exports = { authMiddleware, signToken }
