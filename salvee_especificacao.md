# Especificação Funcional - SALVEE
> Versão base para desenvolvimento do aplicativo (MVP/V1)

## 1. Visão Geral do Produto
O **Salvee** é um ecossistema de impacto social desenhado para conectar doadores e voluntários a instituições e causas sociais. Seu propósito é tornar a solidariedade mais acessível, transparente e organizada.

### 1.1 Pilares do Ecossistema
1. **Descoberta:** Encontro de instituições e causas.
2. **Apoio Financeiro:** Fluxo simplificado de doações.
3. **Engajamento:** Participação em ações e eventos.
4. **Gamificação:** Fidelização através de recompensas e níveis (XP/Salves).

### 1.2 Diferencial Estratégico
O "Mecanismo de Redistribuição de Atenção": o algoritmo prioriza instituições menos ajudadas ou com menor visibilidade para evitar a concentração de recursos apenas em organizações já populares.

---

## 2. Perfis de Usuário
O sistema opera com dois tipos principais de conta:

| Perfil | Descrição | Validação |
| :--- | :--- | :--- |
| **Usuário Comum** | Pessoas físicas que buscam apoiar causas, doar e participar de eventos. | Automática (sem fila). |
| **Instituição** | ONGs, abrigos, asilos, projetos sociais, etc. | **Manual (equipe Salvee)**. |

---

## 3. Fluxo de Entrada e Autenticação
1. **Splash Screen:** Exibição da marca e checagem de autenticação.
2. **Boas-vindas:** Escolha entre "Comece aqui" (Cadastro) ou "Já tenho conta" (Login).
3. **Escolha de Perfil:** Definição estrutural entre Usuário ou Instituição.
4. **Login:** E-mail/Senha com suporte previsto para Login Social (Google, Apple, Facebook).
5. **Esqueci Senha:** Recuperação via e-mail.

---

## 4. Cadastro Detalhado

### 4.1 Usuário Comum
* **Dados:** Nome, e-mail, senha e aceite de termos.
* **Pós-cadastro:** Direcionamento imediato para o Feed.

### 4.2 Instituição (Fluxo em Etapas)
> **Qualquer usuário logado pode registrar uma instituição.** O cadastro é independente do perfil do usuário — o responsável pela instituição é definido pelos dados informados no próprio formulário (nome, e-mail e telefone de contato), sem vínculo com a conta que realizou o registro.

1. **Identificação:** Nome da instituição, responsável e contatos.
2. **Dados Formais:** CNPJ (se houver), endereço completo.
3. **Atuação:** Categoria, subcategoria e descrição do público atendido.
4. **Visual:** Logo, fotos do local e de ações.
5. **Histórico:** Missão, ano de fundação e história.
6. **Documentação:** Envio de arquivos para validação administrativa.

**Estados da Conta Institucional:**
* `pending`: Em análise (experiência limitada).
* `approved`: Ativo e público. Campo `verified = true` ativado automaticamente.
* `rejected`: Reprovado (acesso negado com motivo armazenado em `rejection_reason`).
* `needs_revision`: Pendência de correção.

---

## 5. Funcionalidades do Aplicativo (V1)

### 5.1 Feed (Tela Principal)
* **Algoritmo:** Equilíbrio entre afinidade, urgência e impulsionamento de baixa visibilidade.
* **Tipos de Post:**
    * **Post Comum:** Mensagens e atualizações (Botão "Ajudar").
    * **Campanha:** Foco em arrecadação com barra de progresso (Botão "Doar").
    * **Evento:** Ações com data e local (Botão "Participar").

### 5.2 Perfil Institucional
* **Visual:** Carrossel de fotos institucionais e logo.
* **Abas:**
    * **Mural:** Timeline de postagens da instituição.
    * **Sobre:** História, missão e visão.
    * **Info:** Dados práticos (Endereço com mapa, CNPJ, telefone com discador).
* **CTA:** Botão fixo "Ajudar".

