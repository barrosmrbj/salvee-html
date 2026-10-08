const knex = require('knex')
const path = require('path')

const isProduction = process.env.DB_CLIENT === 'mysql2'

const db = knex(
  isProduction
    ? {
        client: 'mysql2',
        connection: {
          host: process.env.DB_HOST || 'localhost',
          port: Number(process.env.DB_PORT) || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'salvee',
        },
        pool: { min: 0, max: 7 },
      }
    : {
        client: 'better-sqlite3',
        connection: { filename: path.join(__dirname, 'salvee.db') },
        useNullAsDefault: true,
      }
)

async function initDb() {
  // users
  if (!(await db.schema.hasTable('users'))) {
    await db.schema.createTable('users', t => {
      t.string('id').primary()
      t.string('name').notNullable()
      t.string('email').unique().notNullable()
      t.string('password_hash').notNullable()
      t.string('phone')
      t.string('avatar_url')
      t.integer('xp').defaultTo(0)
      t.integer('salves').defaultTo(0)
      t.integer('level').defaultTo(1)
      t.timestamps(true, true)
    })
  }

  // institutions
  if (!(await db.schema.hasTable('institutions'))) {
    await db.schema.createTable('institutions', t => {
      t.string('id').primary()
      t.string('name').notNullable()
      t.string('responsible')
      t.string('contact_email')
      t.string('contact_phone')
      t.string('cnpj')
      t.string('street')
      t.string('city')
      t.string('state')
      t.string('zip')
      t.string('category')
      t.string('subcategory')
      t.text('audience')
      t.string('logo_url')
      t.string('photo_url')
      t.text('mission')
      t.text('history')
      t.integer('founded_year')
      t.string('status').defaultTo('pending')
      t.boolean('verified').defaultTo(false)
      t.text('description')
      t.timestamps(true, true)
    })
  }

  // posts
  if (!(await db.schema.hasTable('posts'))) {
    await db.schema.createTable('posts', t => {
      t.string('id').primary()
      t.string('institution_id').notNullable()
      t.string('type').defaultTo('common')
      t.text('content').notNullable()
      t.string('image_url')
      t.integer('campaign_goal')
      t.integer('campaign_current').defaultTo(0)
      t.string('event_date')
      t.string('event_location')
      t.timestamps(true, true)
    })
  }

  // donations
  if (!(await db.schema.hasTable('donations'))) {
    await db.schema.createTable('donations', t => {
      t.string('id').primary()
      t.string('user_id').notNullable()
      t.string('institution_id').notNullable()
      t.integer('amount').notNullable()
      t.string('payment_method').defaultTo('pix')
      t.boolean('anonymous').defaultTo(false)
      t.string('message')
      t.integer('xp_earned').defaultTo(0)
      t.integer('salves_earned').defaultTo(0)
      t.timestamps(true, true)
    })
  }

  // calendar_registrations
  if (!(await db.schema.hasTable('calendar_registrations'))) {
    await db.schema.createTable('calendar_registrations', t => {
      t.string('id').primary()
      t.string('user_id').notNullable()
      t.string('post_id').notNullable()
      t.unique(['user_id', 'post_id'])
      t.timestamps(true, true)
    })
  }

  // rewards
  if (!(await db.schema.hasTable('rewards'))) {
    await db.schema.createTable('rewards', t => {
      t.string('id').primary()
      t.string('title').notNullable()
      t.text('description')
      t.integer('cost').notNullable()
      t.string('partner_name')
      t.string('partner_logo_url')
      t.timestamps(true, true)
    })
  }

  // column migrations
  if (!(await db.schema.hasColumn('users', 'role'))) {
    await db.schema.alterTable('users', t => t.string('role').defaultTo('user'))
  }
  if (!(await db.schema.hasColumn('institutions', 'responsible_user_id'))) {
    await db.schema.alterTable('institutions', t => t.string('responsible_user_id'))
  }
  if (!(await db.schema.hasColumn('institutions', 'rejection_reason'))) {
    await db.schema.alterTable('institutions', t => t.text('rejection_reason'))
  }
  // doação: pending (aguardando pagamento, sem pontos) → confirmed (credita XP/Salves) | cancelled.
  // As anteriores a esta coluna já tinham creditado os pontos, por isso o padrão é confirmed.
  if (!(await db.schema.hasColumn('donations', 'status'))) {
    await db.schema.alterTable('donations', t => t.string('status').defaultTo('confirmed'))
  }
  if (!(await db.schema.hasColumn('donations', 'confirmed_at'))) {
    await db.schema.alterTable('donations', t => {
      t.timestamp('confirmed_at').nullable()
      t.string('confirmed_by')
    })
  }

  // login social: id do usuário em cada provedor (vincula a conta mesmo se o e-mail mudar lá)
  for (const column of ['google_id', 'facebook_id', 'apple_id']) {
    if (!(await db.schema.hasColumn('users', column))) {
      await db.schema.alterTable('users', t => t.string(column).nullable().unique())
    }
  }

  // e-mail confirmado: contas criadas antes desta coluna ficam como confirmadas (não pedimos de novo)
  if (!(await db.schema.hasColumn('users', 'email_verified'))) {
    await db.schema.alterTable('users', t => t.boolean('email_verified').defaultTo(false))
    await db('users').update({ email_verified: true })
  }

  // links enviados por e-mail (recuperar senha, confirmar e-mail). Guarda só o hash do token.
  if (!(await db.schema.hasTable('email_tokens'))) {
    await db.schema.createTable('email_tokens', t => {
      t.string('id').primary()
      t.string('user_id').notNullable().index()
      t.string('type').notNullable() // reset | verify
      t.string('token_hash').notNullable().unique()
      t.timestamp('expires_at').notNullable()
      t.timestamp('used_at').nullable()
      t.timestamps(true, true)
    })
  }

  // publicações criadas pela instituição (spec 12): título, várias imagens, prazo da campanha,
  // instruções do evento e quem criou. images = JSON com até 5 links /uploads/...
  const postColumns = {
    title: t => t.string('title'),
    images: t => t.text('images'),
    campaign_deadline: t => t.string('campaign_deadline'),
    event_instructions: t => t.text('event_instructions'),
    created_by: t => t.string('created_by'),
  }
  for (const [column, add] of Object.entries(postColumns)) {
    if (!(await db.schema.hasColumn('posts', column))) await db.schema.alterTable('posts', add)
  }
  // doação feita pelo botão Doar de uma campanha: soma em posts.campaign_current quando confirmada
  if (!(await db.schema.hasColumn('donations', 'post_id'))) {
    await db.schema.alterTable('donations', t => t.string('post_id'))
  }

  // curtidas e comentários das publicações (spec 11.8 e 23.1)
  // no MySQL já nascem na collation do resto do banco (ver unifyMysqlCollation)
  const sameCollation = t => { if (isProduction) { t.charset('utf8mb4'); t.collate(MYSQL_COLLATION) } }
  if (!(await db.schema.hasTable('post_likes'))) {
    await db.schema.createTable('post_likes', t => {
      sameCollation(t)
      t.string('id', 36).primary()
      t.string('post_id', 36).notNullable().index()
      t.string('user_id', 36).notNullable()
      t.unique(['post_id', 'user_id']) // cada pessoa curte uma vez
      t.timestamps(true, true)
    })
  }
  if (!(await db.schema.hasTable('post_comments'))) {
    await db.schema.createTable('post_comments', t => {
      sameCollation(t)
      t.string('id', 36).primary()
      t.string('post_id', 36).notNullable().index()
      t.string('user_id', 36).notNullable()
      t.text('content').notNullable()
      t.timestamps(true, true)
    })
  }

  // falha aqui não pode impedir o servidor de subir: só registra no log
  if (isProduction) await unifyMysqlCollation().catch(err => console.error('Falha ao unificar a collation:', err.message))
  await normalizeUploadUrls()

  console.log('Database ready')
}

