# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Visão geral

**Salvee** é um app web mobile-first que conecta doadores e voluntários a instituições sociais: descoberta, doações, eventos e gamificação (XP/Salves). **Especificação oficial: `.Documentacao/Especificação SALVEE.pdf`** (37 páginas; em caso de conflito, vale o PDF). `salvee_especificacao.md` é um resumo antigo e marca como "(implementado)" partes incompletas: não usar como referência de status. **Pendências, comparação com o PDF e próximos passos: `docs/PENDENCIAS.md` (ler no início de cada sessão).** Design e planos originais: `docs/superpowers/`. **Protótipo visual dos designers (Figma, mockups das telas):** https://www.figma.com/proto/E6qAZObrdwAH1WoCLOk8f2/Salvee?node-id=4-340&t=6UThrBMosZ7Zzatf-1 (referência de layout; em conflito de regra, vale o PDF). Imagem estática dos mockups: `.Documentacao/mockups_projeto_salvee.png`.

- **Frontend:** Vite 6 + TypeScript (vanilla, sem framework) + Tailwind 3, em `src/`. **Responsivo, celular primeiro** (`src/styles/global.css`): celular = tela inteira (margens seguras de entalhe, campos com 16px contra o zoom do iPhone, altura `100dvh`); tablet (≥ 768px) = coluna de 640px; computador (≥ 1024px) = coluna de 680px e a barra de baixo vira menu lateral. A largura vem de `--app-max` (classe `max-w-app`): barra fixa nova deve usar `max-w-app` + `left-1/2 -translate-x-1/2`. Instalável na tela inicial (PWA): `public/manifest.webmanifest` e ícones em `public/icons/`.
- **Backend:** Node.js + Express 4 (CommonJS) em `server/`, banco via Knex (SQLite em dev, MySQL em produção).
- **Produção:** Hostinger (hPanel), domínio `skyblue-hedgehog-581364.hostingersite.com`, MySQL `u526770669_salvee`.
- Idioma da interface, dos commits e da documentação: **português (pt-BR)**.

## Comandos

```bash
npm install && npm install --prefix server   # dependências (raiz + server)

npm run dev:all        # frontend (Vite, :5173) + backend (:8000) juntos
npm run dev            # só frontend
npm run dev:server     # só backend (node --watch)

npm run build          # valida versoes.json + tsc --noEmit + vite build → server/public/
npm test               # vitest (jsdom)
npx tsc --noEmit       # checagem de tipos

npm run versao:check       # valida src/config/versoes.json e os package.json
npm run versao:changelog   # sincroniza package.json, gera CHANGELOG.md e o catálogo abaixo

node server/seed.js              # dados de exemplo
node server/seed-institutions.js # instituições de exemplo
node server/seed-admin.js        # cria/promove admin@salvee.com (senha Salvee@2025, trocar em produção)
node server/scripts/exportar-mysql.js  # SQLite local → server/export/salvee-mysql.sql (importar no phpMyAdmin)
```

## Estrutura

```
src/
  main.ts, router.ts      # router por HASH (#/rota), rotas com `protected: true` exigem token
  config/versoes.json     # fonte única de versões (ver "Controle de versão")
  components/             # Button, Input (senha com botão de olho), Toast, Card, Avatar, Badge, BottomNav, BottomSheet, ProgressBar, NumericKeyboard, Spinner, SocialLogin, PostCard, LocationPicker (mapa Leaflet)
  screens/                # cada tela exporta render(): HTMLElement, mount(), unmount()
    auth/                 # login, register, forgot-password, reset-password, verify-email, oauth (retorno do login social)
    onboarding/           # choose-profile, verify-phone (sem uso no fluxo atual), institution-register, welcome-success
    admin/                # institution-approvals, user-management, donation-approvals
    feed, search, calendar, profile, settings, donation, institution-profile, splash, welcome
  services/               # api.ts (request<T>, BASE_URL = VITE_API_URL) + um service por domínio, exportados em index.ts
  types/                  # tipos de domínio, exportados em index.ts
  tests/                  # vitest (jsdom)
server/
  index.js                # Express: /api/*, /api/health (com version), /uploads e o frontend (server/public, fallback index.html)
  db.js                   # conexão Knex + initDb() (cria tabelas e colunas novas na subida, normaliza links de imagem)
  mailer.js               # envio de e-mail (SMTP da Hostinger) e layout dos e-mails
  uploads.js              # pasta das imagens (UPLOAD_DIR ou server/uploads)
  attention.js            # ranking de atenção (doações confirmadas em 30 dias + seguidores): feed, destaques, busca
  middleware/auth.js      # JWT (Bearer), req.userId
  routes/                 # auth, oauth, feed, institutions, search, donations, gamification, calendar, users, admin, upload
  scripts/                # exportar-mysql.js (SQLite local → SQL para o phpMyAdmin)
  seed*.js                # dados de exemplo e criação do admin
  public/                 # BUILD do frontend (npm run build) — gerado, versionado, não editar à mão
  uploads/                # imagens versionadas / pasta padrão em dev (produção usa UPLOAD_DIR)
docs/                     # PENDENCIAS.md, configuracao/ (email.md, login-social.md), superpowers/ (design original)
.Documentacao/            # especificação oficial (PDF), logos, ilustrações e mockups
scripts/versao.mjs        # controle de versão
public/                   # arquivos estáticos de origem do Vite (logos, promos, .htaccess) — copiados para server/public no build
.htaccess                 # site estático da Hostinger: serve server/public/
```

