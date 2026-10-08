# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Visão geral

**Salvee** é um app web mobile-first que conecta doadores e voluntários a instituições sociais: descoberta, doações, eventos e gamificação (XP/Salves). Especificação funcional: `salvee_especificacao.md`. Design e planos originais: `docs/superpowers/`.

- **Frontend:** Vite 6 + TypeScript (vanilla, sem framework) + Tailwind 3, em `src/`.
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
  components/             # Button, Input, Toast, Card, Avatar, Badge, BottomNav, BottomSheet, ProgressBar, NumericKeyboard, Spinner
  screens/                # cada tela exporta render(): HTMLElement, mount(), unmount()
    auth/                 # login, register, forgot-password
    onboarding/           # choose-profile, verify-phone, institution-register, welcome-success
    admin/                # institution-approvals, user-management
    feed, search, calendar, profile, settings, donation, institution-profile, splash, welcome
  services/               # api.ts (request<T>, BASE_URL = VITE_API_URL) + um service por domínio, exportados em index.ts
  types/                  # tipos de domínio, exportados em index.ts
server/
  index.js                # Express: /api/*, /api/health (com version), /uploads e o frontend (server/public, fallback index.html)
  db.js                   # conexão Knex + initDb() (cria tabelas e colunas novas na subida)
  middleware/auth.js      # JWT (Bearer), req.userId
  routes/                 # auth, feed, institutions, search, donations, gamification, calendar, users, admin, upload
  public/                 # BUILD do frontend (npm run build) — gerado, versionado, não editar à mão
  uploads/                # imagens enviadas (disco local)
scripts/versao.mjs        # controle de versão
public/                   # arquivos estáticos de origem do Vite (logos, promos, .htaccess) — copiados para server/public no build
.htaccess                 # site estático da Hostinger: serve server/public/
```

### Rotas do frontend (`src/router.ts`)

`/`, `/welcome`, `/login`, `/register`, `/forgot-password`, `/choose-profile`, `/verify-phone`, `/welcome-success`, `/register/institution`*, `/feed`*, `/search`*, `/institution/:id`*, `/donate/:id`*, `/calendar`*, `/profile`*, `/settings`*, `/admin/institutions`*, `/admin/users`*, `/admin/donations`* (* = protegida).

### API (`server/routes/`, prefixo `/api`)

- `auth`: register, login, logout, me, forgot-password, send-phone-code, verify-phone
- `users`: GET/PATCH `/me` (inclui `role`), GET/PUT `/profile`
- `institutions`: lista, `/destaques`, `/:id`, `POST /register/step`
- `feed`, `search` (+ `/categories`), `donations` (`/initiate`, `/history`), `gamification` (`/balance`, `/rewards`, `/rewards/:id/redeem`), `calendar` (`/my-events`, `/events/:id/register`)
- `upload`: POST multipart → pasta `UPLOAD_DIR` (padrão `server/uploads/`); devolve URL **relativa** `/uploads/<arquivo>`
- `admin`: `GET /users?name=&role=` e `PATCH /users/:id/role` (só **admin**); `GET /institutions`, `PATCH /institutions/:id/status`, `GET /donations?status=` e `PATCH /donations/:id/status` (**admin** ou **gestor**)

### Papéis e regras

- `users.role`: `user` (padrão), `gestor`, `admin`. A seção de administração em Configurações aparece conforme o papel.
- Qualquer usuário logado pode cadastrar uma instituição. Ela nasce `pending`; admin/gestor aprova (`approved` → `verified = true`), reprova (`rejected` + `rejection_reason`) ou pede revisão (`needs_revision`).
- Doação nasce `pending` (`donations.status`): aparece no histórico, mas **não credita XP/Salves**. Admin/gestor confirma em Configurações → Confirmar doações (`confirmed` → credita uma única vez, protegido contra confirmação em dobro) ou cancela (`cancelled`). Doações anteriores à coluna ficaram `confirmed`. Quando houver PIX real, o webhook do provedor substitui a confirmação manual.
- Tabelas: `users`, `institutions`, `posts`, `donations`, `calendar_registrations`, `rewards`. Coluna nova = adicionar `hasColumn`/`alterTable` no fim de `initDb()` (vale para SQLite e MySQL).

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
- Variáveis de ambiente (no painel do app ou, se o painel não tiver a tela, em `~/salvee.env.production` na home do SSH, fora do repositório e preservado nos redeploys; nunca no git). Ordem: painel > `server/.env(.production)` > `~/salvee.env.production`: `NODE_ENV=production`, `JWT_SECRET`, `DB_CLIENT=mysql2`, `DB_HOST`, `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=u526770669_salvee`, `PUBLIC_URL=https://skyblue-hedgehog-581364.hostingersite.com`. `CORS_ORIGIN` só se outro domínio for chamar a API. `PORT` é definido pela Hostinger.
- Em produção sem `JWT_SECRET` o servidor não sobe; falha de conexão com o MySQL aparece no log como "Falha ao conectar/preparar o banco".
- `better-sqlite3` está em `optionalDependencies`: se não compilar na Hostinger, a instalação segue (produção usa só `mysql2`).
- **`UPLOAD_DIR=/home/u526770669/salvee-uploads`** (variável no painel): pasta das imagens fora do app. Sem ela as fotos somem a cada deploy. `PUBLIC_URL` não é mais usado para montar o link das imagens (ficou relativo).
- Teste: `https://skyblue-hedgehog-581364.hostingersite.com/api/health` → `{ "ok": true, "version": "x.y.z" }` com a mesma versão mostrada em Configurações.

**Domínio antigo:** o site estático `darkblue-rook-985577.hostingersite.com` (Git → `public_html`) continua recebendo a `master`; o **`.htaccess` da raiz** redireciona tudo (302) para o domínio de produção e impede que o código do repositório seja servido. O `index.html` da raiz é o de desenvolvimento (carrega `/src/main.ts`).

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

Versão atual: **1.7.0** · 18 versões

| Versão | Data | Tipo | O que mudou | Módulos |
|---|---|---|---|---|
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