// MySQL/MariaDB: todas as colunas de texto com a mesma collation. As tabelas importadas pelo
// phpMyAdmin vieram em utf8mb4_unicode_ci, mas colunas/tabelas criadas depois pelo initDb() pegam o
// padrão do servidor (na Hostinger, utf8mb4_uca1400_ai_ci). Comparar uma com a outra num JOIN dá
// "Illegal mix of collations". Converte as tabelas que destoam; idempotente, roda a cada subida.
const MYSQL_COLLATION = 'utf8mb4_unicode_ci'

async function unifyMysqlCollation() {
  const [rows] = await db.raw(
    `SELECT DISTINCT TABLE_NAME AS name FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND COLLATION_NAME IS NOT NULL AND COLLATION_NAME <> ?`,
    [MYSQL_COLLATION]
  )
  for (const { name } of rows) {
    await db.raw(`ALTER TABLE ?? CONVERT TO CHARACTER SET utf8mb4 COLLATE ${MYSQL_COLLATION}`, [name])
    console.log(`Tabela ${name} convertida para ${MYSQL_COLLATION}`)
  }
  // tabelas novas já nascem com a mesma collation (se o usuário do banco puder alterar o padrão)
  await db.raw(`ALTER DATABASE ?? CHARACTER SET utf8mb4 COLLATE ${MYSQL_COLLATION}`, [process.env.DB_NAME])
    .catch(() => { /* sem permissão: a conversão acima continua corrigindo a cada subida */ })
}

// Links de imagem enviada eram salvos com o domínio (http://localhost:8000/uploads/x.jpg,
// https://darkblue-…/uploads/x.jpg). Agora são relativos (/uploads/x.jpg) e valem em qualquer
// domínio. Converte os antigos; idempotente, roda a cada subida.
const UPLOAD_URL_COLUMNS = [
  ['users', 'avatar_url'],
  ['institutions', 'logo_url'],
  ['institutions', 'photo_url'],
  ['posts', 'image_url'],
  ['rewards', 'partner_logo_url'],
]

async function normalizeUploadUrls() {
  for (const [table, column] of UPLOAD_URL_COLUMNS) {
    const rows = await db(table).select('id', column).where(column, 'like', 'http%/uploads/%')
    for (const row of rows) {
      const relative = row[column].replace(/^https?:\/\/[^/]+(?=\/uploads\/)/, '')
      if (relative !== row[column]) await db(table).where({ id: row.id }).update({ [column]: relative })
    }
  }
}

module.exports = { db, initDb }
