# Histórico de Versões — Salvee

> Arquivo **gerado automaticamente** a partir de `src/config/versoes.json` 
> (`npm run versao:changelog`). Não edite à mão — edite o JSON e regenere.

**Versão atual: 1.8.0**

## Como numerar (MAJOR.MINOR.PATCH)

| Parte | Quando sobe | Exemplo | O que zera |
|---|---|---|---|
| **MAJOR** (X.0.0) | Mudança grande que altera a forma de usar ou a base do sistema: nova plataforma, troca de banco, reformulação geral, quebra de compatibilidade | 1.4.3 → **2.0.0** | MINOR e PATCH |
| **MINOR** (1.X.0) | Funcionalidade nova: novo módulo, nova tela, nova regra de negócio, nova rota da API, nova integração | 1.4.5 → **1.5.0** | PATCH |
| **PATCH** (1.4.X) | Correção de bug, ajuste visual, texto, melhoria pequena de algo que já existe, sem função nova | 1.5.0 → **1.5.1** | — |

Várias mudanças entregues juntas viram **uma** versão, pela parte de maior peso (ex.: 1 função nova + 3 correções = MINOR).

## Resumo

| Versão | Data | Tipo | O que mudou | Módulos |
|---|---|---|---|---|
| **1.8.0** | 07/10/2026 | Minor | Login social com Google, Facebook e Apple e logos oficiais nos botões | Autenticação, Servidor, Banco de dados |
| **1.7.0** | 07/10/2026 | Minor | Doação só credita pontos após confirmação; fotos fora da pasta do app | Doação, Admin, Perfil, Configurações, Servidor, Banco de dados |
| **1.6.3** | 07/10/2026 | Patch | Produção no Node.js App skyblue-hedgehog; domínio antigo redireciona | Sistema, Servidor |
| **1.6.2** | 07/10/2026 | Patch | Instalação na Hostinger sempre traz as dependências da API | Sistema |
| **1.6.1** | 07/10/2026 | Patch | Node.js App da Hostinger: variáveis fora do repositório e start pela raiz | Servidor, Sistema |
| **1.6.0** | 05/10/2026 | Minor | Um só app na Hostinger: o Express serve o frontend e a API no mesmo domínio | Servidor, Sistema |
| **1.5.0** | 05/10/2026 | Minor | MySQL e API prontos para a Hostinger: exportação do banco local e API como Node.js App | Servidor, Banco de dados |
| **1.4.3** | 05/10/2026 | Patch | Deploy só pela master: build versionado em dist/ servido pelo .htaccess | Sistema |
| **1.4.2** | 05/10/2026 | Patch | Deploy na Hostinger com build automático (corrige tela branca) | Sistema |
| **1.4.1** | 05/10/2026 | Patch | Build de produção volta a compilar (cadastro de instituição) | Onboarding, Sistema |
| **1.4.0** | 05/10/2026 | Marco | Início do controle de versões do Salvee | Sistema, Configurações, Servidor |
| **1.3.0** | 08/09/2026 | Minor | Painel administrativo: aprovação de instituições e gestão de usuários | Admin, Configurações, Servidor |
| **1.2.0** | 08/09/2026 | Minor | Calendário com próximas atividades, busca e feed reformulados | Calendário, Busca, Feed, Configurações |
| **1.1.0** | 21/05/2026 | Minor | Cadastro de instituição em etapas, feed com destaques e perfil ampliado | Onboarding, Feed, Perfil, Servidor |
| **1.0.0** | 18/05/2026 | Major | Primeiro deploy na Hostinger com MySQL | Servidor, Sistema |
| **0.4.0** | 30/04/2026 | Minor | Backend Node.js/Express com SQLite (Knex, pronto para MySQL) | Servidor |
| **0.3.0** | 29/04/2026 | Minor | Feed, busca, perfil da instituição, doação, calendário, perfil e configurações | Feed, Busca, Instituição, Doação, Calendário, Perfil, Configurações |
| **0.2.0** | 29/04/2026 | Minor | Telas de entrada, autenticação e onboarding | Autenticação, Onboarding |
| **0.1.0** | 29/04/2026 | Minor | Base do projeto: Vite + TypeScript + Tailwind, serviços, rotas e componentes | Sistema |

