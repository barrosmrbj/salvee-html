const path = require('path')
const os = require('os')
// Ordem (o dotenv não sobrescreve o que já foi definido): variáveis do painel > server/.env(.production)
// > ~/salvee.env.production. Este último fica fora do repositório e sobrevive aos redeploys da
// Hostinger, que recria a pasta do app a cada push.
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
require('dotenv').config({ path: [path.join(__dirname, envFile), path.join(os.homedir(), 'salvee.env.production')], quiet: true })
const express = require('express')
const cors = require('cors')
const { initDb } = require('./db')
const { UPLOADS_DIR } = require('./uploads')

const isProduction = process.env.NODE_ENV === 'production'
if (isProduction && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET não definido — configure nas variáveis de ambiente do app na Hostinger.')
  process.exit(1)
}

const app = express()

// atrás do proxy da Hostinger: req.protocol passa a refletir o https original
app.set('trust proxy', 1)

// CORS_ORIGIN: domínios do frontend separados por vírgula (vazio = qualquer origem, como em dev)
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean)
app.use(cors(corsOrigins.length ? { origin: corsOrigins } : undefined))
app.use(express.json())

app.use('/api/auth/oauth', require('./routes/oauth'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/feed', require('./routes/feed'))
app.use('/api/institutions', require('./routes/institutions'))
app.use('/api/search', require('./routes/search'))
app.use('/api/donations', require('./routes/donations'))
app.use('/api/gamification', require('./routes/gamification'))
app.use('/api/calendar', require('./routes/calendar'))
app.use('/api/users', require('./routes/users'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/upload', require('./routes/upload'))
// imagem inexistente responde 404 (não cai no index.html do frontend)
app.use('/uploads', express.static(UPLOADS_DIR), (req, res) => res.status(404).end())

// versão sincronizada com src/config/versoes.json por `npm run versao:changelog`
const { version } = require('./package.json')
app.get('/api/health', (req, res) => res.json({ ok: true, version }))

// rota de API inexistente responde JSON (não cai no index.html do frontend)
app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada' }))

// frontend: build do Vite em server/public (npm run build na raiz). O router é por hash (#/...),
// então qualquer outro GET devolve o index.html.
const PUBLIC_DIR = path.join(__dirname, 'public')
app.use(express.static(PUBLIC_DIR, {
  // o mime do Express não conhece .webmanifest (sairia text/plain): tipo certo para o "Instalar app" (PWA)
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webmanifest')) res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8')
  },
}))
app.get('*', (req, res, next) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), err => err && next())
})

const PORT = process.env.PORT || 8000

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Salvee API ${version} running on port ${PORT} (${process.env.DB_CLIENT || 'sqlite'}; uploads em ${UPLOADS_DIR})`))
  })
  .catch(err => {
    console.error('Falha ao conectar/preparar o banco:', err.message)
    process.exit(1)
  })