### Rotas do frontend (`src/router.ts`)

`/`, `/welcome`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/oauth` (retorno do login social), `/choose-profile`, `/verify-phone`, `/welcome-success`, `/register/institution`* (`?corrigir=<id>` = corrigir e reenviar), `/institution-status`*, `/feed`*, `/search`*, `/institution/:id`*, `/donate/:id`*, `/calendar`*, `/profile`*, `/settings`*, `/admin/institutions`*, `/admin/users`*, `/admin/donations`*, `/admin/promotions`*, `/post/new?tipo=common|event|campaign`*, `/post/:id`* (detalhe + comentários), `/post/:id/edit`*, `/campanha/:id`* (tela da campanha), `/donate/:id?campanha=<postId>`* (* = protegida).

### API (`server/routes/`, prefixo `/api`)

- `auth`: register (envia "confirme seu e-mail"), login, logout, me (inclui `emailVerified`), forgot-password (link por e-mail, 1 h), reset-password, verify-email, resend-verification, mail-status, send-phone-code, verify-phone. E-mail: `server/mailer.js` (SMTP da Hostinger; sem `SMTP_USER`/`SMTP_PASS`, em dev o e-mail sai no log e em produção as rotas respondem 503 e o cadastro pula a confirmação). Links em `email_tokens` (só o hash). Como configurar: `docs/configuracao/email.md`. A tela `/verify-phone` continua no código, mas o cadastro agora vai para `/verify-email`. SMS ainda sem provedor: em dev o código sai no log do servidor; em produção `send-phone-code` responde 503 e a tela oferece "Pular por enquanto"
- `auth/oauth` (login social, `routes/oauth.js`): `GET /providers` (quais estão configurados), `GET /:provider` (vai para Google/Facebook/Apple), `GET|POST /:provider/callback` (cria ou vincula o usuário por `google_id`/`facebook_id`/`apple_id` ou e-mail confirmado e volta em `#/oauth?token=`; erro volta em `#/login?erro=`). Provedor sem variáveis fica desativado e **o botão não aparece** (sem nenhum configurado, a seção "ou entre com" fica oculta: logos de Google/Apple/Facebook sem login real fizeram o Google Safe Browsing marcar o site como "Perigoso"). Como criar as credenciais: `docs/configuracao/login-social.md` (pendente: o cliente ainda não tem o e-mail do projeto).
- `users`: GET/PATCH `/me` (inclui `role`), GET/PUT `/profile`
- `institutions`: `POST|DELETE /:id/follow` (seguir; só aprovadas), `GET /:id` traz `following` e `followersCount`; lista, `/destaques`, `/mine` (instituições do usuário, qualquer status, com motivo), `/mine/:id` (dados completos para corrigir, só responsável/admin/gestor), `/:id`, `POST /register/step` (etapa com `institutionId` atualiza, nunca duplica; etapa vazia é ignorada), `POST /:id/submit` (draft ou needs_revision → pending; `/resubmit` é o nome antigo)
- `feed` (`routes/feed.js`): `GET /?page=&institutionId=&seguindo=1` (aba "Para você" ranqueada por novidade + afinidade + urgência + engajamento + impulsionamento de quem recebeu menos, com `boosted` = etiqueta "Precisa de apoio"; mural e "Seguindo" em ordem cronológica; cada post traz `images[]`, `registered`, `canEdit`), `GET /:id`, `POST /` (cria post comum, evento ou campanha), `PATCH /:id`, `DELETE /:id`; curtidas `POST|DELETE /:id/like`; comentários `GET|POST /:id/comments` e `DELETE /comments/:commentId` (apagam: autor, instituição dona do post, admin/gestor). Cada post traz também `liked`, `likeCount`, `commentCount`. Só o **responsável por instituição aprovada** cria/edita; excluir também admin/gestor (moderação). Imagens: até 5, só links `/uploads/...`
- `search` (`routes/search.js`): `GET /promocoes` (banners ativos do admin; sem nenhum, campanhas em destaque), `GET /?q=&category=` → `{ institutions, campaigns }` (menos ajudadas primeiro), `/categories` (categorias reais com contagem), `/cities`, `/causas?category=&city=&lat=&lng=` (campanhas em andamento; com GPS do usuário, mais perto primeiro e `distanceKm`; sem, cidade escolhida primeiro); `donations` (`/initiate` com `postId` opcional da campanha, `/history`), `gamification` (`/balance`, `/rewards`, `/rewards/:id/redeem`), `calendar` (`/my-events`, `/events/:id/register`)
- `upload`: POST multipart → pasta `UPLOAD_DIR` (padrão `server/uploads/`); devolve URL **relativa** `/uploads/<arquivo>`
- `admin`: `GET /users?name=&role=` e `PATCH /users/:id/role` (só **admin**); `GET /institutions`, `PATCH /institutions/:id/status`, `GET /donations?status=`, `PATCH /donations/:id/status` e CRUD `/promotions` (**admin** ou **gestor**)