## Detalhes

### 1.8.0 — Login social com Google, Facebook e Apple e logos oficiais nos botões

*07/10/2026 · Minor · Autenticação, Servidor, Banco de dados*

- Botões "ou entre com" (login e cadastro) com os logos oficiais da Apple, do Google e do Facebook no lugar dos emojis e letras; componente único SocialLogin
- Login social pelo fluxo OAuth (authorization code) nas rotas /api/auth/oauth/:provider e /callback, sem dependência nova; protegido com state assinado + cookie contra login forjado
- Cria a conta no primeiro acesso ou vincula a uma conta existente com o mesmo e-mail confirmado; colunas users.google_id, facebook_id e apple_id
- Cada provedor só é ativado quando as credenciais dele estão nas variáveis de ambiente; sem elas o botão avisa "disponível em breve"
- Nova tela #/oauth recebe o login; erros e cancelamento voltam para o login com aviso. O router passa a aceitar query no hash (#/rota?x=y)

Fontes: `server/routes/oauth.js` · `server/index.js` · `server/db.js` · `src/components/SocialLogin.ts` · `src/screens/auth/oauth.ts` · `src/screens/auth/login.ts` · `src/screens/auth/register.ts` · `src/router.ts` · `src/services/api.ts` · `CLAUDE.md` · `server/.env.example`

### 1.7.0 — Doação só credita pontos após confirmação; fotos fora da pasta do app

*07/10/2026 · Minor · Doação, Admin, Perfil, Configurações, Servidor, Banco de dados*

- Doação nasce pendente (donations.status): fica no histórico, mas XP e Salves só entram quando o pagamento é confirmado. Antes, qualquer doação somava pontos na hora, sem pagamento
- Nova tela Admin → Confirmar doações (admin/gestor), com abas por status e ações Confirmar pagamento / Cancelar; rotas GET /api/admin/donations e PATCH /api/admin/donations/:id/status, protegida contra crédito em dobro
- Tela de doação avisa que os pontos entram após a confirmação; erro ao registrar não mostra mais falso sucesso. Histórico do perfil mostra o status e o resumo soma só as confirmadas
- Valor da doação validado no servidor (inteiro positivo)
- Imagens enviadas vão para UPLOAD_DIR (fora do app, sobrevivem aos redeploys da Hostinger); as versionadas em server/uploads são copiadas para lá na subida
- Links de imagem passam a ser relativos (/uploads/...) e os antigos com domínio são convertidos na subida: não quebram mais quando o domínio muda. Imagem inexistente responde 404
- Dev: o Vite repassa /uploads para a API

Fontes: `server/routes/donations.js` · `server/routes/admin.js` · `server/db.js` · `server/uploads.js` · `server/routes/upload.js` · `server/index.js` · `src/screens/admin/donation-approvals.ts` · `src/screens/donation.ts` · `src/screens/profile.ts` · `src/screens/settings.ts` · `src/router.ts` · `src/services/admin.service.ts` · `src/types/donation.ts` · `src/types/admin.ts` · `vite.config.ts` · `CLAUDE.md`

### 1.6.3 — Produção no Node.js App skyblue-hedgehog; domínio antigo redireciona

*07/10/2026 · Patch · Sistema, Servidor*

- Frontend e API em produção no Node.js App da Hostinger em skyblue-hedgehog-581364.hostingersite.com (Express, master, Node 22, entrada server/index.js, variáveis no painel)
- O site estático antigo darkblue-rook-985577 passa a redirecionar tudo para o novo domínio pelo .htaccess da raiz
- CLAUDE.md e server/.env.example atualizados com o novo domínio e a configuração do app

