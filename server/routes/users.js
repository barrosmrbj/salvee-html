const express = require('express')
const bcrypt = require('bcryptjs')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

function formatUser(u) {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatar_url, xp: u.xp, salves: u.salves, level: u.level, role: u.role || 'user', emailVerified: Boolean(u.email_verified), accountType: u.account_type || 'user', createdAt: u.created_at }
}

async function getUser(req, res) {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
}

async function updateUser(req, res) {
  try {
    // só os campos enviados (antes, mandar um só apagava os outros)
    const update = {}
    if (typeof req.body.name === 'string' && req.body.name.trim()) update.name = req.body.name.trim().slice(0, 120)
    if (req.body.avatarUrl !== undefined) {
      // só foto enviada pelo próprio app (POST /upload)
      const url = req.body.avatarUrl ? String(req.body.avatarUrl) : null
      if (url && !/^\/uploads\/[\w.-]+$/.test(url)) return res.status(400).json({ error: 'Foto inválida' })
      update.avatar_url = url
    }
    // escolha "Qual é o seu perfil?" depois do cadastro (spec 6.3)
    if (['user', 'institution'].includes(req.body.accountType)) update.account_type = req.body.accountType
    if (Object.keys(update).length) await db('users').where({ id: req.userId }).update({ ...update, updated_at: new Date() })
    const user = await db('users').where({ id: req.userId }).first()
    res.json(formatUser(user))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
}

// DELETE /users/me  { confirm: 'EXCLUIR', password }
// Exclusão definitiva da conta (LGPD art. 18 e regras das lojas). Apaga os dados pessoais e a atividade;
// as doações ficam, sem nome nem mensagem, porque a instituição e a lei precisam do registro do valor.
// Conta criada pelo login social não tem senha conhecida: basta a confirmação.
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db('users').where({ id: req.userId }).first()
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
    if (String(req.body.confirm || '').trim().toUpperCase() !== 'EXCLUIR') {
      return res.status(400).json({ error: 'Digite EXCLUIR para confirmar' })
    }
    const social = Boolean(user.google_id || user.facebook_id || user.apple_id)
    if (!social || req.body.password) {
      if (!req.body.password || !(await bcrypt.compare(String(req.body.password), user.password_hash))) {
        return res.status(400).json({ error: 'Senha incorreta' })
      }
    }
    if (user.role === 'admin') {
      const [{ n }] = await db('users').where({ role: 'admin' }).count({ n: '*' })
      if (Number(n) <= 1) return res.status(409).json({ error: 'Você é o único administrador. Promova outra pessoa a admin antes de excluir a sua conta.' })
    }
    // instituição publicada tem doações e seguidores: não some junto com a conta do responsável
    const published = await db('institutions').where({ responsible_user_id: user.id, status: 'approved' }).first()
    if (published) {
      return res.status(409).json({ error: `Sua conta é a responsável pela instituição "${published.name}", que está publicada. Fale com o suporte para transferir ou encerrar a instituição antes de excluir a conta.` })
    }

    await db.transaction(async trx => {
      const own = (await trx('institutions').where({ responsible_user_id: user.id }).select('id')).map(i => i.id)
      if (own.length) {
        await trx('institution_follows').whereIn('institution_id', own).delete()
        await trx('institutions').whereIn('id', own).delete() // rascunho, em análise, correção ou reprovada
      }
      for (const table of ['post_likes', 'post_comments', 'institution_follows', 'calendar_registrations', 'email_tokens', 'user_rewards']) {
        await trx(table).where({ user_id: user.id }).delete()
      }
      await trx('user_rewards').where({ validated_by: user.id }).update({ validated_by: null })
      await trx('settings').where({ updated_by: user.id }).update({ updated_by: null })
      await trx('donations').where({ user_id: user.id }).update({ message: null, anonymous: true, updated_at: new Date() })
      await trx('users').where({ id: user.id }).delete()
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[excluir conta]', err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/me', authMiddleware, getUser)
router.patch('/me', authMiddleware, updateUser)
router.get('/profile', authMiddleware, getUser)
router.put('/profile', authMiddleware, updateUser)

module.exports = router