### Papéis e regras

- `users.role`: `user` (padrão), `gestor`, `admin`. A seção de administração em Configurações aparece conforme o papel.
- **Entrada (spec 6.2/6.3):** Boas-vindas → "Comece aqui" → `#/register` (todos criam primeiro o acesso; na instituição, o do responsável) → confirme o e-mail → boas-vindas → `#/choose-profile` "Qual é o seu perfil?" (grava `users.account_type` via `PATCH /users/me`) → Usuário vai ao feed; Instituição vai para `#/register/institution`. O tipo só define o caminho: publicar continua exigindo instituição aprovada. Quem já tem conta cadastra instituição em Configurações → "Cadastrar minha instituição".
- Qualquer usuário logado pode cadastrar uma instituição. As etapas gravam um **rascunho** (`draft`, invisível para admin/gestor, que também não podem aprová-lo); só "Enviar para análise" no fim (`POST /institutions/:id/submit`, confere nome, responsável, contato, categoria e descrição) leva a `pending`; admin/gestor aprova (`approved` → `verified = true`), reprova (`rejected` + `rejection_reason`) ou pede revisão (`needs_revision`, **motivo obrigatório**, uma linha por item a corrigir). O motivo fica em `rejection_reason` e some ao aprovar. Documento da última etapa em `institutions.documents_url` (link no admin).
- **Instituição em validação** (spec 9.4/10): depois do login (`screens/auth/after-login.ts`), quem é responsável por instituição não aprovada vai para `#/institution-status` (Em análise / Correção necessária / Não aprovada / Aprovada). Não bloqueia o resto do app (a pessoa também é doadora); o feed mostra um aviso no topo e Configurações tem o atalho "Minha instituição". Corrigir = `#/register/institution?corrigir=<id>` com os dados já preenchidos → reenviar volta a `pending`.
- Doação nasce `pending` (`donations.status`): aparece no histórico, mas **não credita XP/Salves**. Admin/gestor confirma em Configurações → Confirmar doações (`confirmed` → credita uma única vez, protegido contra confirmação em dobro) ou cancela (`cancelled`). Doações anteriores à coluna ficaram `confirmed`. Quando houver PIX real, o webhook do provedor substitui a confirmação manual.
- Tabelas: `users`, `institutions`, `institution_follows`, `posts`, `post_likes`, `post_comments`, `donations`, `calendar_registrations`, `rewards`, `email_tokens`, `promotions`. Coluna nova = adicionar `hasColumn`/`alterTable` no fim de `initDb()` (vale para SQLite e MySQL).
- **Instituição não aprovada não aparece publicamente** (spec 4.3/11.10): feed, busca, destaques e lista filtram `status = 'approved'`; `GET /institutions/:id` de não aprovada só para o responsável e admin/gestor. Só o responsável (ou admin/gestor) altera os dados (`POST /institutions/register/step` confere `responsible_user_id`).
- **Impulsionamento** (spec 1.4/4.4/11.4/17.5): `server/attention.js` mede a atenção recente de cada instituição aprovada; pesos do feed em `WEIGHTS` (`routes/feed.js`). Destaques = as que menos receberam. Sem nenhuma doação/seguidor ainda, ninguém recebe a etiqueta.
- **Tela Buscar (spec 17 + mockup do Figma):** topo = carrossel "Promoções & metas" (tabela `promotions`, cadastrada em Configurações → Promoções da busca; período e ordem; sem banner ativo mostra as campanhas em destaque); as **categorias** (17.4) ficam no ícone de filtro ao lado de "Causas perto de você", como no mockup. Diferença consciente: o PDF não fala de promoções; o mockup sim.
- **Localização** (spec 17.6): no cadastro da instituição (etapa 2), `LocationPicker` marca o local por GPS de quem cadastra, pelo endereço (Nominatim/OpenStreetMap) ou tocando/arrastando no mapa (Leaflet + OpenStreetMap, sem chave; carregado sob demanda) → `institutions.latitude/longitude`. Na busca, "📍 Perto de mim" é opcional por usuário (preferência em localStorage `salvee_gps`); a posição vai arredondada (~1 km) só na consulta e não é guardada; negou → cidade escolhida. Mapa do Google interativo exigiria chave e cobrança: não usado.
- **Perfil da instituição** (spec 13): carrossel com até 6 fotos (`institutions.photos`, JSON), barra da campanha ativa, aba Info com endereço, CEP, horário (`opening_hours`), telefone (discador), e-mail, mapa (Google Maps embed, sem chave) e rota (Google Maps/Waze). A instituição aprovada edita dados e fotos pela tela "Minha instituição".
- **Publicações** (spec 12): botão "+" do feed só aparece para quem é responsável por instituição aprovada; tela `screens/post-editor.ts`; cartão único `components/PostCard.ts` (feed e mural) com botão por tipo: campanha → **Doar** (`#/donate/:id?campanha=`), evento → **Participar** (agenda), comum → **Ajudar**. Doação de campanha confirmada soma em `posts.campaign_current`.
- **Doação na V1** (spec 14.5/14.10/27.4): só **PIX** aparece e a API grava sempre `payment_method = 'pix'` e `anonymous = 0`. Não mostrar meio de pagamento que não funciona nem doação anônima.
- SQL tem que rodar em **SQLite e MySQL**: nada de `NULLS FIRST/LAST` (usar `COALESCE`), cuidado com funções só de um banco. Nada de `.update({})` vazio (o knex recusa).
- **Collation no MySQL (MariaDB da Hostinger):** tabelas importadas usam `utf8mb4_unicode_ci`, mas o que o `initDb()` cria pega o padrão do servidor (`utf8mb4_uca1400_ai_ci`) e JOIN entre as duas dá "Illegal mix of collations" (só aparece em produção). `unifyMysqlCollation()` no fim do `initDb()` converte as tabelas que destoam a cada subida; tabela nova no MySQL já nasce com `t.charset/t.collate` (ver `post_likes`). Como as mudanças de banco chegam à produção e scripts opcionais para o phpMyAdmin: `docs/configuracao/mysql.md` e `docs/sql/`.