Fontes: `.htaccess` · `CLAUDE.md` · `server/.env.example`

### 1.6.2 — Instalação na Hostinger sempre traz as dependências da API

*07/10/2026 · Patch · Sistema*

- O postinstall da raiz passa a instalar as dependências de server/ sempre, e não só com NODE_ENV=production: na Hostinger o NODE_ENV pode não estar definido durante a instalação, e a API subiria sem express/knex

Fontes: `package.json` · `CLAUDE.md`

### 1.6.1 — Node.js App da Hostinger: variáveis fora do repositório e start pela raiz

*07/10/2026 · Patch · Servidor, Sistema*

- O servidor carrega as variáveis de server/.env(.production) pelo caminho do próprio arquivo (antes dependia da pasta de onde era iniciado) e também de ~/salvee.env.production, fora do repositório, que sobrevive aos redeploys da Hostinger
- package.json da raiz ganha start (node server/index.js) e postinstall que instala as dependências de server/ em produção: o app funciona com a raiz do repositório ou com a pasta server
- CLAUDE.md documenta como a Hostinger roda Node (Passenger via .htaccess, pasta hbuilds recriada a cada deploy)

Fontes: `server/index.js` · `package.json` · `CLAUDE.md`

### 1.6.0 — Um só app na Hostinger: o Express serve o frontend e a API no mesmo domínio

*05/10/2026 · Minor · Servidor, Sistema*

- O build do Vite passa a sair em server/public/ (antes dist/); o Express serve essa pasta e devolve o index.html para as demais rotas, então um único Node.js App (raiz server/) publica frontend + API
- VITE_API_URL de produção agora é relativo (/api): sem CORS e sem depender do domínio
- Rota /api inexistente responde 404 em JSON em vez da página do app
- O .htaccess da raiz passa a servir server/public/, mantendo o site estático no ar durante a troca; dist/ sai do git
- Para ver localmente como em produção: npm run build e node server/index.js → http://localhost:8000
- Limpeza do repositório: server/salvee.db deixa de ser rastreado pelo git, uploads novos de dev ficam fora do git e o arquivo nul foi removido

Fontes: `vite.config.ts` · `server/index.js` · `.htaccess` · `.env.production` · `.gitignore` · `CLAUDE.md`

### 1.5.0 — MySQL e API prontos para a Hostinger: exportação do banco local e API como Node.js App

*05/10/2026 · Minor · Servidor, Banco de dados*

- API preparada para rodar como Node.js App separado na Hostinger (raiz server/): CORS restrito por CORS_ORIGIN, trust proxy, better-sqlite3 opcional, engines Node >= 20
- Em produção, o servidor não sobe sem JWT_SECRET (antes usava um segredo padrão) e falha de conexão com o banco aparece no log
- Upload devolve URL absoluta (PUBLIC_URL ou host da requisição), para as imagens abrirem com frontend e API em domínios diferentes
- Novo script server/scripts/exportar-mysql.js (npm run exportar:mysql no server/) que gera server/export/salvee-mysql.sql para importar no phpMyAdmin
- Cria as tabelas que faltarem no formato do initDb() e adiciona colunas ausentes (ex.: users.role, que o migrate_users.sql antigo não tinha), em SQL compatível com MySQL e MariaDB
- Copia todas as linhas com upsert: o dado local sobrescreve o mesmo id (em users, o mesmo e-mail, mantendo o id da produção); nada da produção é apagado; pode ser reimportado
- Datas ISO do SQLite convertidas para o formato DATETIME do MySQL
- server/export/ fora do git (contém e-mails e hashes de senha)

Fontes: `server/scripts/exportar-mysql.js` · `server/index.js` · `server/routes/upload.js` · `server/package.json` · `.gitignore` · `CLAUDE.md`

