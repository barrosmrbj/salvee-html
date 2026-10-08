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

  await normalizeUploadUrls()

  console.log('Database ready')
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
