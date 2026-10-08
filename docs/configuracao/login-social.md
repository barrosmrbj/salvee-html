# Login social: como configurar (Google, Facebook, Apple)

O código já está pronto (v1.8.0, `server/routes/oauth.js`). Cada rede só fica ativa depois que as
credenciais dela forem colocadas nas **variáveis de ambiente do app na Hostinger**. Até lá, o botão
mostra "Entrar com … estará disponível em breve".

> **Quem deve criar as contas:** o dono do app (a instituição/cliente), com um e-mail próprio do
> projeto (ex.: `contato@salvee...`). As contas de desenvolvedor ficam no nome dele, e não no de quem
> desenvolveu. Nunca colar a chave secreta em chat, e-mail ou no git.

Endereço do site em produção: `https://skyblue-hedgehog-581364.hostingersite.com`
(se o domínio mudar, trocar nas URIs de retorno abaixo e no cadastro de cada rede).

---

## Google (grátis, ~15 min) — começar por este

### Parte 1: entrar e criar o projeto
1. Abrir **https://console.cloud.google.com** com a conta Google do projeto.
2. No primeiro acesso: aceitar os termos, país **Brasil** → **Concordar e continuar**.
3. No alto, à esquerda, clicar no seletor de projeto → **Novo projeto**.
4. Nome do projeto: `Salvee` → **Criar**.
5. Selecionar o projeto **Salvee** no seletor (o nome dele deve aparecer no alto).

### Parte 2: tela de consentimento (o que o usuário vê ao entrar)
1. Menu ☰ → **APIs e serviços → Tela de permissão OAuth** (pode aparecer como **Google Auth Platform**).
2. **Começar** e preencher:

| Campo | Valor |
|---|---|
| Nome do app | `Salvee` |
| E-mail para suporte do usuário | e-mail do projeto |
| Público (Audience) | **Externo** |
| Dados de contato | e-mail do projeto |

3. Concordar com a política de dados → **Criar**.
4. Se pedir **Domínios autorizados**: `hostingersite.com` (ou o domínio próprio, se houver).

### Parte 3: liberar para todos
Sem isso, só "testadores" cadastrados um a um conseguem entrar.
1. Em **Público** (Audience) → **Status de publicação** → **Publicar app** → confirmar.
2. Status: **Em produção**. O Salvee só pede nome, e-mail e foto, então o Google não exige verificação.

### Parte 4: criar as credenciais
1. **Clientes** (ou **APIs e serviços → Credenciais → + Criar credenciais → ID do cliente OAuth**).
2. Preencher:

| Campo | Valor |
|---|---|
| Tipo de aplicativo | **Aplicativo da Web** |
| Nome | `Salvee Web` |
| Origens JavaScript autorizadas | deixar vazio |
| URIs de redirecionamento autorizados | as duas linhas abaixo (uma por **+ Adicionar URI**) |

```
https://skyblue-hedgehog-581364.hostingersite.com/api/auth/oauth/google/callback
http://localhost:8000/api/auth/oauth/google/callback
```
(a primeira é a do site no ar; a segunda, para testar no computador. Sem espaço nem barra no final.)

3. **Criar**.

### Parte 5: guardar os códigos
- **ID do cliente**: termina em `.apps.googleusercontent.com`
- **Chave secreta do cliente**: começa com `GOCSPX-`

Clicar em **Fazer download do JSON** e guardar em local seguro: a chave secreta normalmente só
aparece nesta hora (se perder, gera-se outra).

### Parte 6: colocar na Hostinger
hPanel → app **skyblue-hedgehog** → **Variáveis de ambiente** → **Editar** → **Adicionar mais**:

| Chave | Valor |
|---|---|
| `GOOGLE_CLIENT_ID` | o ID do cliente |
| `GOOGLE_CLIENT_SECRET` | a chave secreta |

Salvar e **reimplantar** o app.

### Parte 7: testar
1. `https://skyblue-hedgehog-581364.hostingersite.com/api/auth/oauth/providers` deve mostrar `"google":true`.
2. No app: tela de login → botão do Google → escolher a conta → volta logado no feed.
3. Para testar no computador: colocar as mesmas duas variáveis no `server/.env` e rodar `npm run dev:all`.

---

## Facebook (grátis; exige política de privacidade publicada)
1. **https://developers.facebook.com** → **Meus apps → Criar app** → caso de uso **Autenticar e solicitar dados dos usuários com o Login do Facebook**.
2. Em **Login do Facebook → Configurações**, em **URIs de redirecionamento do OAuth válidos**:
   `https://skyblue-hedgehog-581364.hostingersite.com/api/auth/oauth/facebook/callback`
3. **Configurações do app → Básico**: copiar **ID do app** e **Chave secreta do app**; preencher URL da
   **Política de privacidade** e de **exclusão de dados** (obrigatórias para publicar).
4. Mudar o app de **Em desenvolvimento** para **Ao vivo** (senão só administradores/testadores entram).
5. Variáveis na Hostinger: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.

## Apple (exige Apple Developer Program, US$ 99/ano)
1. **https://developer.apple.com/account** → **Certificates, Identifiers & Profiles**.
2. **Identifiers → App IDs**: criar um App ID com **Sign in with Apple** ligado.
3. **Identifiers → Services IDs**: criar (ex.: `com.salvee.web`), ligar **Sign in with Apple** →
   **Configure**: domínio `skyblue-hedgehog-581364.hostingersite.com` e Return URL
   `https://skyblue-hedgehog-581364.hostingersite.com/api/auth/oauth/apple/callback`.
4. **Keys**: criar chave com **Sign in with Apple**, baixar o arquivo `.p8` (só baixa uma vez) e anotar o **Key ID**.
5. **Team ID**: canto superior direito da conta (ou em Membership).
6. Variáveis na Hostinger:
   - `APPLE_CLIENT_ID` = o Services ID (ex.: `com.salvee.web`)
   - `APPLE_TEAM_ID`, `APPLE_KEY_ID`
   - `APPLE_PRIVATE_KEY` = conteúdo do `.p8` numa linha só, trocando cada quebra de linha por `\n`

---

## Se algo der errado
- Volta para o login com "Não foi possível entrar": ver o log do app na Hostinger; a linha `[oauth google] ...` diz o motivo.
- Erro do Google `redirect_uri_mismatch`: a URI cadastrada na Parte 4 não está idêntica à do site.
- "Este e-mail já tem conta no Salvee": a rede não confirmou o e-mail; entrar com e-mail e senha.
