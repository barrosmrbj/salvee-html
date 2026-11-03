# Integração com o Mercado Pago (PIX real): plano por etapas

Situação em 03/11/2026 (v1.20.2): **nada implementado.** A doação é registrada como "pendente" e o admin ou o gestor confirma à mão.
Objetivo: o doador paga um PIX de verdade e a doação é confirmada sozinha quando o pagamento cai (o webhook substitui a confirmação manual).

## Status: aguardando o cliente

Mensagem enviada ao cliente em **03/11/2026** (texto completo no fim deste documento). Respostas:

| Pergunta | Resposta | Data |
|---|---|---|
| Modelo: A (cada instituição recebe direto) ou B (conta do Salvee repassa)? | _aguardando_ | |
| Taxa do Salvee sobre as doações | _aguardando_ | |
| A conta Mercado Pago atual é CPF ou CNPJ? | _aguardando_ | |
| Aplicação criada em developers → Suas integrações? | _aguardando_ | |
| Credenciais de teste repassadas (por canal seguro, nunca neste arquivo) | _aguardando_ | |
| Instituição piloto (com conta MP e chave PIX) | _aguardando_ | |

Quando as respostas chegarem: preencher a tabela, ajustar as etapas ao modelo escolhido e começar pela etapa 2.

---

## 0. Decisão que vem antes de tudo: para onde vai o dinheiro?

Os Termos de uso (`src/content/legal.ts`) dizem que **"o Salvee é um intermediário tecnológico... não é o beneficiário das doações"** e que **"a doação é feita diretamente para a instituição escolhida"**. Isso define o modelo:

| Modelo | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Cada instituição recebe direto (recomendado)** | Cada instituição tem a própria conta Mercado Pago e a liga ao Salvee com um clique ("Conectar Mercado Pago"). O PIX cai direto na conta dela. No Mercado Pago isso se chama modelo *marketplace* (com login OAuth, que é a instituição autorizando o Salvee a gerar cobranças em nome dela). | Coerente com os Termos. O Salvee não toca no dinheiro, não precisa repassar valores e não responde por eles. Dá para cobrar uma taxa do Salvee no futuro, se quiser. | Toda instituição precisa ter conta Mercado Pago com chave PIX. Desenvolvimento um pouco maior. |
| B. Tudo cai na conta do Salvee | Uma conta só recebe todas as doações e o Salvee repassa às instituições. | Mais simples de programar. | **Contraria os Termos.** O Salvee passa a ser recebedor (com impacto em impostos, contabilidade e responsabilidade), e o repasse é manual e arriscado. Exige mudar os Termos e falar com um contador. |

**Este plano segue o modelo A.** Se o cliente escolher o B, as etapas 3 e 4 ficam mais simples e a etapa 1 muda (ver o fim do documento).

---

## 1. O que pedir ao cliente

### 1.1 Sobre a conta que já foi criada (descobrir se é CPF ou CNPJ)
Peça ao cliente que entre em mercadopago.com.br → **Seu perfil → Dados da conta** (ou "Informações pessoais/da empresa"). Se aparecer **CNPJ e razão social**, a conta é PJ; se aparecer **CPF**, é PF.

- **No modelo A**, a conta do Salvee só serve para criar o "aplicativo" de integração. O ideal é que seja **PJ, no CNPJ da empresa do Salvee** (o mesmo de `src/config/empresa.ts`), porque o app aparece para as instituições com o nome do Salvee e a empresa responde por ele.
- **Se for PF:** dá para testar, mas o recomendado é criar uma conta PJ antes de ir para produção. Não é possível "converter" uma conta PF em PJ: é preciso uma conta nova com o CNPJ.

### 1.2 Dados e acessos a pedir

| # | O quê | Onde o cliente encontra | Para que serve |
|---|---|---|---|
| 1 | Confirmar a **escolha do modelo (A ou B)** | Decisão do negócio | Define todo o resto |
| 2 | Conta Mercado Pago **PJ** do Salvee, com e-mail e CNPJ | mercadopago.com.br | Dona da integração |
| 3 | Criar uma **aplicação** em *Suas integrações* (developers) | mercadopago.com.br/developers → Suas integrações → Criar aplicação. Tipo: **Pagamentos online**, com a opção de **marketplace / pagamentos para terceiros** (no modelo A) | Gera as credenciais |
| 4 | **Credenciais de teste**: Public Key e Access Token | Aplicação → Credenciais de teste | Desenvolver e testar no localhost |
| 5 | **Credenciais de produção**: Public Key, Access Token, **Client ID** e **Client Secret** | Aplicação → Credenciais de produção (o MP pede alguns dados do negócio para liberar) | Modelo A: Client ID e Secret fazem o "Conectar Mercado Pago" das instituições |
| 6 | **Chave secreta do webhook** (assinatura) | Aplicação → Webhooks → configurar URL → "Assinatura secreta" | Garante que o aviso de "pago" veio mesmo do Mercado Pago |
| 7 | Uma **instituição piloto** com conta Mercado Pago e **chave PIX cadastrada** | Conta da instituição → Seu dinheiro → Chaves PIX | Primeiro teste real |
| 8 | Taxa combinada, se houver (o Salvee fica com algum %? padrão: 0%) | Decisão do negócio | Campo de taxa do marketplace |
| 9 | Prazo de validade do QR (sugestão: 30 minutos) | Decisão do negócio | Expiração da cobrança |