### 5.3 Fluxo de Doação
1. **Valor:** Inserção via teclado numérico + mensagem opcional.
2. **Pagamento (V1):** Prioridade para **PIX** (e PayPal se disponível). *Cartão de Crédito fora da V1*.
3. **Resumo:** Revisão da instituição, valor e pontuação a ser gerada.
4. **Confirmação:** Feedback de sucesso/erro e registro de pontos.
5. **Histórico de Doações** *(implementado)*: Acessível na aba "Histórico" do perfil do usuário.
   * **Card resumo:** Total doado (R$), XP ganho e Salves ganhos acumulados.
   * **Lista cronológica:** Cada doação exibe logo + nome da instituição, data, método de pagamento, valor e pontuação obtida (+XP / +SLV).
   * **Dados:** Backend retorna `institutionName` e `institutionLogoUrl` via JOIN — sem chamadas extras ao frontend.
   * **Fallback:** Mock de 3 doações exibido quando API indisponível.

### 5.4 Busca e Descoberta
* **Barra de Pesquisa:** Busca por nome, categoria ou palavra-chave.
* **Categorias:** Filtros rápidos (Saúde, Crianças, Idosos, etc.).
* **Destaques:** Instituições que precisam de mais visibilidade.
* **Perto de Você:** Uso de geolocalização para causas locais (com fallback para cidade manual).

### 5.5 Gamificação
* **XP:** Experiência para subir de nível.
* **Salves:** Moeda virtual para troca por recompensas de parceiros.
* **Resgate:** Geração de QR Code único para validação em estabelecimentos parceiros.

### 5.6 Calendário (Minhas Ações)
* Lista cronológica de eventos onde o usuário clicou em "Participar".
* Notificações de lembrete e alterações de horário/local.

---

## 6. Painel Administrativo (Backend/Web)
Essencial para a governança do app.

### 6.1 Perfis com Acesso Administrativo
Dois perfis têm acesso às funções de gestão de contas institucionais:

| Role | Descrição | Como obter |
| :--- | :--- | :--- |
| `admin` | Superusuário. Acesso total. Pode delegar `gestor`. | Criado via seed (`admin@salvee.com`). |
| `gestor` | Gestor de conta institucional delegado. Pode aprovar/rejeitar instituições. | Delegado pelo `admin` via `PATCH /api/admin/users/:id/role`. |

### 6.2 Endpoints Administrativos
Todos exigem autenticação (`Bearer token`).

| Método | Rota | Acesso | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users?name=...` | `admin` | Lista todos os usuários com filtro por nome. |
| `PATCH` | `/api/admin/users/:id/role` | `admin` | Delega ou revoga role `gestor` de um usuário. |
| `GET` | `/api/admin/institutions?status=&name=` | `admin`, `gestor` | Lista instituições com filtros de status e nome. |
| `PATCH` | `/api/admin/institutions/:id/status` | `admin`, `gestor` | Altera status: `approved`, `rejected`, `needs_revision`. |

### 6.3 Regras de Negócio
* A role `admin` nunca pode ser alterada via API (protegida no endpoint).
* Ao aprovar (`approved`), o campo `verified` é definido como `true` automaticamente.
* Ao rejeitar, o campo `rejection_reason` é armazenado e visível ao responsável.
* Moderação de conteúdo e categorias.
* Monitoramento de campanhas e doações.
* Gestão de recompensas e parceiros.

---

## 7. Requisitos Técnicos e Regras de Negócio
* **Selo de Verificação:** Visível apenas para instituições aprovadas.
* **Persistência:** Usuários logados devem cair direto no Feed.
* **Offline:** Previsão de mensagens de erro amigáveis para falhas de conexão.
* **Configurabilidade:** O sistema de cálculo de XP/Salves deve ser flexível no backend.

---

## 8. Fora do Escopo (Versões Futuras)
* Doação anônima.
* Chat direto entre usuário e instituição.
* IA avançada no algoritmo.
* Pagamento via Cartão de Crédito (se complexidade alta na V1).