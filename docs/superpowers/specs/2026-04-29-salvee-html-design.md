# Design Doc — salvee-html

> Data: 2026-04-29
> Stack: Vite + TypeScript + Tailwind CSS
> Objetivo: Implementação web responsiva (mobile-first) do Salvee, hospedável na Hostinger

---

## 1. Visão Geral

Projeto web da plataforma Salvee — ecossistema de impacto social que conecta doadores e voluntários a instituições e causas sociais. Cobre todas as telas da V1 da spec funcional.

**Decisões técnicas:**
- Vite + TypeScript — bundler moderno, sem framework de componentes
- Tailwind CSS — estilização mobile-first com tokens customizados
- Hash routing manual — sem biblioteca de roteamento (~30 linhas)
- Camada de serviços genérica — pronta para conectar a API PHP/Node na Hostinger
- Banco de dados MySQL via Hostinger (API intermediária no servidor)

---

## 2. Estrutura de Pastas

```
salvee-html/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── router.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── institution.ts
│   │   ├── post.ts
│   │   ├── donation.ts
│   │   └── gamification.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── feed.service.ts
│   │   ├── institution.service.ts
│   │   ├── donation.service.ts
│   │   ├── search.service.ts
│   │   ├── gamification.service.ts
│   │   ├── calendar.service.ts
│   │   └── user.service.ts
│   ├── screens/
│   │   ├── splash/
│   │   ├── welcome/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── feed/
│   │   ├── search/
│   │   ├── institution-profile/
│   │   ├── donation/
│   │   ├── calendar/
│   │   ├── profile/
│   │   └── settings/
│   ├── components/
│   │   ├── BottomNav.ts
│   │   ├── Button.ts
│   │   ├── Input.ts
│   │   ├── Card.ts
│   │   ├── Avatar.ts
│   │   ├── Badge.ts
│   │   ├── ProgressBar.ts
│   │   ├── BottomSheet.ts
│   │   ├── Toast.ts
│   │   ├── Spinner.ts
│   │   └── NumericKeyboard.ts
│   └── styles/
│       └── global.css
```

---

## 3. Arquitetura de Telas

**Contrato de cada tela:**

```typescript
// Cada screen/ exporta:
export function render(): HTMLElement
export function mount?(): void    // chamado após injeção no DOM
export function unmount?(): void  // chamado antes de trocar de tela
```

O router chama `render()`, injeta no `<div id="app">`, depois chama `mount()`.

---

## 4. Roteamento

Roteador hash em `src/router.ts` (~30 linhas). Escuta `hashchange` e mapeia rotas para telas.

| Rota | Tela |
|---|---|
| `/#/` | Splash |
| `/#/welcome` | Boas-vindas |
| `/#/login` | Login |
| `/#/register` | Cadastro de usuário |
| `/#/register/institution` | Cadastro de instituição (multi-step) |
| `/#/forgot-password` | Esqueci senha |
| `/#/feed` | Feed principal |
| `/#/search` | Busca e descoberta |
| `/#/institution/:id` | Perfil institucional |
| `/#/donate/:id` | Fluxo de doação |
| `/#/calendar` | Calendário / Minhas ações |
| `/#/profile` | Perfil do usuário + gamificação |
| `/#/settings` | Configurações |

**Guard de rota:** verifica JWT em `localStorage` antes de renderizar rotas protegidas. Redireciona para `/#/welcome` se não autenticado.

**Bottom Nav:** visível apenas em rotas autenticadas (feed, search, calendar, profile). Oculto em auth/onboarding.

**Fluxos multi-step** (doação, cadastro de instituição): gerenciam estado interno por step dentro da própria tela, sem sub-rotas.

---

## 5. Camada de Serviços

**Base:**

```typescript
// src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL
// ex: https://seudominio.com/api

async function request<T>(endpoint: string, options?: RequestInit): Promise<T>
```

Token JWT injetado automaticamente no header `Authorization: Bearer <token>` em todas as requisições autenticadas.

**Serviços:**

