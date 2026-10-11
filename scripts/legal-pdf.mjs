// Gera os PDFs dos Termos de uso e da Política de privacidade em "Plano de Negócio/docs/",
// com o mesmo texto do app (src/content/legal.ts + src/config/empresa.ts).
// Uso: npm run legal:pdf   (precisa do Google Chrome ou do Microsoft Edge instalado)
import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import * as esbuild from 'esbuild'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'Plano de Negócio', 'docs')

// compila legal.ts (com o atalho @/ → src/) e importa o resultado
const res = await esbuild.build({
  entryPoints: [path.join(root, 'src/content/legal.ts')],
  bundle: true, write: false, format: 'esm', platform: 'node',
  plugins: [{ name: 'alias', setup(b) { b.onResolve({ filter: /^@\// }, a => {
    const base = path.join(root, 'src', a.path.slice(2))
    return { path: ['.ts', '/index.ts', '.json'].map(e => base + e).find(f => fs.existsSync(f)) }
  }) } }],
})
const mod = await import('data:text/javascript;base64,' + Buffer.from(res.outputFiles[0].text).toString('base64'))
const { LEGAL_VERSION } = await import('data:text/javascript;base64,' + Buffer.from(
  (await esbuild.build({ entryPoints: [path.join(root, 'src/config/empresa.ts')], bundle: true, write: false, format: 'esm', platform: 'node' })).outputFiles[0].text,
).toString('base64'))

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const mark = s => esc(s).replace(/\[[^\]]*a definir\]/g, m => `<span class="todo">${m}</span>`)
const logo = pathToFileURL(path.join(root, 'public/icons/salvee-192.png')).href

function html(doc) {
  const body = doc.secoes.map(s => `<h2>${esc(s.titulo)}</h2>` + s.blocos.map(b =>
    Array.isArray(b) ? `<ul>${b.map(i => `<li>${mark(i)}</li>`).join('')}</ul>` : `<p>${mark(b)}</p>`).join('')).join('')
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(doc.titulo)} — Salvee</title>
<style>
@page { size: A4; margin: 22mm 20mm 20mm; }
body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 10.5pt; line-height: 1.5; }
header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #FF6B00; padding-bottom: 10px; margin-bottom: 14px; }
header img { width: 44px; height: 44px; border-radius: 10px; }
header .t { font-size: 20pt; font-weight: 700; color: #111827; }
header .s { font-size: 9pt; color: #FF6B00; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; }
.draft { background: #FFF7ED; border: 1px solid #FDBA74; border-radius: 6px; padding: 8px 10px; font-size: 9pt; color: #9A3412; margin-bottom: 10px; }
.resumo { background: #F3F4F6; border-radius: 6px; padding: 8px 10px; font-size: 9.5pt; color: #4B5563; }
h2 { font-size: 12pt; color: #111827; margin: 16px 0 4px; break-after: avoid; }
p { margin: 4px 0; text-align: justify; }
ul { margin: 4px 0 4px 18px; padding: 0; } li { margin: 2px 0; text-align: justify; }
.todo { background: #FEF08A; font-weight: 600; padding: 0 2px; }
</style></head><body>
<header><img src="${logo}" alt=""><div><div class="s">Salvee</div><div class="t">${esc(doc.titulo)}</div></div></header>
<div class="draft"><b>Rascunho para análise.</b> Texto igual ao exibido no app. Trechos destacados em amarelo dependem de dados da empresa. Recomenda-se revisão jurídica antes da publicação nas lojas de aplicativos.</div>
<div class="resumo">${mark(doc.resumo)}</div>
${body}
</body></html>`
}

const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
]
const browser = browsers.find(b => fs.existsSync(b))
if (!browser) { console.error('Chrome/Edge não encontrado'); process.exit(1) }

fs.mkdirSync(outDir, { recursive: true })
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'salvee-legal-'))
for (const [doc, nome] of [[mod.termos(), 'Termos-de-uso'], [mod.privacidade(), 'Politica-de-privacidade']]) {
  const htmlFile = path.join(tmp, `${nome}.html`)
  fs.writeFileSync(htmlFile, html(doc))
  const pdf = path.join(outDir, `Salvee-${nome}-v${LEGAL_VERSION}.pdf`)
  execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files',
    `--print-to-pdf=${pdf}`, pathToFileURL(htmlFile).href], { stdio: 'ignore' })
  console.log('gerado:', path.relative(root, pdf))
}
fs.rmSync(tmp, { recursive: true, force: true })
