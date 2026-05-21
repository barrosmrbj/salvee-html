// node server/seed-admin.js
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { db, initDb } = require('./db')

async function seed() {
  await initDb()

  const email = 'admin@salvee.com'
  const password = 'Salvee@2025'

  const existing = await db('users').where({ email }).first()
  if (existing) {
    await db('users').where({ email }).update({ role: 'admin', updated_at: new Date().toISOString() })
    console.log(`✓ Role admin confirmado para ${email}`)
  } else {
    const id = uuidv4()
    const password_hash = await bcrypt.hash(password, 10)
    await db('users').insert({
      id,
      name: 'Administrador Salvee',
      email,
      password_hash,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    console.log(`✓ Admin criado: ${email}`)
    console.log(`  Senha: ${password}`)
  }

  await db.destroy()
}

seed().catch(e => { console.error(e); process.exit(1) })
