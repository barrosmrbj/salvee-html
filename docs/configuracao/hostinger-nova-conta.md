# Publicar o Salvee numa conta nova da Hostinger (plano Business)

Domínio provisório: `https://magenta-jay-118109.hostingersite.com`.

## Por que aparecia "Este endereço não é mais usado"

O repositório foi importado como **site estático** (Git → `public_html`). Assim o servidor (Express)
não roda, o painel de **variáveis de ambiente não existe** e o `.htaccess` antigo mostrava a página de
aviso. Desde a v1.20.2, se isso acontecer de novo, o site estático mostra o app, mas sem API (`/api` → 503).

## Passo a passo

1. hPanel → **Sites** → remover o site estático criado por engano (ou desconectar o Git dele).
2. **Sites → Adicionar site → Node.js Apps → Importar do Git** → repositório do Salvee, branch `master`.
3. Configuração: predefinição **Express**, Node **22.x**, diretório raiz `./`, gerenciador **npm**,
   arquivo de entrada `server/index.js`. Ligar a implantação automática.
4. hPanel → **Bancos de dados** → criar banco + usuário MySQL (anotar nome, usuário, senha).
5. No app → **Variáveis de ambiente**:
   - `NODE_ENV=production`
   - `JWT_SECRET=<texto longo e aleatório>`
   - `DB_CLIENT=mysql2`, `DB_HOST=localhost`, `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `PUBLIC_URL=https://magenta-jay-118109.hostingersite.com`
   - `UPLOAD_DIR=/home/<usuario-da-conta>/salvee-uploads` (o usuário começa com `u`, aparece no hPanel)
   - E-mail (opcional): `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (ver `email.md`)
6. Reimplantar o app (botão **Implantar/Redeploy**) para ler as variáveis.
7. Dados: no PC, `node server/scripts/exportar-mysql.js` → importar `server/export/salvee-mysql.sql`
   no phpMyAdmin do banco novo. Fotos: copiar a pasta de uploads da conta antiga para `UPLOAD_DIR`.
8. Teste: `https://magenta-jay-118109.hostingersite.com/api/health` → `{"ok":true,"version":"1.20.2"}`.
9. Conferir que o código não ficou exposto: `/package.json` e `/server/.env` **não** podem abrir.

## Quando comprar o domínio definitivo

hPanel → app → **Domínios** → trocar/adicionar o domínio. Depois, só atualizar `PUBLIC_URL` e, se usar
login social, as URLs de retorno nos provedores (`login-social.md`). Não precisa novo build.
