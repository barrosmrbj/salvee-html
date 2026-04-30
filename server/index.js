const express = require('express')
const cors = require('cors')
const { initDb } = require('./db')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/feed', require('./routes/feed'))
app.use('/api/institutions', require('./routes/institutions'))
app.use('/api/search', require('./routes/search'))
app.use('/api/donations', require('./routes/donations'))
app.use('/api/gamification', require('./routes/gamification'))
app.use('/api/calendar', require('./routes/calendar'))
app.use('/api/users', require('./routes/users'))

app.get('/api/health', (req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 8000

initDb().then(() => {
  app.listen(PORT, () => console.log(`Salvee API running on http://localhost:${PORT}`))
})
