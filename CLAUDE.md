# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Visão geral

**Salvee** é um app web mobile-first que conecta doadores e voluntários a instituições sociais: descoberta, doações, eventos e gamificação (XP/Salves). Especificação funcional: `salvee_especificacao.md`. Design e planos originais: `docs/superpowers/`.

- **Frontend:** Vite 6 + TypeScript (vanilla, sem framework) + Tailwind 3, em `src/`.
- **Backend:** Node.js + Express 4 (CommonJS) em `server/`, banco via Knex (SQLite em dev, MySQL em produção).
- **Produção:** Hostinger (hPanel), domínio `darkblue-rook-985577.hostingersite.com`, MySQL `u526770669_salvee`.
- Idioma da interface, dos commits e da documentação: **português (pt-BR)**.

## Comandos

```bash
npm install && npm install --prefix server   # dependências (raiz + server)

npm run dev:all        # frontend (Vite, :5173) + backend (:8000) juntos
npm run dev            # só frontend
npm run dev:server     # só backend (node --watch)

npm run build          # valida versoes.json + tsc --noEmit + vite build → dist/
npm test               # vitest (jsdom)
npx tsc --noEmit       # checagem de tipos

npm run versao:check       # valida src/config/versoes.json e os package.json
npm run versao:changelog   # sincroniza package.json, gera CHANGELOG.md e o catálogo abaixo

node server/seed.js              # dados de exemplo
node server/seed-institutions.js # instituições de exemplo
node server/seed-admin.js        # cria/promove admin@salvee.com (senha Salvee@2025, trocar em produção)
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
  index.js                # Express, monta /api/*, /uploads estático, /api/health (com version)
  db.js                   # conexão Knex + initDb() (cria tabelas e colunas novas na subida)
  middleware/auth.js      # JWT (Bearer), req.userId
  routes/                 # auth, feed, institutions, search, donations, gamification, calendar, users, admin, upload
  uploads/                # imagens enviadas (disco local)
scripts/versao.mjs        # controle de versão
public/                   # logos, promos, .htaccess
```

### Rotas do frontend (`src/router.ts`)

`/`, `/welcome`, `/login`, `/register`, `/forgot-password`, `/choose-profile`, `/verify-phone`, `/welcome-success`, `/register/institution`*, `/feed`*, `/search`*, `/institution/:id`*, `/donate/:id`*, `/calendar`*, `/profile`*, `/settings`*, `/admin/institutions`*, `/admin/users`* (* = protegida).

### API (`server/routes/`, prefixo `/api`)

- `auth`: register, login, logout, me, forgot-password, send-phone-code, verify-phone
- `users`: GET/PATCH `/me` (inclui `role`), GET/PUT `/profile`
- `institutions`: lista, `/destaques`, `/:id`, `POST /register/step`
- `feed`, `search` (+ `/categories`), `donations` (`/initiate`, `/history`), `gamification` (`/balance`, `/rewards`, `/rewards/:id/redeem`), `calendar` (`/my-events`, `/events/:id/register`)
- `upload`: POST multipart → `server/uploads/`
- `admin`: `GET /users?name=&role=` e `PATCH /users/:id/role` (só **admin**); `GET /institutions` e `PATCH /institutions/:id/status` (**admin** ou **gestor**)

### Papéis e regras

- `users.role`: `user` (padrão), `gestor`, `admin`. A seção de administração em Configurações aparece conforme o papel.
- Qualquer usuário logado pode cadastrar uma instituição. Ela nasce `pending`; admin/gestor aprova (`approved` → `verified = true`), reprova (`rejected` + `rejection_reason`) ou pede revisão (`needs_revision`).
- Tabelas: `users`, `institutions`, `posts`, `donations`, `calendar_registrations`, `rewards`. Coluna nova = adicionar `hasColumn`/`alterTable` no fim de `initDb()` (vale para SQLite e MySQL).

## Ambiente