> **Segurança:** o Access Token e o Client Secret dão acesso ao dinheiro da conta. Não devem ser mandados por e-mail ou WhatsApp em texto aberto. O ideal é o próprio cliente colar esses valores nas variáveis do Node.js App da Hostinger (hPanel), ou você os recebe por um canal seguro e cola lá. **Nunca vão para o git.**

### 1.3 O que cada instituição vai precisar (modelo A)
- Conta Mercado Pago no **CNPJ da instituição**, com **chave PIX** cadastrada.
- Clicar uma vez em "Conectar Mercado Pago" na tela Minha instituição e autorizar.
- Sem conta conectada, a instituição aparece normalmente, mas o botão **Doar** fica desativado com o aviso "Esta instituição ainda não recebe doações pelo app".

---

## 2. O que usamos do Mercado Pago (parte técnica, resumida)

- **API de Pagamentos** (`POST /v1/payments` com `payment_method_id: "pix"`): gera a cobrança e devolve o **QR Code** (imagem) e o código **"copia e cola"**.
- **OAuth** (só no modelo A): a instituição autoriza o Salvee e recebemos um token dela (renovável; vence em cerca de 6 meses e é renovado sozinho).
- **Webhook** (notificação do tipo `payment`): o Mercado Pago chama `https://<domínio>/api/payments/webhook` quando o pagamento muda de situação. O servidor **confere a assinatura** e **consulta o pagamento na API** antes de confirmar; nunca confia só no aviso.
- **Chave de idempotência** (`X-Idempotency-Key`): evita cobrança em dobro se o doador tocar duas vezes.
- Biblioteca oficial `mercadopago` (npm) no `server/`. **Precisa da sua autorização para instalar.**

---

## 3. Etapas de desenvolvimento

Cada etapa é feita e testada em **localhost** antes de ir para a Hostinger, como manda o fluxo do projeto.

### Etapa 1: preparação (cliente) · sem código
- [ ] Cliente decide o modelo (A ou B) e a taxa.
- [ ] Confirmar se a conta é PF ou PJ; criar a conta PJ se for preciso.
- [ ] Criar a aplicação e passar as **credenciais de teste**.
- [ ] Indicar a instituição piloto.

### Etapa 2: banco de dados e configuração · ~meio dia
- [ ] Novas colunas em `donations` (pelo `initDb()`, valem para SQLite e MySQL): `mp_payment_id`, `pix_qr_code`, `pix_expires_at`, `paid_at`.
- [ ] Modelo A: tabela `institution_payment_accounts` (instituição, id do vendedor no MP, tokens **criptografados**, data de vencimento).
- [ ] Variáveis de ambiente: `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_CLIENT_ID`, `MP_CLIENT_SECRET`, `MP_WEBHOOK_SECRET`, `MP_FEE_PERCENT`. Sem elas, o app continua como hoje (confirmação manual), igual ao e-mail e ao login social.
- [ ] Atualizar `docs/configuracao/mysql.md` e o `CLAUDE.md`.

### Etapa 3: conectar a instituição (só no modelo A) · ~1 dia
- [ ] Rotas `GET /api/payments/connect/:institutionId` (leva ao Mercado Pago) e `GET /api/payments/connect/callback` (guarda o token).
- [ ] Só o responsável pela instituição aprovada (ou o admin) pode conectar ou desconectar.
- [ ] Na tela **Minha instituição**: o botão "Conectar Mercado Pago" e o estado "Conectado como …", com a opção de desconectar.
- [ ] Renovação automática do token antes de vencer.

### Etapa 4: gerar o PIX · ~1 dia
- [ ] `POST /api/donations/initiate` passa a criar o pagamento no MP (com o token da instituição no modelo A) e devolve o QR, o "copia e cola" e o prazo.
- [ ] O valor e a instituição são sempre conferidos no servidor; o app não manda o preço "pronto".
- [ ] Tela de doação: QR Code, botão **Copiar código PIX**, contagem do prazo, aviso "aguardando pagamento" e consulta a cada poucos segundos (`GET /api/donations/:id/status`).
- [ ] O QR expirou: a doação vira `cancelled` e o app oferece "Gerar novo PIX".

### Etapa 5: webhook (confirmação automática) · ~1 dia
- [ ] Rota `POST /api/payments/webhook`: confere a assinatura (`x-signature`) e consulta o pagamento na API do MP.
- [ ] `approved` → a doação vira `confirmed` usando **a mesma função** da confirmação manual (credita XP/Salves e soma na campanha uma única vez, já protegida contra duplicidade).
- [ ] `cancelled`, `rejected` ou `expired` → `cancelled`; `refunded` ou `charged_back` → registrar e avisar o admin (sem tirar pontos automaticamente na V1).
- [ ] Avisos repetidos do MP não podem creditar duas vezes.
- [ ] A tela de admin "Confirmar doações" continua existindo como plano B.