### 1.4.3 — Deploy só pela master: build versionado em dist/ servido pelo .htaccess

*05/10/2026 · Patch · Sistema*

- Fluxo com uma única branch (master): a Hostinger implanta a master sem build, então o dist/ passa a ser versionado e o .htaccess da raiz serve tudo a partir dele (corrige de vez a tela branca)
- O .htaccess também bloqueia o acesso pela web ao código-fonte (src/, server/ etc.)
- Removidos a GitHub Action e a branch hostinger criadas na 1.4.2
- CLAUDE.md: rodar npm run build antes de cada push; para desfazer em produção, git revert + push

Fontes: `.htaccess` · `.gitignore` · `dist/` · `CLAUDE.md`

### 1.4.2 — Deploy na Hostinger com build automático (corrige tela branca)

*05/10/2026 · Patch · Sistema*

- Correção: a Hostinger copiava o repositório sem build para o public_html e o index.html carregava /src/main.ts (TypeScript), servido como text/plain, deixando a tela branca
- GitHub Action (.github/workflows/deploy-hostinger.yml) roda npm run build a cada push na master e publica o dist/ na branch hostinger, que é a branch que a Hostinger deve implantar

Fontes: `.github/workflows/deploy-hostinger.yml`

### 1.4.1 — Build de produção volta a compilar (cadastro de instituição)

*05/10/2026 · Patch · Onboarding, Sistema*

- Correção: o npm run build falhava no tsc porque o tipo InstitutionRegisterPayload não tinha o campo institutionId, que o cadastro em etapas envia e a API já usa; isso impedia o deploy na Hostinger

Fontes: `src/types/institution.ts` · `src/screens/onboarding/institution-register.ts`

### 1.4.0 — Início do controle de versões do Salvee

*05/10/2026 · Marco · Sistema, Configurações, Servidor*

- Fonte única de versões em src/config/versoes.json (versão atual + histórico), no mesmo modelo do SIGIS
- Script scripts/versao.mjs: npm run versao:check valida o JSON e npm run versao:changelog gera o CHANGELOG.md e o catálogo do CLAUDE.md
- Tela Configurações mostra a versão real do sistema (antes era o texto fixo "Versão 1.0.0")
- /api/health passa a informar a versão do servidor (lida do server/package.json)
- O build valida o versoes.json antes de compilar
- Histórico anterior catalogado retroativamente (0.1.0 → 1.3.0) a partir do git e das sessões de desenvolvimento
- CLAUDE.md criado com a documentação do projeto, deploy na Hostinger e a regra de versionamento

Fontes: `src/config/versoes.json` · `scripts/versao.mjs` · `src/screens/settings.ts` · `server/index.js` · `CLAUDE.md`

### 1.3.0 — Painel administrativo: aprovação de instituições e gestão de usuários

*08/09/2026 · Minor · Admin, Configurações, Servidor*