- Raiz: `.env` (`VITE_API_URL=http://localhost:8000/api`) e `.env.production` (`VITE_API_URL=https://<domínio>/api`). Vite injeta no **build**: mudou o domínio, refazer o build.
- `server/.env` (dev, SQLite) e `server/.env.production` (MySQL: `DB_CLIENT=mysql2`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`). `index.js` carrega `.env.production` quando `NODE_ENV=production`.
- Nunca commitar `.env*` nem `server/salvee.db`.

## Armadilhas conhecidas

- **Não deixar `.js` compilados em `src/`** ao lado dos `.ts` (ex.: `src/services/index.js`). O Vite resolve o `.js` antigo e os imports novos quebram (ex.: `adminService` "não exportado"). O projeto roda `.ts` direto; `tsc` é só `--noEmit`.
- `server/salvee.db` está no `.gitignore` mas ainda é rastreado pelo git: rodar `git rm --cached server/salvee.db`.
- Arquivo `nul` na raiz é lixo de redirecionamento no Windows: apagar.
- `server/uploads/` fica em disco; um redeploy na Hostinger pode apagar. Fazer backup.
- `cors()` está aberto para qualquer origem; restringir ao domínio em produção.

## Fluxo de trabalho: localhost primeiro, Hostinger depois

Todo ajuste e módulo novo é feito e testado **em localhost**. Só depois sobe para a Hostinger.

1. **Desenvolver local:** `npm run dev:all` (frontend em http://localhost:5173 + API em :8000 com SQLite `server/salvee.db`). Usa o `.env` da raiz (`VITE_API_URL=http://localhost:8000/api`) e o `server/.env`.
2. **Testar local:** conferir no navegador, `npx tsc --noEmit`, `npm test`.
3. **Versionar:** registrar a versão (ver "Controle de versão").
4. **Gerar o build:** `npm run build` → atualiza `dist/`. **Sempre antes do commit que vai subir**; sem isso a Hostinger publica o build antigo. Conferir o site de produção localmente com `npm run preview`, se quiser.
5. **Commit** (código + `dist/` + arquivos de versão) **e `git push` na `master`**. A Hostinger implanta a `master` automaticamente. **Push na `master` = publicar em produção.**
6. **Deu errado em produção?** `git revert <commit>` + `git push` (volta o site ao estado anterior, inclusive o `dist/`).

Regras:
- **Só existe a branch `master`.** Não criar outras branches nem branch de deploy.
- Não fazer push de algo não testado em localhost. Trabalho em andamento fica só local (sem commit, ou commit sem push); se não ficar bom, desfazer localmente (`git restore`, `git reset`).
- Nunca editar arquivos direto no `public_html` / Gerenciador de Arquivos da Hostinger: o próximo deploy sobrescreve.
- Dados de dev (SQLite) e de produção (MySQL) são bancos separados. Mudança de schema vai no `initDb()` e é aplicada sozinha na subida do servidor nos dois.

## Deploy na Hostinger (resumo)

**Frontend:** o site `darkblue-rook-985577.hostingersite.com` (Business Web Hosting) é implantado pelo Git da Hostinger: a cada push, a **`master`** inteira é copiada para o `public_html`, **sem build**. Por isso:

- **`dist/` é versionado** (não está no `.gitignore`) e precisa ser regerado com `npm run build` antes de cada push.
- O **`.htaccess` da raiz** reescreve toda requisição para `dist/`. O `index.html` da raiz é o de desenvolvimento (carrega `/src/main.ts`); servido direto, dá tela branca com o erro "MIME type text/plain". O `.htaccess` também deixa `src/`, `server/` etc. inacessíveis pela web.
- `dist/.htaccess` vem de `public/.htaccess` (fallback para `index.html` e proxy de `/api`).
- O `VITE_API_URL` do build vem do `.env.production` da raiz (versionado, só contém a URL pública).

**Backend (Node):**

1. `npm run build` (gera `dist/` com o `VITE_API_URL` de produção).
2. Hostinger hPanel → Node.js App com entrada `server/index.js`, Node 20/22, variáveis do `server/.env.production` no painel, `NODE_ENV=production`.
3. Para um app único (API + frontend), o Express precisa servir `../dist` (`express.static`). Alternativa já existente: `public/.htaccess` faz proxy de `/api/*` para `localhost:8000`.
4. `better-sqlite3` é nativo e pode falhar na instalação compartilhada; em produção só o `mysql2` é usado.
5. Testar `https://<domínio>/api/health` → `{ "ok": true, "version": "x.y.z" }`. Rodar `seed-admin.js` via SSH e trocar a senha.

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

Versão atual: **1.4.3** · 12 versões

| Versão | Data | Tipo | O que mudou | Módulos |
|---|---|---|---|---|
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
