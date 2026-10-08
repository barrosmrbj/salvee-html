const fs = require('fs')
const os = require('os')
const path = require('path')

// Pasta das imagens enviadas. Em produção, UPLOAD_DIR aponta para fora do app (ex.:
// /home/<usuario>/salvee-uploads): a Hostinger recria a pasta do app a cada deploy e
// apagaria as fotos. Sem a variável, usa server/uploads (dev).
const BUNDLED_DIR = path.join(__dirname, 'uploads')
const raw = (process.env.UPLOAD_DIR || '').trim()
const UPLOADS_DIR = raw ? path.resolve(raw.replace(/^~(?=$|[\\/])/, os.homedir())) : BUNDLED_DIR

fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// As imagens versionadas em server/uploads vão junto no deploy: copia para a pasta
// externa as que ainda não existem lá (nunca sobrescreve).
if (UPLOADS_DIR !== BUNDLED_DIR && fs.existsSync(BUNDLED_DIR)) {
  for (const name of fs.readdirSync(BUNDLED_DIR)) {
    const src = path.join(BUNDLED_DIR, name)
    const dest = path.join(UPLOADS_DIR, name)
    if (fs.statSync(src).isFile() && !fs.existsSync(dest)) fs.copyFileSync(src, dest)
  }
}

module.exports = { UPLOADS_DIR }