- Nova tela de aprovação de instituições (#/admin/institutions) para admin e gestor: aprovar, reprovar com motivo (rejection_reason) e pedir revisão; aprovar ativa verified = true
- Nova tela de gestão de usuários (#/admin/users), só para admin: busca por nome e troca de papel (user/gestor/admin)
- Botão "Ver gestores atuais" lista os usuários com papel gestor (GET /api/admin/users?role=gestor)
- Configurações ganha a seção de administração, visível conforme o papel do usuário
- Correção: GET /api/users/me não devolvia o campo role (o login devolvia); o tipo User agora tem role
- Novos tipos AdminInstitution e AdminUser e o adminService
- Removidos os .js compilados que ficavam ao lado dos .ts em src/ e quebravam os imports no Vite

Fontes: `src/screens/admin/institution-approvals.ts` · `src/screens/admin/user-management.ts` · `src/services/admin.service.ts` · `src/types/admin.ts` · `server/routes/admin.js` · `server/routes/users.js`

### 1.2.0 — Calendário com próximas atividades, busca e feed reformulados

*08/09/2026 · Minor · Calendário, Busca, Feed, Configurações*

- Calendário: seção "Próximas atividades", faixa de dias com rolagem horizontal e filtro por categoria
- Busca: tocar numa causa abre a instituição correta
- Feed reformulado
- Botão de configurações com o mesmo comportamento no perfil e no feed
- Especificação atualizada: qualquer usuário logado pode registrar uma instituição; estados pending/approved/rejected/needs_revision

Fontes: `src/screens/calendar.ts` · `src/screens/search.ts` · `src/screens/feed.ts` · `src/screens/settings.ts` · `server/routes/calendar.js` · `salvee_especificacao.md`

### 1.1.0 — Cadastro de instituição em etapas, feed com destaques e perfil ampliado

*21/05/2026 · Minor · Onboarding, Feed, Perfil, Servidor*

- Cadastro de instituição refeito em etapas, com upload de logo e fotos (POST /api/upload)
- Nova tela de boas-vindas após o cadastro (#/welcome-success)
- Feed com instituições em destaque e banners promocionais (public/logos, public/promos)
- Perfil do usuário ampliado
- Migração de usuários para o MySQL (server/migrate_users.sql) e public/.htaccess para a hospedagem

Fontes: git:5727dd2 · `src/screens/onboarding/institution-register.ts` · `src/screens/onboarding/welcome-success.ts` · `src/screens/feed.ts` · `src/screens/profile.ts`

### 1.0.0 — Primeiro deploy na Hostinger com MySQL

*18/05/2026 · Major · Servidor, Sistema*

- Primeira publicação em hostingersite.com
- Backend em produção com MySQL da Hostinger (DB_CLIENT=mysql2, .env.production)
- Splash ajustada para checar a autenticação

Fontes: git:7cc251c · git:284e43d · `server/db.js`

### 0.4.0 — Backend Node.js/Express com SQLite (Knex, pronto para MySQL)

*30/04/2026 · Minor · Servidor*

- API Express em server/ com rotas de auth, feed, instituições, busca, doações, gamificação, calendário e usuários
- Banco via Knex: SQLite em desenvolvimento e MySQL em produção, com tabelas criadas no initDb()
- Login com JWT e senha com bcrypt; scripts de seed

Fontes: git:6884882

### 0.3.0 — Feed, busca, perfil da instituição, doação, calendário, perfil e configurações

*29/04/2026 · Minor · Feed, Busca, Instituição, Doação, Calendário, Perfil, Configurações*

- Telas de feed e busca
- Perfil da instituição com abas
- Fluxo de doação em 4 etapas
- Telas de calendário, perfil e configurações

Fontes: git:c23c355 · git:ec23b10 · git:9ec3c2b · git:d0af516

### 0.2.0 — Telas de entrada, autenticação e onboarding

*29/04/2026 · Minor · Autenticação, Onboarding*

- Splash e boas-vindas
- Login, cadastro e esqueci a senha
- Onboarding: escolha de perfil, verificação de telefone e cadastro de instituição

Fontes: git:978f145 · git:4ffaced · git:9d0b50c

### 0.1.0 — Base do projeto: Vite + TypeScript + Tailwind, serviços, rotas e componentes

*29/04/2026 · Minor · Sistema*

- Estrutura Vite + TypeScript, Vitest e Tailwind com as cores do Salvee
- Tipos de domínio e camada de serviços (api.ts com BASE_URL, auth e demais serviços) com testes
- Router por hash (#/...) com rotas protegidas
- Componentes: Button, Input, Spinner, Toast, Card, Avatar, Badge, BottomNav, ProgressBar, BottomSheet, NumericKeyboard
- Correção de XSS nos componentes Toast e Input

Fontes: git:c2ac4d2 · git:11678ac · git:43c7124 · git:e92cd67 · git:a990ec3
