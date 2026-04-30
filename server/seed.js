const { db, initDb } = require('./db')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

async function seed() {
  await initDb()

  // Clear tables
  await db('calendar_registrations').delete()
  await db('donations').delete()
  await db('posts').delete()
  await db('institutions').delete()
  await db('rewards').delete()
  await db('users').delete()

  // Users
  const userId = uuidv4()
  await db('users').insert({
    id: userId,
    name: 'José Felipe Amorim',
    email: 'jose@salvee.com',
    password_hash: await bcrypt.hash('123456', 10),
    xp: 350,
    salves: 500,
    level: 5,
  })

  // Institutions
  const inst1 = uuidv4()
  const inst2 = uuidv4()
  const inst3 = uuidv4()
  await db('institutions').insert([
    { id: inst1, name: 'Instituto Esperança', category: 'Crianças', verified: 1, status: 'approved', description: 'Trabalhamos para transformar a vida de crianças carentes.', mission: 'Garantir um futuro melhor.', history: 'Fundada em 2010.', founded_year: 2010, contact_phone: '(92) 99999-9999', cnpj: '00.000.000/0001-00', city: 'Manaus', state: 'AM' },
    { id: inst2, name: 'Lar dos Idosos Felizes', category: 'Idosos', verified: 1, status: 'approved', description: 'Cuidamos de idosos em situação de vulnerabilidade.', city: 'Manaus', state: 'AM' },
    { id: inst3, name: 'ONG Verde', category: 'Meio Ambiente', verified: 0, status: 'approved', description: 'Protegendo o meio ambiente amazônico.', city: 'Manaus', state: 'AM' },
  ])

  // Posts
  await db('posts').insert([
    { id: uuidv4(), institution_id: inst1, type: 'campaign', content: 'Ajude-nos a construir uma nova ala para crianças carentes. Cada doação faz a diferença!', campaign_goal: 10000, campaign_current: 6500 },
    { id: uuidv4(), institution_id: inst2, type: 'common', content: 'Hoje nossos residentes receberam a visita de uma turma de escola. Momentos assim enchem nossos corações!' },
    { id: uuidv4(), institution_id: inst3, type: 'event', content: 'Mutirão de limpeza no Rio Negro. Venha participar e fazer parte da mudança!', event_date: new Date(Date.now() + 86400000 * 3).toISOString(), event_location: 'Praia da Ponta Negra' },
    { id: uuidv4(), institution_id: inst1, type: 'common', content: 'Recebemos uma doação incrível de livros esta semana! Obrigado a todos que contribuíram.' },
  ])

  // Rewards
  await db('rewards').insert([
    { id: uuidv4(), title: 'Xbox Gamepass', description: '3 Meses Ultimate', cost: 250, partner_name: 'Xbox' },
    { id: uuidv4(), title: 'Café Grátis', description: '1 café expresso', cost: 50, partner_name: 'Café Local' },
    { id: uuidv4(), title: 'Desconto iFood', description: 'R$ 20 de desconto', cost: 100, partner_name: 'iFood' },
  ])

  console.log('Seed completo!')
  console.log('Login de teste: jose@salvee.com / 123456')
  await db.destroy()
}

seed().catch(err => { console.error(err); process.exit(1) })
