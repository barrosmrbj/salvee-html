// node server/seed-institutions.js
const { db } = require('./db')

const institutions = [
  {
    id: 'inst-lar-sao-jose',
    name: 'Lar São José',
    responsible: 'Maria Aparecida Silva',
    contact_email: 'contato@larsaojose.org.br',
    contact_phone: '(11) 98765-4321',
    category: 'Idosos',
    subcategory: 'Acolhimento',
    city: 'São Paulo',
    state: 'SP',
    audience: 'Idosos em situação de vulnerabilidade social',
    logo_url: '/logos/lar-sao-jose.svg',
    photo_url: '/logos/lar-sao-jose.svg',
    mission: 'Oferecer acolhimento digno e cuidados especializados a idosos carentes.',
    history: 'Fundado em 1998 por voluntários, o Lar São José já acolheu mais de 500 idosos.',
    founded_year: 1998,
    status: 'approved',
    verified: 1,
    description: 'Lar de acolhimento para idosos em situação de vulnerabilidade.',
  },
  {
    id: 'inst-casa-esperanca',
    name: 'Casa Esperança',
    responsible: 'João Carlos Mendes',
    contact_email: 'info@casaesperanca.org.br',
    contact_phone: '(21) 97654-3210',
    category: 'Crianças',
    subcategory: 'Educação',
    city: 'Rio de Janeiro',
    state: 'RJ',
    audience: 'Crianças de 4 a 14 anos em situação de risco',
    logo_url: '/logos/casa-esperanca.svg',
    photo_url: '/logos/casa-esperanca.svg',
    mission: 'Garantir educação e afeto para crianças em situação de risco.',
    history: 'A Casa Esperança nasceu em 2003 da iniciativa de uma professora comprometida.',
    founded_year: 2003,
    status: 'approved',
    verified: 1,
    description: 'Abrigo e centro educacional para crianças carentes.',
  },
  {
    id: 'inst-ong-raizes',
    name: 'ONG Raízes',
    responsible: 'Ana Paula Rocha',
    contact_email: 'raizes@ongraizes.org.br',
    contact_phone: '(31) 96543-2109',
    category: 'Educação',
    subcategory: 'Capacitação',
    city: 'Belo Horizonte',
    state: 'MG',
    audience: 'Jovens de 15 a 25 anos em vulnerabilidade',
    logo_url: '/logos/ong-raizes.svg',
    photo_url: '/logos/ong-raizes.svg',
    mission: 'Conectar jovens às suas raízes culturais e profissionais via educação.',
    history: 'Criada em 2010 por educadores comprometidos com a transformação social.',
    founded_year: 2010,
    status: 'approved',
    verified: 1,
    description: 'Capacitação profissional e cultural para jovens em vulnerabilidade.',
  },
  {
    id: 'inst-proj-sementes',
    name: 'Projeto Sementes',
    responsible: 'Carlos Eduardo Lima',
    contact_email: 'sementes@projsementes.org',
    contact_phone: '(41) 95432-1098',
    category: 'Saúde',
    subcategory: 'Segurança Alimentar',
    city: 'Curitiba',
    state: 'PR',
    audience: 'Famílias em vulnerabilidade alimentar',
    logo_url: '/logos/proj-sementes.svg',
    photo_url: '/logos/proj-sementes.svg',
    mission: 'Promover saúde e segurança alimentar para famílias carentes.',
    history: 'Fundado em 2015, distribui cestas e orientação nutricional semanalmente.',
    founded_year: 2015,
    status: 'approved',
    verified: 1,
    description: 'Segurança alimentar e promoção de saúde para famílias carentes.',
  },
  {
    id: 'inst-instituto-luz',
    name: 'Instituto Luz',
    responsible: 'Fernanda Costa',
    contact_email: 'luz@institutoluz.org.br',
    contact_phone: '(51) 94321-0987',
    category: 'Saúde',
    subcategory: 'Saúde Mental',
    city: 'Porto Alegre',
    state: 'RS',
    audience: 'Pessoas com transtornos mentais sem acesso a tratamento',
    logo_url: '/logos/instituto-luz.svg',
    photo_url: '/logos/instituto-luz.svg',
    mission: 'Iluminar vidas através do acesso à saúde mental gratuita.',
    history: 'Criado em 2018 por psicólogos voluntários comprometidos com Porto Alegre.',
    founded_year: 2018,
    status: 'approved',
    verified: 1,
    description: 'Saúde mental gratuita para populações vulneráveis.',
  },
]

async function seed() {
  console.log('Seeding institutions...')
  const now = new Date().toISOString()
  for (const inst of institutions) {
    const exists = await db('institutions').where({ id: inst.id }).first()
    if (!exists) {
      await db('institutions').insert({ ...inst, created_at: now, updated_at: now })
      console.log(`✓ Inserida: ${inst.name}`)
    } else {
      await db('institutions').where({ id: inst.id }).update({ ...inst, updated_at: now })
      console.log(`↺ Atualizada: ${inst.name}`)
    }
  }
  console.log('Concluído!')
  await db.destroy()
}

seed().catch(e => { console.error(e); process.exit(1) })