### Etapa 6: testes em localhost · ~meio dia
- [ ] Testes automáticos (vitest) da assinatura do webhook, da proteção contra crédito em dobro e das regras de acesso.
- [ ] Teste com as **credenciais de teste** e os usuários de teste do MP.
- [ ] Para receber o webhook no localhost é preciso um túnel (ex.: ngrok), o que exige instalar um programa (**perguntar antes**). Alternativa: simular o aviso com um script.
- [ ] Revisão do agente `revisor-seguranca`.

### Etapa 7: produção · ~meio dia
- [ ] Cadastrar a URL do webhook no painel do MP: `https://<domínio>/api/payments/webhook` (e, no modelo A, a URL de retorno `https://<domínio>/api/payments/connect/callback`).
- [ ] Colocar as credenciais **de produção** nas variáveis do Node.js App (hPanel).
- [ ] Versão **1.21.0**, build, commit e push na `master`.
- [ ] **Teste real com R$ 1,00** na instituição piloto: pagar, ver a doação confirmar sozinha e o dinheiro aparecer na conta da instituição.
- [ ] Atualizar os Termos e a Política (citar o Mercado Pago como provedor de pagamento) e gerar os PDFs de novo (`npm run legal:pdf`).
- [ ] Atualizar `docs/PENDENCIAS.md` (item 14/15 → ✅).

**Estimativa total de desenvolvimento:** cerca de 4 a 5 dias de trabalho depois que as credenciais de teste chegarem (o modelo B economiza mais ou menos 1 dia).

---

## 4. Se o cliente escolher o modelo B (tudo na conta do Salvee)
- Pular a etapa 3. Usar só o `MP_ACCESS_TOKEN` da conta do Salvee.
- A conta **precisa** ser PJ com chave PIX.
- Criar um controle de **repasses** (quanto cada instituição tem a receber e quando foi pago), que hoje não existe.
- **Reescrever os Termos** ("o Salvee recebe e repassa") e consultar um contador sobre impostos.

---

## 5. Mensagem enviada ao cliente (03/11/2026)

> Olá! Tudo bem?
>
> Estamos prontos para começar a integração do **PIX com o Mercado Pago** no Salvee. Com ela, o doador paga pelo app e a doação é confirmada sozinha, sem precisar de aprovação manual.
>
> Antes de começar, preciso de algumas definições e acessos seus:
>
> **1. Para onde vai o dinheiro das doações?**
> Hoje os Termos de uso dizem que o Salvee é só um intermediário e que a doação vai direto para a instituição. Temos duas opções:
> - **Opção A (recomendada):** cada instituição recebe na própria conta Mercado Pago. Ela conecta a conta no app com um clique e o PIX cai direto para ela. O Salvee não toca no dinheiro.
> - **Opção B:** todas as doações caem na conta do Salvee e vocês repassam às instituições. É mais simples no começo, mas obriga a mudar os Termos, falar com o contador sobre impostos e fazer os repasses à mão.
>
> Qual das duas vocês preferem?
>
> **2. O Salvee vai ficar com alguma taxa das doações?** (Ex.: 0%, 2%...)
>
> **3. A conta Mercado Pago que vocês criaram é de pessoa física (CPF) ou de empresa (CNPJ)?**
> Para conferir: entre em mercadopago.com.br → **Seu perfil → Dados da conta**. Se aparecer CNPJ e razão social, é de empresa.
> O ideal é usar uma conta **no CNPJ do Salvee**. Se a atual for CPF, ela serve para os testes, mas antes de lançar será preciso criar uma conta de empresa.
>
> **4. Criar a "aplicação" de integração** (leva uns 5 minutos):
> 1. Entre em **mercadopago.com.br/developers** com a conta do Salvee.
> 2. Clique em **Suas integrações → Criar aplicação**.
> 3. Dê o nome "Salvee", escolha **Pagamentos online** e, se perguntar, marque que vai receber pagamentos para terceiros/marketplace (caso escolham a opção A).
> 4. Depois disso, me avise para combinarmos como passar as **credenciais de teste**.
>
> ⚠️ **Importante:** essas credenciais funcionam como a senha da conta. **Não envie por WhatsApp ou e-mail em texto aberto.** Podemos fazer por chamada de vídeo, com você colando direto no painel da hospedagem, ou combinamos outra forma segura.
>
> **5. Uma instituição piloto:** indique uma instituição parceira que tenha (ou possa criar) uma conta Mercado Pago com **chave PIX cadastrada**. Vamos usá-la no primeiro teste real, com uma doação de R$ 1,00.
>
> Com essas respostas e as credenciais de teste, o desenvolvimento leva **cerca de 4 a 5 dias**. Tudo será testado antes de ir ao ar, e a confirmação manual continua funcionando enquanto isso.
>
> Qualquer dúvida, estou à disposição!