### Diferenças conscientes em relação ao PDF
- Papel **`gestor`** (não existe no PDF): ajuda o admin a aprovar instituições e confirmar doações.
- **Escolha Usuário/Instituição depois de criar a conta** (o PDF põe antes): as duas começam pelo mesmo acesso, o do responsável.
- **Confirmação de cadastro por e-mail** no lugar do SMS (o PDF trata telefone como opcional/futuro).
- **Confirmação manual de doações** por admin/gestor até haver PIX real com webhook.
- Navegação inferior hoje: Feed, Buscar, Agenda, Perfil (gamificação dentro do Perfil). O PDF pede **Feed, Busca, Gamificação, Calendário** + Configurações no topo — pendente.
- O que ainda falta do PDF está em `docs/PENDENCIAS.md` (seção "Comparação com a especificação").

## Ambiente

- Raiz: `.env` (`VITE_API_URL=http://localhost:8000/api`) e `.env.production` (`VITE_API_URL=/api`, relativo: frontend e API no mesmo domínio). Vite injeta no **build**: mudou o domínio, refazer o build.
- `server/.env` (dev, SQLite) e `server/.env.production` (MySQL: `DB_CLIENT=mysql2`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`). `index.js` carrega `.env.production` quando `NODE_ENV=production`.
- Nunca commitar `.env*` nem `server/salvee.db`. Exceção: o `.env.production` da raiz é versionado (só tem `VITE_API_URL=/api`, sem segredos, e o build precisa dele).

## Armadilhas conhecidas

- **Não deixar `.js` compilados em `src/`** ao lado dos `.ts` (ex.: `src/services/index.js`). O Vite resolve o `.js` antigo e os imports novos quebram (ex.: `adminService` "não exportado"). O projeto roda `.ts` direto; `tsc` é só `--noEmit`.
- Imagens enviadas: em produção ficam em `UPLOAD_DIR` (fora do app, sobrevivem ao redeploy); sem a variável, em `server/uploads/`, que **some a cada deploy** na Hostinger. Fazer backup da pasta. Uploads novos de dev não entram no git (`.gitignore`). As imagens versionadas em `server/uploads/` são copiadas para `UPLOAD_DIR` na subida (sem sobrescrever).
- Links de imagem são salvos relativos (`/uploads/x.jpg`); `initDb()` converte os antigos absolutos a cada subida. Em dev, o Vite repassa `/uploads` para a API (`vite.config.ts` → `server.proxy`).
- CORS fica aberto para qualquer origem se `CORS_ORIGIN` não estiver definido; em produção, definir com a URL do frontend.
- `server/public/` é gerado pelo build: não editar à mão. Arquivo estático novo vai em `public/` (raiz) e entra no próximo build.

## Fluxo de trabalho: localhost primeiro, Hostinger depois

Todo ajuste e módulo novo é feito e testado **em localhost**. Só depois sobe para a Hostinger.

1. **Desenvolver local:** `npm run dev:all` (frontend em http://localhost:5173 + API em :8000 com SQLite `server/salvee.db`). Usa o `.env` da raiz (`VITE_API_URL=http://localhost:8000/api`) e o `server/.env`.
2. **Testar local:** conferir no navegador, `npx tsc --noEmit`, `npm test`.
3. **Versionar:** registrar a versão (ver "Controle de versão").
4. **Gerar o build:** `npm run build` → atualiza `server/public/`. **Sempre antes do commit que vai subir**; sem isso a Hostinger publica o build antigo. Para ver localmente como fica em produção (frontend + API num endereço só): `npm run build` e `node server/index.js` → http://localhost:8000.
5. **Commit** (código + `server/public/` + arquivos de versão) **e `git push` na `master`**. A Hostinger implanta a `master` automaticamente. **Push na `master` = publicar em produção.**
6. **Deu errado em produção?** `git revert <commit>` + `git push` (volta o site ao estado anterior, inclusive o build).

Regras:
- **Só existe a branch `master`.** Não criar outras branches nem branch de deploy.
- Não fazer push de algo não testado em localhost. Trabalho em andamento fica só local (sem commit, ou commit sem push); se não ficar bom, desfazer localmente (`git restore`, `git reset`).
- Nunca editar arquivos direto no `public_html` / Gerenciador de Arquivos da Hostinger: o próximo deploy sobrescreve.
- Dados de dev (SQLite) e de produção (MySQL) são bancos separados. Mudança de schema vai no `initDb()` e é aplicada sozinha na subida do servidor nos dois.
- **Levar dados do local para a produção:** `node server/scripts/exportar-mysql.js` gera `server/export/salvee-mysql.sql` (fora do git). Importar no hPanel → Bancos de dados → phpMyAdmin → `u526770669_salvee` → **Importar**. O SQL cria tabelas/colunas que faltarem e faz *upsert*: o dado local sobrescreve o registro de mesmo `id` (ou, em `users`, de mesmo e-mail, mantendo o id da produção); nada que só existe na produção é apagado. Pode ser importado de novo. Fazer backup do banco antes (hPanel → Backups). Imagens em `server/uploads/` não vão junto.

## Deploy na Hostinger (resumo)

**Arquitetura:** um único **Node.js App** (Express) serve frontend + API no domínio `skyblue-hedgehog-581364.hostingersite.com`. O app é ligado ao repositório/`master` (implantação automática a cada push). **Configuração em uso no hPanel:** predefinição Express, branch `master`, Node 22.x, diretório raiz `./`, gerenciador npm, arquivo de entrada `server/index.js`, variáveis no painel do app. Funciona com a raiz do repositório (start `npm start` → `node server/index.js`; o `postinstall` instala as dependências de `server/`) ou com diretório raiz `server`.
- **Como a Hostinger roda Node (visto no SSH):** Phusion Passenger, configurado pelo `.htaccess` gerado em `public_html` (`PassengerAppRoot …/hbuilds/current/nodejs`, `PassengerStartupFile`). Cada deploy recria `hbuilds/versions/<id>/`: arquivo criado à mão dentro do app some no próximo push. O SSH não deixa abrir porta (ECONNREFUSED), então teste de API só pelo domínio.

- O build do Vite vai para `server/public/` (`vite.config.ts` → `build.outDir`), que é **versionado** e precisa ser regerado com `npm run build` antes de cada push. O Express serve essa pasta e devolve `index.html` para qualquer GET fora de `/api` e `/uploads`; rota `/api` inexistente responde 404 em JSON.
- `VITE_API_URL=/api` (relativo) no `.env.production`: sem CORS e sem depender do domínio.
- Configuração do app: Node 20/22, instalação `npm install`, start `npm start`; entrada `server/index.js` (raiz do repo) ou `index.js` (raiz `server`).
- Variáveis de ambiente (no painel do app ou, se o painel não tiver a tela, em `~/salvee.env.production` na home do SSH, fora do repositório e preservado nos redeploys; nunca no git). Ordem: painel > `server/.env(.production)` > `~/salvee.env.production`: `NODE_ENV=production`, `JWT_SECRET`, `DB_CLIENT=mysql2`, `DB_HOST`, `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=u526770669_salvee`, `PUBLIC_URL=https://skyblue-hedgehog-581364.hostingersite.com`. `CORS_ORIGIN` só se outro domínio for chamar a API. E-mail (opcionais): `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `SMTP_HOST` (padrão `smtp.hostinger.com`), `SMTP_PORT` (padrão 465). Login social (opcionais, cada provedor liga quando as suas existem): `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`; `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET`; `APPLE_CLIENT_ID` (Services ID), `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (conteúdo do .p8, quebras de linha como `
`). URL de retorno a cadastrar em cada provedor: `https://skyblue-hedgehog-581364.hostingersite.com/api/auth/oauth/<google|facebook|apple>/callback` (em dev, `http://localhost:8000/...`). `APP_URL` (opcional) = endereço do frontend para onde o login social volta; padrão: o mesmo domínio em produção, `http://localhost:5173` em dev. `PORT` é definido pela Hostinger.
- Em produção sem `JWT_SECRET` o servidor não sobe; falha de conexão com o MySQL aparece no log como "Falha ao conectar/preparar o banco".
- `better-sqlite3` está em `optionalDependencies`: se não compilar na Hostinger, a instalação segue (produção usa só `mysql2`).
- **`UPLOAD_DIR=/home/u526770669/salvee-uploads`** (variável no painel): pasta das imagens fora do app. Sem ela as fotos somem a cada deploy. `PUBLIC_URL` não é mais usado para montar o link das imagens (ficou relativo).
- Teste: `https://skyblue-hedgehog-581364.hostingersite.com/api/health` → `{ "ok": true, "version": "x.y.z" }` com a mesma versão mostrada em Configurações.

**Domínio antigo:** o site estático `darkblue-rook-985577.hostingersite.com` (Git → `public_html`) continua recebendo a `master`; o **`.htaccess` da raiz** serve só `endereco-antigo.html` (aviso com link para o domínio novo, **sem redirecionamento automático**, que o Google trata como sinal de golpe) e impede que o código do repositório seja servido. O `index.html` da raiz é o de desenvolvimento (carrega `/src/main.ts`) e tem a meta `google-site-verification` do Search Console.

## Controle de versão do Salvee (obrigatório a cada mudança)

**Versão atual: veja `versaoAtual` em `src/config/versoes.json`.** O controle começou na 1.4.0 (05/10/2026); as versões 0.1.0 → 1.3.0 foram catalogadas retroativamente a partir do git e das sessões. É o mesmo modelo do projeto SIGIS.

- **Fonte única:** `src/config/versoes.json`, com `versaoAtual` + `historico[]` (mais recente primeiro). Cada entrada tem `versao`, `data` (AAAA-MM-DD), `tipo` (marco/major/minor/patch), `titulo`, `modulos[]`, `itens[]` e `fontes[]` (arquivos ou `git:<hash>`). É lido pela tela **Configurações** (rodapé "Versão x.y.z").
- **`CHANGELOG.md` (raiz) é gerado.** Nunca editar à mão: rodar `npm run versao:changelog`. `npm run versao:check` valida o JSON (versaoAtual = primeira do histórico, ordem decrescente, sem repetição, data/tipo válidos) e confere os `package.json`. O `npm run build` roda o check antes.
- O `version` de `package.json` e `server/package.json` acompanha a versão (o `versao:changelog` sincroniza). O servidor expõe a sua em `/api/health`; se diferir da do app, o deploy está pela metade.

**Regra de numeração (MAJOR.MINOR.PATCH):**

| Parte | Quando sobe | Exemplo |
|---|---|---|
| **PATCH** (1.4.X) | Correção de bug, ajuste visual, texto, melhoria pequena de algo existente, sem função nova | 1.4.0 → 1.4.1 |
| **MINOR** (1.X.0, zera PATCH) | Função nova: módulo, tela, regra de negócio, rota da API, integração | 1.4.3 → 1.5.0 |
| **MAJOR** (X.0.0, zera os outros) | Mudança grande de base/uso: nova plataforma, troca de banco, reformulação geral, quebra de compatibilidade | 1.9.2 → 2.0.0 |

Várias mudanças entregues juntas = **uma** versão, pela parte de maior peso.

**Rotina a cada alteração ou módulo novo entregue (antes do commit), sem precisar o usuário pedir:**
1. Decidir PATCH/MINOR/MAJOR pela tabela e **dizer a versão ao usuário** (ex.: "isto vira a 1.4.1").
2. Adicionar a entrada no topo de `historico` e atualizar `versaoAtual`. Se for módulo novo, incluir o nome dele em `modulos`.
3. Rodar `npm run versao:changelog` (valida, sincroniza os `package.json` e regenera o `CHANGELOG.md` **e o catálogo abaixo**).
4. Se a mudança alterar estrutura, rotas, API, papéis ou deploy, atualizar também as seções correspondentes deste CLAUDE.md.
5. Começar a mensagem do commit com a versão, ex.: `feat(admin): v1.5.0 — ...` ou `fix(feed): v1.4.1 — ...`.

### Catálogo de versões

Bloco **gerado** por `npm run versao:changelog` a partir de `versoes.json`. Não editar à mão (detalhes, itens e fontes de cada versão: `CHANGELOG.md`).

<!-- catalogo-versoes:inicio -->

Versão atual: **1.18.1** · 36 versões

| Versão | Data | Tipo | O que mudou | Módulos |
|---|---|---|---|---|
| 1.18.1 | 10/10/2026 | Patch | Manifesto do app com o tipo certo para "Instalar app" | Servidor, Sistema |
| 1.18.0 | 10/10/2026 | Minor | Visual responsivo para celular, tablet e computador e app instalável na tela inicial | Sistema |
| 1.17.0 | 10/10/2026 | Minor | Carrossel "Promoções & metas" na busca, com banners cadastrados pelo admin | Busca, Admin, Configurações, Servidor, Banco de dados |
| 1.16.0 | 10/10/2026 | Minor | Cadastro de instituição só vai para aprovação ao "Enviar para análise" | Onboarding, Instituição, Admin, Perfil, Feed, Servidor |
| 1.15.0 | 10/10/2026 | Minor | Localização no mapa: instituição marca o local e "Perto de mim" com GPS | Busca, Instituição, Onboarding, Servidor, Banco de dados |
| 1.14.0 | 10/10/2026 | Minor | Feed com impulsionamento, perfil da instituição completo e busca reformulada | Feed, Busca, Instituição, Onboarding, Servidor, Banco de dados |
| 1.13.1 | 10/10/2026 | Patch | Escolha Usuário/Instituição depois de criar a conta | Onboarding, Autenticação, Servidor |
| 1.13.0 | 10/10/2026 | Minor | Tela da campanha, seguir instituições e escolha do tipo de conta antes do cadastro | Doação, Feed, Instituição, Onboarding, Autenticação, Configurações, Servidor, Banco de dados |
| 1.12.1 | 08/10/2026 | Patch | Situação do cadastro da instituição no Perfil | Perfil, Instituição |
| 1.12.0 | 08/10/2026 | Minor | Situação da instituição no login, pedido de revisão e reenvio de correções | Onboarding, Instituição, Admin, Autenticação, Feed, Configurações, Servidor, Banco de dados |
| 1.11.0 | 08/10/2026 | Minor | Curtir e comentar publicações, com tela de detalhe do post | Feed, Servidor, Banco de dados |
| 1.10.1 | 08/10/2026 | Patch | Admin volta a listar instituições e cadastro de instituição sem erro na última etapa | Admin, Instituição, Banco de dados, Servidor |
| 1.10.0 | 07/10/2026 | Minor | Instituição publica no feed: posts, eventos e campanhas | Feed, Instituição, Calendário, Doação, Admin, Servidor, Banco de dados |
| 1.9.2 | 07/10/2026 | Patch | Ajustes contra o alerta "Perigoso" do Chrome | Autenticação, Sistema |
| 1.9.1 | 07/10/2026 | Patch | Correções de segurança e ajustes à especificação oficial (PDF) | Instituição, Feed, Busca, Doação, Servidor, Sistema |
| 1.9.0 | 07/10/2026 | Minor | E-mail pela Hostinger: recuperar senha e confirmar cadastro | Autenticação, Onboarding, Servidor, Banco de dados |
| 1.8.1 | 07/10/2026 | Patch | Botão de mostrar senha e verificação por SMS sem travar o cadastro | Autenticação, Onboarding, Servidor |
| 1.8.0 | 07/10/2026 | Minor | Login social com Google, Facebook e Apple e logos oficiais nos botões | Autenticação, Servidor, Banco de dados |
| 1.7.0 | 07/10/2026 | Minor | Doação só credita pontos após confirmação; fotos fora da pasta do app | Doação, Admin, Perfil, Configurações, Servidor, Banco de dados |
| 1.6.3 | 07/10/2026 | Patch | Produção no Node.js App skyblue-hedgehog; domínio antigo redireciona | Sistema, Servidor |
| 1.6.2 | 07/10/2026 | Patch | Instalação na Hostinger sempre traz as dependências da API | Sistema |
| 1.6.1 | 07/10/2026 | Patch | Node.js App da Hostinger: variáveis fora do repositório e start pela raiz | Servidor, Sistema |
| 1.6.0 | 05/10/2026 | Minor | Um só app na Hostinger: o Express serve o frontend e a API no mesmo domínio | Servidor, Sistema |
| 1.5.0 | 05/10/2026 | Minor | MySQL e API prontos para a Hostinger: exportação do banco local e API como Node.js App | Servidor, Banco de dados |
| 1.4.3 | 05/10/2026 | Patch | Deploy só pela master: build versionado em dist/ servido pelo .htaccess | Sistema |
| 1.4.2 | 05/10/2026 | Patch | Deploy na Hostinger com build automático (corrige tela branca) | Sistema |
| 1.4.1 | 05/10/2026 | Patch | Build de produção volta a compilar (cadastro de instituição) | Onboarding, Sistema |
| 1.4.0 | 05/10/2026 | Marco | Início do controle de versões do Salvee | Sistema, Configurações, Servidor |
| 1.3.0 | 08/09/2026 | Minor | Painel administrativo: aprovação de instituições e gestão de usuários | Admin, Configurações, Servidor |
| 1.2.0 | 08/09/2026 | Minor | Calendário com próximas atividades, busca e feed reformulados | Calendário, Busca, Feed, Configurações |
| 1.1.0 | 21/05/2026 | Minor | Cadastro de instituição em etapas, feed com destaques e perfil ampliado | Onboarding, Feed, Perfil, Servidor |
| 1.0.0 | 18/05/2026 | Major | Primeiro deploy na Hostinger com MySQL | Servidor, Sistema |
| 0.4.0 | 30/04/2026 | Minor | Backend Node.js/Express com SQLite (Knex, pronto para MySQL) | Servidor |
| 0.3.0 | 29/04/2026 | Minor | Feed, busca, perfil da instituição, doação, calendário, perfil e configurações | Feed, Busca, Instituição, Doação, Calendário, Perfil, Configurações |
| 0.2.0 | 29/04/2026 | Minor | Telas de entrada, autenticação e onboarding | Autenticação, Onboarding |
| 0.1.0 | 29/04/2026 | Minor | Base do projeto: Vite + TypeScript + Tailwind, serviços, rotas e componentes | Sistema |
<!-- catalogo-versoes:fim -->
