# Histórico de Versões — Salvee

> Arquivo **gerado automaticamente** a partir de `src/config/versoes.json` 
> (`npm run versao:changelog`). Não edite à mão — edite o JSON e regenere.

**Versão atual: 1.4.1**

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
