// Envio de e-mail pelo SMTP da Hostinger (caixa criada no hPanel → E-mails).
// Liga quando SMTP_USER e SMTP_PASS existem. Sem eles: em dev o e-mail sai no log do servidor
// (para testar os links); em produção nada é enviado e as rotas avisam que o recurso não está disponível.
const nodemailer = require('nodemailer')

const isProduction = process.env.NODE_ENV === 'production'

function mailEnabled() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
}

let transport = null
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT) || 465
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port,
      secure: port === 465, // 465 = SSL; 587 = STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return transport
}

// true = enviado (ou registrado no log em dev); false = envio indisponível
async function sendMail({ to, subject, text, html }) {
  if (!mailEnabled()) {
    if (isProduction) return false
    console.log(`[E-MAIL - só em dev, sem SMTP] Para: ${to}\nAssunto: ${subject}\n${text}\n`)
    return true
  }
  const from = process.env.MAIL_FROM || `Salvee <${process.env.SMTP_USER}>`
  await getTransport().sendMail({ from, to, subject, text, html })
  return true
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// layout único dos e-mails: saudação, texto, botão laranja e o link por extenso
function layout({ name, intro, button, url, outro }) {
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:16px;padding:32px">
      <tr><td style="font-size:24px;font-weight:bold;color:#FF6B00;padding-bottom:16px">Salvee</td></tr>
      <tr><td style="font-size:16px;padding-bottom:8px">Olá, ${escapeHtml(name)}!</td></tr>
      <tr><td style="font-size:15px;line-height:1.5;padding-bottom:24px">${escapeHtml(intro)}</td></tr>
      <tr><td align="center" style="padding-bottom:24px">
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:12px">${escapeHtml(button)}</a>
      </td></tr>
      <tr><td style="font-size:13px;color:#6b7280;line-height:1.5;padding-bottom:8px">${escapeHtml(outro)}</td></tr>
      <tr><td style="font-size:12px;color:#9ca3af;word-break:break-all">Se o botão não funcionar, copie este endereço no navegador:<br>${escapeHtml(url)}</td></tr>
    </table>
  </td></tr></table></body></html>`
  const text = `Olá, ${name}!\n\n${intro}\n\n${button}: ${url}\n\n${outro}`
  return { html, text }
}

module.exports = { mailEnabled, sendMail, layout }
