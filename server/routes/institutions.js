const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { db } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const list = await db('institutions').where({ status: 'approved' }).orderBy('name')
    res.json(list.map(formatInst))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const inst = await db('institutions').where({ id: req.params.id }).first()
    if (!inst) return res.status(404).json({ error: 'Instituição não encontrada' })
    res.json(formatInst(inst))
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/register/step', authMiddleware, async (req, res) => {
  try {
    const { step, data, institutionId } = req.body
    let id = institutionId

    if (step === 1 || !id) {
      id = uuidv4()
      await db('institutions').insert({ id, name: data.name || '', status: 'pending', ...flattenStep(step, data) })
    } else {
      await db('institutions').where({ id }).update(flattenStep(step, data))
    }

    res.json({ institutionId: id, step })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

function flattenStep(step, data) {
  const maps = {
    1: { name: data.name, responsible: data.responsible, contact_email: data.contact_email, contact_phone: data.contact_phone },
    2: { cnpj: data.cnpj, street: data.street, city: data.city, state: data.state, zip: data.zip },
    3: { category: data.category, subcategory: data.subcategory, audience: data.audience },
    4: { logo_url: data.logo_url, photo_url: data.photo_url },
    5: { mission: data.mission, founded_year: data.founded_year ? Number(data.founded_year) : null, history: data.history },
    6: {},
  }
  return maps[step] || {}
}

function formatInst(i) {
  return {
    id: i.id,
    name: i.name,
    category: i.category || '',
    verified: Boolean(i.verified),
    status: i.status,
    description: i.description || '',
    logoUrl: i.logo_url,
    photos: i.photo_url ? [i.photo_url] : [],
    cnpj: i.cnpj,
    phone: i.contact_phone,
    address: i.street ? { street: i.street, city: i.city || '', state: i.state || '' } : undefined,
    mission: i.mission,
    history: i.history,
    foundedYear: i.founded_year,
  }
}

module.exports = router
