// node server/scripts/exportar-mysql.js
//
// Gera server/export/salvee-mysql.sql a partir do SQLite local (server/salvee.db),
// para importar no phpMyAdmin da Hostinger (banco u526770669_salvee).
//
// O SQL gerado:
//   1. cria as tabelas que não existirem (CREATE TABLE IF NOT EXISTS), no formato do initDb();
//   2. adiciona as colunas que faltarem em tabelas que já existem (ex.: users.role);
//   3. copia todas as linhas: o que já existe (mesmo id ou mesmo e-mail) é ATUALIZADO com o dado local,
//      o resto é inserido. Nada que só existe no MySQL é apagado.
//
// Em users, o conflito por e-mail mantém o id que já está no MySQL e atualiza os demais campos.
const fs = require('fs')
const path = require('path')
const knex = require('knex')

const sqlite = knex({
  client: 'better-sqlite3',
  connection: { filename: path.join(__dirname, '..', 'salvee.db') },
  useNullAsDefault: true,
})
// só para montar o SQL com o escape do MySQL (não conecta)
const mysql = knex({ client: 'mysql2' })

// ordem de importação (tabelas referenciadas primeiro)
const TABELAS = ['users', 'institutions', 'posts', 'rewards', 'donations', 'calendar_registrations']
const UNICOS = {
  users: [['email']],
  calendar_registrations: [['user_id', 'post_id']],
}

function tipoMysql(tipo) {
  const t = (tipo || '').toLowerCase()
  if (t.startsWith('varchar')) return tipo.toUpperCase()
  if (t === 'integer') return 'INT'
  if (t === 'boolean') return 'TINYINT(1)'
  if (t === 'datetime') return 'DATETIME'
  return 'TEXT'
}

function defaultMysql(col) {
  const d = col.dflt_value
  if (d == null) return ''
  if (/^current_timestamp$/i.test(d)) return ' DEFAULT CURRENT_TIMESTAMP'
  return ` DEFAULT ${d}` // já vem com aspas do SQLite ('user', '0', ...)
}

function definicaoColuna(col) {
  if (col.name === 'id') return '`id` VARCHAR(36) NOT NULL'
  const notNull = col.notnull ? ' NOT NULL' : ''
  return `\`${col.name}\` ${tipoMysql(col.type)}${notNull}${defaultMysql(col)}`
}

// '2026-09-08T15:57:46.025Z' → '2026-09-08 15:57:46' (DATETIME do MySQL não aceita o formato ISO)
function normalizarValor(v) {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
    return v.slice(0, 19).replace('T', ' ')
  }
  return v
}

async function main() {
  const saida = [
    '-- Salvee: cópia do SQLite local para o MySQL da Hostinger',
    `-- Gerado em ${new Date().toISOString()} por server/scripts/exportar-mysql.js`,
    '-- Importar no phpMyAdmin (banco u526770669_salvee → Importar). Pode ser importado mais de uma vez.',
    '',
    'SET NAMES utf8mb4;',
    '',
  ]
  const resumo = []

  for (const tabela of TABELAS) {
    const colunas = await sqlite.raw(`PRAGMA table_info(${tabela})`)
    if (!colunas.length) continue

    // 1. tabela
    const defs = colunas.map(definicaoColuna)
    defs.push('PRIMARY KEY (`id`)')
    for (const unico of UNICOS[tabela] || []) {
      defs.push(`UNIQUE KEY \`${tabela}_${unico.join('_')}_unique\` (${unico.map(c => `\`${c}\``).join(', ')})`)
    }
    saida.push(`-- ${tabela}`)
    saida.push(`CREATE TABLE IF NOT EXISTS \`${tabela}\` (\n  ${defs.join(',\n  ')}\n) DEFAULT CHARSET=utf8mb4;`)

    // 2. colunas que faltarem (funciona em MySQL e MariaDB, sem ADD COLUMN IF NOT EXISTS)
    for (const col of colunas) {
      if (col.name === 'id') continue
      const alter = `ALTER TABLE \`${tabela}\` ADD COLUMN ${definicaoColuna(col)}`.replace(/'/g, "''")
      saida.push(
        `SET @s = (SELECT IF(COUNT(*) = 0, '${alter}', 'SELECT 1') FROM information_schema.columns ` +
        `WHERE table_schema = DATABASE() AND table_name = '${tabela}' AND column_name = '${col.name}');`,
        'PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st;'
      )
    }

    // 3. dados
    const linhas = await sqlite(tabela).select()
    const nomes = colunas.map(c => c.name)
    const atualizar = nomes.filter(n => n !== 'id')
    for (const linha of linhas) {
      const registro = Object.fromEntries(nomes.map(n => [n, normalizarValor(linha[n])]))
      saida.push(mysql(tabela).insert(registro).onConflict().merge(atualizar).toString() + ';')
    }
    resumo.push(`${tabela}: ${linhas.length}`)
    saida.push('')
  }

  const dir = path.join(__dirname, '..', 'export')
  fs.mkdirSync(dir, { recursive: true })
  const arquivo = path.join(dir, 'salvee-mysql.sql')
  fs.writeFileSync(arquivo, saida.join('\n'), 'utf8')
  console.log(`Gerado ${path.relative(process.cwd(), arquivo)} — ${resumo.join(', ')}`)
}

main()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => Promise.all([sqlite.destroy(), mysql.destroy()]))