| Arquivo | Métodos principais |
|---|---|
| `auth.service.ts` | login, register, logout, refreshToken, forgotPassword |
| `feed.service.ts` | listPosts, getPostById |
| `institution.service.ts` | getById, list, search, register, uploadDocs |
| `donation.service.ts` | initiate, confirm, getHistory |
| `search.service.ts` | searchByQuery, listCategories |
| `gamification.service.ts` | getBalance, listRewards, redeemReward |
| `calendar.service.ts` | getEvents, registerForEvent |
| `user.service.ts` | getProfile, updateProfile, uploadAvatar |

---

## 6. Tipos Principais

```typescript
// src/types/user.ts
interface User { id, name, email, avatarUrl, xp, salves, level }

// src/types/institution.ts
interface Institution { id, name, category, verified, logoUrl, description, status }
type InstitutionStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision'

// src/types/post.ts
interface Post { id, institutionId, type, content, createdAt }
type PostType = 'common' | 'campaign' | 'event'

// src/types/donation.ts
interface Donation { id, institutionId, amount, paymentMethod, anonymous, xpEarned, salvesEarned }

// src/types/gamification.ts
interface Reward { id, title, description, cost, partnerLogoUrl }
interface GameBalance { xp, salves, level, xpToNextLevel }
```

---

## 7. Componentes Reutilizáveis

| Componente | Descrição |
|---|---|
| `BottomNav` | Barra fixa inferior com 4 ícones (Feed, Busca, Calendário, Perfil) |
| `Button` | Variantes: primário (laranja), secundário (outline), ghost, destrutivo |
| `Input` | Campo com label, mensagem de erro e ícone opcional |
| `Card` | Container para posts, instituições e recompensas |
| `Avatar` | Foto circular com fallback de iniciais |
| `Badge` | Selo de verificação laranja para instituições aprovadas |
| `ProgressBar` | Barra de progresso para campanhas de arrecadação |
| `BottomSheet` | Modal deslizante de baixo para cima |
| `Toast` | Notificação temporária de sucesso/erro/info |
| `Spinner` | Indicador de carregamento |
| `NumericKeyboard` | Teclado numérico customizado para tela de doação |

---

## 8. Estilização

**Tokens Tailwind customizados:**

```js
// tailwind.config.ts
colors: {
  salvee: {
    orange:       '#FF6B00',
    'orange-light': '#FF8533',
    'orange-bg':  '#FFF3EC',
  }
}
```

**Padrões mobile-first:**
- Largura máxima: `max-w-md mx-auto` (390px — iPhone 14)
- Safe area inferior: `pb-safe` (suporte à barra home do iOS)
- Fonte: Inter (Google Fonts)
- Ícones: Lucide Icons (tree-shakeable)

---

## 9. Telas e Fluxos Cobertos (V1)

### Auth / Onboarding
- Splash screen com checagem de token
- Boas-vindas: "Comece aqui" / "Já tenho conta"
- Login (e-mail + senha) com opções de login social (Google, Apple, Facebook)
- Cadastro de usuário (nome, e-mail, senha, aceite de termos)
- Verificação de número de telefone (OTP)
- Cadastro de instituição (6 etapas: identificação, dados formais, atuação, visual, histórico, documentação)
- Esqueci senha

### App Principal
- Feed com 3 tipos de post (comum, campanha, evento)
- Busca por nome/categoria/palavra-chave + geolocalização
- Perfil institucional (carrossel, abas: Mural / Sobre / Info)
- Fluxo de doação (valor → mensagem → pagamento → resumo → sucesso)
- Calendário de eventos
- Perfil do usuário com XP, Salves, nível e recompensas
- Configurações (perfil, notificações, geral, acessibilidade, pagamentos, segurança, sobre)

---

## 10. Hospedagem (Hostinger)

- Build: `vite build` gera `dist/` com arquivos estáticos
- Deploy: upload da pasta `dist/` via FTP ou File Manager da Hostinger
- API: PHP ou Node.js no mesmo plano Hostinger, conectando ao MySQL
- Variável de ambiente: `VITE_API_URL=https://seudominio.com/api` em `.env`
- CORS: configurado na API do servidor para aceitar o domínio do frontend

---

## 11. Fora do Escopo (V1)

- Pagamento via cartão de crédito
- Chat direto usuário ↔ instituição
- Doação anônima
- IA avançada no algoritmo do feed
- Painel administrativo web
