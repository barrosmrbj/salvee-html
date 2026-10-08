const express = require('express')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

const { UPLOADS_DIR } = require('../uploads')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 1_048_576 }, // 1 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.'))
  },
})

router.post('/', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo recebido' })
  // URL relativa: frontend e API estão no mesmo domínio (em dev, o Vite repassa /uploads para a API).
  // Assim o link salvo no banco continua válido se o domínio mudar.
  res.json({ url: `/uploads/${req.file.filename}` })
})

router.use((err, _req, res, _next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Arquivo muito grande. Máximo: 1 MB.' })
  }
  res.status(400).json({ error: err.message ?? 'Erro no upload' })
})

module.exports = router
