# Erro 403 (e tela branca) ao publicar na Hostinger: o que aconteceu no Salvee e como foi resolvido

Documento para levar a outro projeto. Resume os problemas de publicação que o Salvee teve na
Hostinger (outubro/2026, versões 1.4.2 → 1.6.3) e as correções que funcionaram.

> **Observação honesta:** no histórico do Salvee não há um registro escrito com a palavra "403".
> Os problemas registrados foram "tela branca" e "o site serve os arquivos errados", que têm a
> **mesma causa** do 403 mais comum na Hostinger: a pasta `public_html` não tem um `index.html`
> pronto para servir. As correções abaixo resolvem as duas coisas.

---

## 1. O que é o erro 403

"403 Forbidden" = o servidor **encontrou** o endereço, mas **se recusa** a mostrar. Na Hostinger
isso quase sempre é uma destas situações:

| Causa | Como reconhecer |
|---|---|
| **A pasta publicada não tem `index.html`** (ou `index.php`) e a listagem de pastas está desligada | 403 na página inicial (`/`), mas um arquivo direto (ex.: `/assets/x.js`) abre |
| **O Git publicou o repositório inteiro sem build** e o `index.html` está dentro de `dist/` (ou outra subpasta) | Na raiz do `public_html` só tem `src/`, `package.json`, `dist/`... |
| **`.htaccess` com regra errada** (ou faltando) | 403 em todas as páginas logo depois de mexer no `.htaccess` |
| **Permissões de arquivo/pasta erradas** | Pastas precisam de `755` e arquivos de `644` (hPanel → Gerenciador de arquivos → Permissões) |
| **Arquivo protegido de propósito** (`.env`, `.git/`) | Normal e desejado: esses **devem** dar 403 |
| **403 vindo da API** (resposta JSON `{ "error": "Acesso negado" }`) | Não é a hospedagem: é o seu código recusando (usuário sem permissão / sem login) |

## 2. O que aconteceu no Salvee

O projeto é Vite + TypeScript (frontend) e Node/Express (API). O código-fonte **não pode** ser
servido direto: precisa passar pelo `npm run build`, que gera os arquivos finais numa pasta.

1. **v1.4.2 — tela branca.** A Hostinger (Git → `public_html`) copiava o repositório **sem rodar
   o build**. O `index.html` da raiz era o de desenvolvimento e carregava `/src/main.ts`
   (TypeScript, que o navegador não entende). Resultado: página em branco. Sem `index.html` na
   raiz, o resultado seria um 403.
2. **Tentativa que foi descartada:** uma GitHub Action que gerava o build e publicava numa branch
   separada. Funcionava, mas complicava o fluxo (duas branches). Removida na v1.4.3.
3. **v1.4.3 — solução que funcionou no site estático:** o **build passou a ser commitado** no git
   e um **`.htaccess` na raiz** manda toda requisição para a pasta do build:

   ```apache
   # .htaccess na RAIZ do repositório (= raiz do public_html)
   # Serve tudo a partir de dist/ e esconde o código-fonte.
   Options -Indexes -MultiViews
   DirectoryIndex index.html

   RewriteEngine On
   RewriteCond %{REQUEST_URI} !^/dist/
   RewriteRule ^(.*)$ dist/$1 [L]
   ```

   E dentro da pasta do build (`dist/.htaccess`, vindo de `public/.htaccess` no Vite), a regra de
   "app de uma página só" (SPA), para que qualquer rota caia no `index.html`:

   ```apache
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^ index.html [L]
   ```

   O que cada linha faz:
   - `Options -Indexes`: não lista os arquivos da pasta (sem isso, ou aparece a lista ou dá 403).
   - `DirectoryIndex index.html`: diz qual arquivo abrir quando acessam só a pasta.
   - `RewriteRule ... dist/$1`: "o site de verdade está em `dist/`".
   - Efeito colateral bom: `src/`, `server/`, `.env` deixam de ser acessíveis pela web.

4. **v1.6.0 → 1.6.3 — mudança para Node.js App.** Como havia API em Node, o site estático não
   bastava: o domínio só devolvia HTML, inclusive em `/api/...`. A solução final foi criar um
   **Node.js App** no hPanel (outro domínio), em que o próprio Express serve o build e a API:
   - Build do Vite sai em `server/public/` (`vite.config.ts` → `build.outDir`) e é commitado.
   - O Express serve essa pasta e devolve `index.html` para qualquer rota fora de `/api`.
   - `VITE_API_URL=/api` (relativo) no `.env.production`: frontend e API no mesmo domínio.
   - Configuração no hPanel: predefinição Express, branch `master`, Node 22, diretório raiz `./`,
     arquivo de entrada `server/index.js`, variáveis de ambiente no painel do app.

## 3. Checklist para o outro projeto

1. **Descobrir o que está no `public_html`.** hPanel → Gerenciador de arquivos (ou SSH).
   Tem `index.html` direto na raiz? Se não tem, essa é a causa do 403.
2. **O projeto precisa de build?** (Vite, React, Vue, Angular, Next, TypeScript = sim)
   - Rode `npm run build` no computador.
   - Escolha **um** caminho:
     - **A)** Subir só o conteúdo da pasta do build (`dist/`) para o `public_html`; ou
     - **B)** Commitar a pasta do build e usar o `.htaccess` da raiz do item 2.3 acima
       (troque `dist` pelo nome da sua pasta). Foi o que o Salvee fez.
3. **É um app de uma página só com rotas** (`/login`, `/painel`)? Coloque o `.htaccess` de SPA
   dentro da pasta do build. Sem ele, recarregar a página numa rota dá 404.
4. **Tem backend Node/Express?** Site estático não roda Node. Use um **Node.js App** no hPanel
   (o plano precisa ter essa opção) e deixe o Express servir o build.
5. **Permissões:** pastas `755`, arquivos `644`.
6. **Mexeu no `.htaccess` e piorou?** Renomeie para `.htaccess-off` e teste: se o 403 sumir, o
   problema está nele.
7. **Teste:** abra o site em janela anônima (sem cache) e confira `/` e uma rota interna.

## 4. Armadilhas que o Salvee também encontrou (úteis para o outro projeto)

- **Esqueceu de rodar o build antes do push** = a Hostinger publica a versão antiga.
- **Arquivo editado direto no Gerenciador de arquivos da Hostinger** some no próximo deploy.
- **Tipo de arquivo errado:** o servidor da Hostinger (LiteSpeed) entregou `manifest.webmanifest`
  como texto puro. Renomear para `manifest.json` resolveu.
- **Cache longo de imagens** (`/icons/` fica 1 ano em cache): trocou a imagem, troque o nome.
- **Logos de login social (Google/Facebook/Apple) sem login funcionando** e **redirecionamento
  automático para outro domínio** fizeram o Chrome marcar o site como "Perigoso". Mostrar só o
  que funciona e usar uma página com link em vez de redirecionar.

## 5. Onde ver os detalhes no Salvee

- Commits: `f7b87a0` (v1.4.2), `09c8583` (v1.4.3), `7cff15d` (v1.6.0), `3db894e` (v1.6.3), `a4df086` (v1.9.2).
- `CLAUDE.md` do Salvee, seções "Fluxo de trabalho" e "Deploy na Hostinger".
- `CHANGELOG.md`, versões 1.4.2 a 1.6.3.
