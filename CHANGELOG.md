# Histórico de Versões — Salvee

> Arquivo **gerado automaticamente** a partir de `src/config/versoes.json` 
> (`npm run versao:changelog`). Não edite à mão — edite o JSON e regenere.

**Versão atual: 1.20.1**

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
| **1.20.1** | 11/10/2026 | Patch | Logo oficial aparece no menu, na aba e no app instalado (fim do coração antigo em cache) | Sistema |
| **1.20.0** | 11/10/2026 | Minor | Configurações completas: editar perfil, alterar senha, excluir conta, ajuda, Termos de uso e Política de privacidade | Configurações, Autenticação, Perfil, Servidor, Banco de dados |
| **1.19.0** | 11/10/2026 | Minor | Recompensas com QR Code, aba Prêmios e regra de pontos configurável pelo admin | Gamificação, Admin, Doação, Perfil, Feed, Configurações, Servidor, Banco de dados |
| **1.18.4** | 11/10/2026 | Patch | Logo oficial como ícone da aba e do app instalado | Sistema |
| **1.18.3** | 11/10/2026 | Patch | Tablet e computador sem tela esticada: interface ampliada na proporção do celular | Sistema |
| **1.18.2** | 10/10/2026 | Patch | Manifesto do app passa a ser /manifest.json | Sistema, Servidor |
| **1.18.1** | 10/10/2026 | Patch | Manifesto do app com o tipo certo para "Instalar app" | Servidor, Sistema |
| **1.18.0** | 10/10/2026 | Minor | Visual responsivo para celular, tablet e computador e app instalável na tela inicial | Sistema |
| **1.17.0** | 10/10/2026 | Minor | Carrossel "Promoções & metas" na busca, com banners cadastrados pelo admin | Busca, Admin, Configurações, Servidor, Banco de dados |
| **1.16.0** | 10/10/2026 | Minor | Cadastro de instituição só vai para aprovação ao "Enviar para análise" | Onboarding, Instituição, Admin, Perfil, Feed, Servidor |
| **1.15.0** | 10/10/2026 | Minor | Localização no mapa: instituição marca o local e "Perto de mim" com GPS | Busca, Instituição, Onboarding, Servidor, Banco de dados |
| **1.14.0** | 10/10/2026 | Minor | Feed com impulsionamento, perfil da instituição completo e busca reformulada | Feed, Busca, Instituição, Onboarding, Servidor, Banco de dados |
| **1.13.1** | 10/10/2026 | Patch | Escolha Usuário/Instituição depois de criar a conta | Onboarding, Autenticação, Servidor |
| **1.13.0** | 10/10/2026 | Minor | Tela da campanha, seguir instituições e escolha do tipo de conta antes do cadastro | Doação, Feed, Instituição, Onboarding, Autenticação, Configurações, Servidor, Banco de dados |
| **1.12.1** | 08/10/2026 | Patch | Situação do cadastro da instituição no Perfil | Perfil, Instituição |
| **1.12.0** | 08/10/2026 | Minor | Situação da instituição no login, pedido de revisão e reenvio de correções | Onboarding, Instituição, Admin, Autenticação, Feed, Configurações, Servidor, Banco de dados |
| **1.11.0** | 08/10/2026 | Minor | Curtir e comentar publicações, com tela de detalhe do post | Feed, Servidor, Banco de dados |
| **1.10.1** | 08/10/2026 | Patch | Admin volta a listar instituições e cadastro de instituição sem erro na última etapa | Admin, Instituição, Banco de dados, Servidor |
| **1.10.0** | 07/10/2026 | Minor | Instituição publica no feed: posts, eventos e campanhas | Feed, Instituição, Calendário, Doação, Admin, Servidor, Banco de dados |
| **1.9.2** | 07/10/2026 | Patch | Ajustes contra o alerta "Perigoso" do Chrome | Autenticação, Sistema |
| **1.9.1** | 07/10/2026 | Patch | Correções de segurança e ajustes à especificação oficial (PDF) | Instituição, Feed, Busca, Doação, Servidor, Sistema |
| **1.9.0** | 07/10/2026 | Minor | E-mail pela Hostinger: recuperar senha e confirmar cadastro | Autenticação, Onboarding, Servidor, Banco de dados |
| **1.8.1** | 07/10/2026 | Patch | Botão de mostrar senha e verificação por SMS sem travar o cadastro | Autenticação, Onboarding, Servidor |
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

### 1.20.1 — Logo oficial aparece no menu, na aba e no app instalado (fim do coração antigo em cache)

*11/10/2026 · Patch · Sistema*

- Correção: o menu lateral, a aba do navegador e o app instalado continuavam mostrando o coração branco antigo, porque a Hostinger guarda /icons/ em cache por 1 ano e o arquivo novo tinha o mesmo nome
- Ícones com nome novo (icons/salvee-192.png, salvee-512.png, salvee-maskable-512.png, salvee-apple-touch.png, favicon-salvee-32/48.png): todo navegador baixa a logo oficial na hora

Fontes: `public/icons/` · `public/favicon-salvee-32.png` · `public/favicon-salvee-48.png` · `public/manifest.json` · `index.html` · `src/components/BottomNav.ts` · `src/screens/conta/sobre.ts` · `CLAUDE.md`

### 1.20.0 — Configurações completas: editar perfil, alterar senha, excluir conta, ajuda, Termos de uso e Política de privacidade

*11/10/2026 · Minor · Configurações, Autenticação, Perfil, Servidor, Banco de dados*

- Editar perfil: nome e foto (trocar ou remover); o e-mail aparece, mas só muda pelo suporte (spec 20)
- Segurança: alterar senha com a senha atual e excluir a conta de forma definitiva, digitando EXCLUIR (LGPD art. 18 e exigência das lojas de apps)
- Excluir conta apaga perfil, curtidas, comentários, seguidas, inscrições, pontos, recompensas e instituições não publicadas; as doações ficam sem nome nem mensagem para a prestação de contas; bloqueia o único admin e quem é responsável por instituição publicada
- Página pública #/excluir-conta, que explica como pedir a exclusão (link exigido pela Google Play)
- Termos de uso e Política de privacidade (LGPD) em páginas públicas #/termos e #/privacidade, com versão e data; dados da empresa em src/config/empresa.ts
- Centro de ajuda com perguntas frequentes e contato; tela Sobre com versão e links
- Cadastro valida o formato do e-mail e a senha (8+ caracteres, letras e números) no app e no servidor, e grava o aceite dos Termos com a versão (colunas terms_version e terms_accepted_at); a mesma regra vale para criar nova senha
- Login e cadastro sem diferenciar maiúsculas no e-mail
- Itens de Configurações sem função (Geral, Acessibilidade, Pagamentos) saíram; Notificações volta com a spec 21

Fontes: `server/validation.js` · `server/routes/auth.js` · `server/routes/users.js` · `server/db.js` · `src/screens/settings.ts` · `src/screens/conta/editar-perfil.ts` · `src/screens/conta/seguranca.ts` · `src/screens/conta/excluir-conta.ts` · `src/screens/conta/ajuda.ts` · `src/screens/conta/sobre.ts` · `src/screens/conta/legal.ts` · `src/content/legal.ts` · `src/config/empresa.ts` · `src/utils/validation.ts` · `src/components/PageHeader.ts` · `src/screens/auth/register.ts` · `src/screens/auth/reset-password.ts` · `src/services/auth.service.ts` · `src/services/user.service.ts` · `src/router.ts` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.19.0 — Recompensas com QR Code, aba Prêmios e regra de pontos configurável pelo admin

*11/10/2026 · Minor · Gamificação, Admin, Doação, Perfil, Feed, Configurações, Servidor, Banco de dados*

- Correção: resgatar uma recompensa descontava os Salves e não guardava nada; agora cada resgate gera uma recompensa com QR Code único em "Minhas recompensas" (spec 18.8)
- Nova aba Prêmios (troféu) na barra de baixo, como no PDF e no mockup: avatar, nível, barra até o próximo nível, XP e Salves, promoção ativa, abas Disponíveis e Minhas recompensas (pronta para usar, usada ou vencida); o Perfil passa a abrir pelo avatar no topo do feed
- Resgate confere Salves e nível mínimo, desconta com proteção contra toque duplo e mostra o QR Code com o código em texto (spec 18.6 a 18.10)
- Validar recompensa no parceiro (admin e gestor): lê o QR pela câmera ou pelo código digitado, mostra de quem é e confirma o uso; o código não vale de novo (spec 18.9)
- Recompensas e parceiros (admin e gestor): criar, editar, ativar/desativar, nível mínimo, validade, tipo e logo; só exclui se ninguém resgatou (spec 22.1)
- Pontos e recompensas (só admin): liga/desliga a pontuação, reais por XP e por Salve, promoção (ex.: Salves em dobro) com multiplicador e período, e liga/desliga os resgates para todos; exemplo ao vivo do que uma doação de R$ 100 rende (spec 18.11 e 27.6)
- Doação usa a regra configurada: a pontuação estimada no resumo e a gravada na doação seguem a configuração e a promoção
- Tabelas settings e user_rewards; colunas active, min_level, valid_until e reward_type em rewards; script opcional docs/sql/v1.19.0-recompensas-e-pontos.sql

Fontes: `server/settings.js` · `server/routes/gamification.js` · `server/routes/admin.js` · `server/routes/donations.js` · `server/db.js` · `src/screens/gamification.ts` · `src/screens/admin/gamification-settings.ts` · `src/screens/admin/rewards.ts` · `src/screens/admin/validate-reward.ts` · `src/components/RewardQr.ts` · `src/components/BottomNav.ts` · `src/screens/feed.ts` · `src/screens/profile.ts` · `src/screens/donation.ts` · `src/screens/settings.ts` · `src/services/gamification.service.ts` · `src/services/admin.service.ts` · `src/types/gamification.ts` · `src/types/admin.ts` · `src/router.ts` · `docs/sql/v1.19.0-recompensas-e-pontos.sql` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.18.4 — Logo oficial como ícone da aba e do app instalado

*11/10/2026 · Patch · Sistema*

- O ícone da aba do navegador, do app instalado (Android e iPhone) e do menu lateral do computador passa a ser o símbolo oficial da logo da abertura (coração com as mãos), em branco sobre laranja, no lugar do coração genérico da 1.18.0
- Ícones gerados a partir de .Documentacao/inicio.jpg: favicon-32/48.png, icon-192/512.png, icon-maskable-512.png (com margem para o recorte do Android) e apple-touch-icon.png

Fontes: `public/favicon-32.png` · `public/favicon-48.png` · `public/icons/` · `index.html` · `src/components/BottomNav.ts` · `CLAUDE.md`

### 1.18.3 — Tablet e computador sem tela esticada: interface ampliada na proporção do celular

*11/10/2026 · Patch · Sistema*

- Na 1.18.0 a coluna alargava (640/680px) mas os elementos continuavam no tamanho de celular, e tudo parecia esticado e pequeno; agora a interface inteira é ampliada: fonte base 18px no tablet, 20px no computador e 22px em monitores a partir de 1600px, numa coluna de 26rem (468, 520 e 572px) com a mesma proporção do celular
- Menu lateral do computador e textos pequenos (selos, datas) passam a crescer junto; no celular nada muda

Fontes: `src/styles/global.css` · `src/` · `CLAUDE.md`

### 1.18.2 — Manifesto do app passa a ser /manifest.json

*10/10/2026 · Patch · Sistema, Servidor*

- Na Hostinger os arquivos estáticos são entregues pelo LiteSpeed (antes do Express), que não conhece .webmanifest e o servia como text/plain; o manifesto agora é /manifest.json, entregue como JSON, para o "Instalar app" funcionar
- Desfeito o ajuste da 1.18.1 no Express, que não tinha efeito em produção

Fontes: `public/manifest.json` · `index.html` · `server/index.js` · `CLAUDE.md`

### 1.18.1 — Manifesto do app com o tipo certo para "Instalar app"

*10/10/2026 · Patch · Servidor, Sistema*

- O servidor entregava /manifest.webmanifest como text/plain; agora vai como application/manifest+json, para os navegadores oferecerem "Instalar app" / "Adicionar à tela inicial"

Fontes: `server/index.js`

### 1.18.0 — Visual responsivo para celular, tablet e computador e app instalável na tela inicial

*10/10/2026 · Minor · Sistema*

- Celular: o app ocupa a tela inteira (antes era uma coluna fixa de 390px com faixas dos lados), respeita o entalhe e a barra de gestos, acompanha a barra do navegador (100dvh) e os campos usam letra de 16px para o iPhone não dar zoom sozinho
- Tablet (a partir de 768px): coluna central de 640px com sombra; "Causas perto de você" em 2 colunas
- Computador (a partir de 1024px): coluna de 680px e a barra de navegação de baixo vira menu lateral à esquerda, com o logo
- Instalar na tela inicial (PWA): manifesto e ícones do Salvee (Android, iPhone e navegador); o ícone /favicon.svg, que não existia (erro 404), foi criado
- Zoom de pinça liberado (antes bloqueado por maximum-scale=1, ruim para acessibilidade); avisos (toast) abaixo do entalhe; classe scrollbar-hide, usada em várias telas e que não existia, passa a esconder a barra de rolagem lateral dos carrosséis

Fontes: `src/styles/global.css` · `tailwind.config.ts` · `index.html` · `public/manifest.webmanifest` · `public/favicon.svg` · `public/icons/` · `src/components/BottomNav.ts` · `src/components/Toast.ts` · `src/screens/search.ts` · `CLAUDE.md`

### 1.17.0 — Carrossel "Promoções & metas" na busca, com banners cadastrados pelo admin

*10/10/2026 · Minor · Busca, Admin, Configurações, Servidor, Banco de dados*

- Topo da tela Buscar volta a ser o carrossel "Promoções & metas" do mockup dos designers: banners grandes com imagem, texto, barra de meta e bolinhas; passa sozinho a cada 6 segundos e abre a campanha ou instituição ao tocar
- Origem dos banners (opção C): promoções cadastradas por admin/gestor e, quando não há nenhuma ativa, as campanhas em destaque (prazo mais próximo e quem recebeu menos)
- Nova tela Configurações → Administração → Promoções da busca: criar, editar, ativar/desativar e excluir banners com título, texto, imagem, link (campanha ou instituição), período (início/fim) e ordem; tabela promotions
- As categorias saem do topo e viram o filtro de "Causas perto de você" (ícone ao lado do título, como no mockup); a pesquisa por categoria pela barra continua funcionando
- Rotas GET /api/search/promocoes e /api/admin/promotions (GET, POST, PATCH, DELETE); script opcional docs/sql/v1.17.0-promocoes.sql

Fontes: `server/db.js` · `server/routes/search.js` · `server/routes/admin.js` · `src/screens/search.ts` · `src/screens/admin/promotions.ts` · `src/services/search.service.ts` · `src/services/admin.service.ts` · `src/types/admin.ts` · `src/router.ts` · `src/screens/settings.ts` · `docs/sql/v1.17.0-promocoes.sql` · `CLAUDE.md`

### 1.16.0 — Cadastro de instituição só vai para aprovação ao "Enviar para análise"

*10/10/2026 · Minor · Onboarding, Instituição, Admin, Perfil, Feed, Servidor*

- As etapas do cadastro gravam um rascunho (status draft): admin e gestores não veem nem podem aprovar; antes a instituição já ia para a fila de aprovação na etapa 1, mesmo se a pessoa desistisse no meio
- Só ao tocar em "Enviar para análise" na última etapa o cadastro vai para a fila (pending); o servidor confere antes nome, responsável, contato, categoria e descrição e diz o que falta
- Cadastro começado e não enviado aparece como "Cadastro não concluído" na tela Minha instituição (botão "Continuar cadastro" com os dados preenchidos), "NÃO ENVIADO" no Perfil e aviso no topo do feed
- Correção: se o envio falhasse, o app perdia a referência do rascunho e tentar de novo criava outra instituição; agora ela só é apagada depois do envio dar certo
- Rota POST /api/institutions/:id/submit (rascunho ou cadastro corrigido → em análise); /resubmit continua funcionando

Fontes: `server/routes/institutions.js` · `server/routes/admin.js` · `src/screens/onboarding/institution-register.ts` · `src/screens/onboarding/institution-status.ts` · `src/screens/profile.ts` · `src/screens/feed.ts` · `src/screens/admin/institution-approvals.ts` · `src/services/institution.service.ts` · `src/types/institution.ts` · `src/types/post.ts` · `CLAUDE.md`

### 1.15.0 — Localização no mapa: instituição marca o local e "Perto de mim" com GPS

*10/10/2026 · Minor · Busca, Instituição, Onboarding, Servidor, Banco de dados*

- Cadastro da instituição (etapa 2): bloco "Localização no mapa" para marcar o local pelo GPS de quem está cadastrando (com permissão do navegador), pelo endereço digitado ou tocando/arrastando o marcador; mapa Leaflet + OpenStreetMap, gratuito e sem chave, baixado só quando aparece; colunas institutions.latitude e longitude
- Busca → Causas perto de você: botão "📍 Perto de mim" que cada usuário liga ou desliga; ligado, ordena as campanhas pela distância ("a 3,5 km", perto = até 30 km); a posição vai arredondada (~1 km) só na consulta e não é guardada; negou a permissão → continua pela cidade escolhida (spec 17.6 e 27.5)
- Perfil da instituição: mapa e rota Google Maps/Waze pelo ponto marcado, mais preciso que o endereço
- Script opcional para o phpMyAdmin em docs/sql/v1.15.0-coordenadas.sql

Fontes: `src/components/LocationPicker.ts` · `src/screens/onboarding/institution-register.ts` · `src/screens/search.ts` · `src/services/search.service.ts` · `src/screens/institution-profile.ts` · `src/types/institution.ts` · `server/db.js` · `server/routes/institutions.js` · `server/routes/search.js` · `package.json` · `docs/sql/v1.15.0-coordenadas.sql` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.14.0 — Feed com impulsionamento, perfil da instituição completo e busca reformulada

*10/10/2026 · Minor · Feed, Busca, Instituição, Onboarding, Servidor, Banco de dados*

- Feed "Para você" deixa de ser só por data: soma novidade, instituições que a pessoa segue, urgência (campanha perto do prazo, evento próximo), curtidas/comentários e um impulso para quem recebeu menos ajuda nos últimos 30 dias, com a etiqueta "✨ Precisa de apoio" (spec 1.4, 4.4, 11.3 e 11.4)
- Destaques da busca: instituições com menos doações confirmadas recentes e menos seguidores (spec 17.5)
- Perfil da instituição: carrossel com até 6 fotos e barra da campanha ativa no topo (spec 13.3 a 13.6); a instituição aprovada edita dados e fotos pela tela "Minha instituição"
- Aba Info: endereço com CEP, dias e horários de funcionamento, telefone que abre o discador, e-mail, mapa e botões de rota Google Maps e Waze (spec 13.10)
- Cadastro da instituição: várias fotos (até 6) e o campo "Dias e horários de funcionamento"; colunas institutions.photos e opening_hours
- Busca reformulada (spec 17): pesquisa instituições e campanhas por nome, categoria, cidade ou palavra-chave; carrossel com as categorias reais (tocar mostra o que há nela); Causas perto de você com campanhas reais em andamento, primeiro as da cidade escolhida; saem todos os dados de exemplo e o carrossel de promoções fictícias
- Perfil de instituição que não carrega mostra aviso em vez de dados de exemplo
- Rotas GET /api/search (instituições + campanhas), /api/search/categories, /api/search/cities e /api/search/causas; server/attention.js

Fontes: `server/attention.js` · `server/routes/feed.js` · `server/routes/search.js` · `server/routes/institutions.js` · `server/db.js` · `src/screens/search.ts` · `src/services/search.service.ts` · `src/screens/institution-profile.ts` · `src/screens/onboarding/institution-register.ts` · `src/screens/onboarding/institution-status.ts` · `src/components/PostCard.ts` · `src/types/institution.ts` · `src/types/post.ts` · `docs/sql/v1.14.0-fotos-e-horarios.sql` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.13.1 — Escolha Usuário/Instituição depois de criar a conta

*10/10/2026 · Patch · Onboarding, Autenticação, Servidor*

- "Comece aqui" volta a ir direto para o cadastro: as duas contas começam pelo mesmo acesso (o do responsável, no caso da instituição). A tela "Qual é o seu perfil?" aparece depois da confirmação e das boas-vindas; Usuário vai ao feed, Instituição ao cadastro dela
- A escolha é gravada na conta (users.account_type) por PATCH /api/users/me
- Correção: PATCH /api/users/me só altera os campos enviados (antes, enviar um campo só apagava o nome ou a foto)

Fontes: `src/screens/welcome.ts` · `src/screens/onboarding/welcome-success.ts` · `src/screens/onboarding/choose-profile.ts` · `src/screens/auth/register.ts` · `src/services/user.service.ts` · `server/routes/users.js` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.13.0 — Tela da campanha, seguir instituições e escolha do tipo de conta antes do cadastro

*10/10/2026 · Minor · Doação, Feed, Instituição, Onboarding, Autenticação, Configurações, Servidor, Banco de dados*

- Tela da campanha (#/campanha/:id): imagens, título, instituição, arrecadado de quanto, barra de progresso, doações confirmadas, prazo (faltam X dias / encerrada), descrição, comentários e botão Doar fixo (spec 15.4)
- Seguir instituições: botão Seguir/Seguindo com o número de seguidores no perfil da instituição (só aprovadas) e aba "Seguindo" no feed com as publicações de quem a pessoa segue (spec 11.2 e 23.1); tabela institution_follows
- Escolha Usuário/Instituição antes do cadastro: "Comece aqui" → Qual é o seu perfil? → cadastro com o tipo; depois da confirmação, usuário vai direto ao feed e conta de instituição segue para o cadastro da instituição (spec 6.2, 6.3 e 7.6); coluna users.account_type
- Configurações ganha "Cadastrar minha instituição" para quem ainda não tem uma
- Script opcional para o phpMyAdmin em docs/sql/v1.13.0-seguir-e-tipo-de-conta.sql

Fontes: `src/screens/campaign.ts` · `src/components/PostCard.ts` · `src/screens/institution-profile.ts` · `src/screens/feed.ts` · `src/screens/welcome.ts` · `src/screens/onboarding/choose-profile.ts` · `src/screens/onboarding/welcome-success.ts` · `src/screens/auth/register.ts` · `src/screens/settings.ts` · `src/services/institution.service.ts` · `src/services/feed.service.ts` · `src/types/user.ts` · `src/types/institution.ts` · `src/types/post.ts` · `src/router.ts` · `server/db.js` · `server/routes/institutions.js` · `server/routes/feed.js` · `server/routes/auth.js` · `server/routes/users.js` · `docs/sql/v1.13.0-seguir-e-tipo-de-conta.sql` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.12.1 — Situação do cadastro da instituição no Perfil

*08/10/2026 · Patch · Perfil, Instituição*

- Perfil ganha o cartão "Minha instituição" para quem cadastrou alguma: "Seu cadastro de instituição está em análise" (EM ANÁLISE), "está aprovado" (APROVADO), "precisa de correções" ou "não foi aprovado"; tocar abre a tela completa da situação

Fontes: `src/screens/profile.ts`

### 1.12.0 — Situação da instituição no login, pedido de revisão e reenvio de correções

*08/10/2026 · Minor · Onboarding, Instituição, Admin, Autenticação, Feed, Configurações, Servidor, Banco de dados*

- Nova tela "Minha instituição" (#/institution-status): Em análise, Correção necessária (com a lista do que corrigir), Não aprovada (com o motivo) ou Aprovada (spec 9.4 e 10)
- Depois do login (e-mail/senha ou social), quem é responsável por instituição ainda não aprovada vê primeiro essa tela; o app continua liberado para usar como doador, com aviso no topo do feed e atalho em Configurações
- Admin ganha o botão "Pedir revisão", com o que corrigir obrigatório (um item por linha); aprovar limpa o motivo anterior (spec 8.6 e 22.1)
- Corrigir cadastro: o formulário da instituição abre com os dados já enviados (#/register/institution?corrigir=<id>) e, ao final, reenvia para análise (needs_revision → pending) (spec 8.7)
- Documento enviado na última etapa passa a ser guardado (institutions.documents_url) e aparece no admin como "Ver documento enviado"; antes era enviado e perdido
- Cadastro de instituição: voltar à etapa 1 e avançar de novo não cria mais outra instituição; campos de cidade e estado na etapa 2
- Rotas GET /api/institutions/mine/:id e POST /api/institutions/:id/resubmit; /mine traz motivo e datas

Fontes: `src/screens/onboarding/institution-status.ts` · `src/screens/onboarding/institution-register.ts` · `src/screens/auth/after-login.ts` · `src/screens/auth/login.ts` · `src/screens/auth/oauth.ts` · `src/screens/admin/institution-approvals.ts` · `src/screens/feed.ts` · `src/screens/settings.ts` · `src/services/institution.service.ts` · `src/types/post.ts` · `src/types/admin.ts` · `src/router.ts` · `server/routes/institutions.js` · `server/routes/admin.js` · `server/db.js` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.11.0 — Curtir e comentar publicações, com tela de detalhe do post

*08/10/2026 · Minor · Feed, Servidor, Banco de dados*

- Coração para curtir (com contagem) em toda publicação do feed e do mural; uma curtida por pessoa, toque de novo desfaz (spec 11.8 e 23.1)
- Comentários: balão com a quantidade abre a nova tela de detalhe da publicação (#/post/:id), com texto completo, fotos, botões e a lista de comentários com campo para escrever (até 500 caracteres) (spec 11.8 e 11.9)
- Apagar comentário: o autor, a instituição dona da publicação e admin/gestor (moderação, spec 22.1); excluir a publicação apaga junto curtidas, comentários e inscrições
- Tabelas novas post_likes e post_comments, criadas sozinhas na subida e já com a collation utf8mb4_unicode_ci no MySQL; rotas POST/DELETE /api/feed/:id/like, GET/POST /api/feed/:id/comments e DELETE /api/feed/comments/:id
- Exportação SQLite → MySQL passa a criar as tabelas com COLLATE utf8mb4_unicode_ci (origem do erro de collation da v1.10.0)
- Passo a passo de como as mudanças de banco chegam à produção e script opcional para o phpMyAdmin: docs/configuracao/mysql.md e docs/sql/v1.11.0-curtidas-comentarios.sql

Fontes: `server/db.js` · `server/routes/feed.js` · `server/scripts/exportar-mysql.js` · `src/components/PostCard.ts` · `src/screens/post-detail.ts` · `src/services/feed.service.ts` · `src/types/post.ts` · `src/router.ts` · `docs/configuracao/mysql.md` · `docs/sql/v1.11.0-curtidas-comentarios.sql` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.10.1 — Admin volta a listar instituições e cadastro de instituição sem erro na última etapa

*08/10/2026 · Patch · Admin, Instituição, Banco de dados, Servidor*

- Produção (MySQL): a lista do admin (Aprovar instituições) dava "Illegal mix of collations": colunas criadas pelo servidor ficaram com uma collation diferente das tabelas importadas. Na subida, o servidor agora converte para utf8mb4_unicode_ci as tabelas que destoam (sem impedir o app de subir se falhar)
- Cadastro de instituição: pular a última etapa (logo, foto e história vazios) dava erro no servidor; agora a etapa sem dados é simplesmente ignorada

Fontes: `server/db.js` · `server/routes/institutions.js` · `CLAUDE.md`

### 1.10.0 — Instituição publica no feed: posts, eventos e campanhas

*07/10/2026 · Minor · Feed, Instituição, Calendário, Doação, Admin, Servidor, Banco de dados*

- Botão "+" do feed só para quem é responsável por instituição aprovada, com as opções Post, Evento e Campanha (spec 5, 12.1 a 12.6)
- Nova tela de publicação (#/post/new e #/post/:id/edit): título, texto, até 5 imagens (carrossel), meta e prazo da campanha, data, horário, local e instruções do evento; editar e excluir pelo menu da publicação (12.7)
- Rotas POST, PATCH e DELETE /api/feed com checagem de permissão; admin/gestor também excluem (moderação); GET /api/institutions/mine; colunas novas em posts (title, images, campaign_deadline, event_instructions, created_by)
- Cartão de publicação único no feed e no mural: tipo visível (Evento/Campanha), carrossel, barra de progresso da campanha e botão por tipo: Doar, Participar ou Ajudar (11.7, 11.8, 27.2, 27.3)
- Participar de evento passa a funcionar e coloca o evento na Agenda (o app chamava um endereço errado da API); só eventos de instituições aprovadas
- Mural do perfil da instituição mostra as publicações dela (13.8)
- Doar numa campanha liga a doação a ela (donations.post_id); quando admin/gestor confirma o pagamento, o valor soma no arrecadado da campanha
- Feed sem dados de exemplo quando a API falha: mostra aviso de erro ou de lista vazia

Fontes: `server/routes/feed.js` · `server/routes/calendar.js` · `server/routes/institutions.js` · `server/routes/donations.js` · `server/routes/admin.js` · `server/db.js` · `src/components/PostCard.ts` · `src/screens/post-editor.ts` · `src/screens/feed.ts` · `src/screens/institution-profile.ts` · `src/screens/donation.ts` · `src/services/feed.service.ts` · `src/services/calendar.service.ts` · `src/services/institution.service.ts` · `src/types/post.ts` · `src/types/donation.ts` · `src/router.ts` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.9.2 — Ajustes contra o alerta "Perigoso" do Chrome

*07/10/2026 · Patch · Autenticação, Sistema*

- Botões de login com Google, Apple e Facebook só aparecem quando a rede está configurada no servidor; sem nenhuma, a seção "ou entre com" fica oculta (logos de marcas sem login real num domínio novo parecem phishing para o Google Safe Browsing)
- Domínio antigo darkblue-rook deixa de redirecionar automaticamente: mostra uma página com o link para o endereço novo
- Meta de verificação do Google Search Console no site, para pedir a revisão do alerta
- Texto do cadastro sem citar conta social enquanto ela não estiver disponível

Fontes: `src/components/SocialLogin.ts` · `src/screens/auth/login.ts` · `src/screens/auth/register.ts` · `index.html` · `.htaccess` · `endereco-antigo.html` · `CLAUDE.md` · `docs/PENDENCIAS.md` · `docs/configuracao/login-social.md`

### 1.9.1 — Correções de segurança e ajustes à especificação oficial (PDF)

*07/10/2026 · Patch · Instituição, Feed, Busca, Doação, Servidor, Sistema*

- Segurança: só o responsável pela instituição (ou admin/gestor) pode alterar os dados dela nas etapas do cadastro; antes qualquer usuário logado conseguia, enviando o id
- Feed (lista e detalhe) mostra só publicações de instituições aprovadas; perfil de instituição não aprovada só abre para o responsável e admin/gestor (spec 4.3 e 11.10)
- Destaques da busca: ordenação compatível com MySQL (o NULLS FIRST quebrava a consulta em produção e a tela caía nos dados de exemplo)
- Doação: só o PIX aparece como forma de pagamento e saiu a opção de doação anônima, que fica fora da V1 (spec 14.5, 14.10 e 27.4); a API grava sempre PIX e não anônima
- CLAUDE.md aponta para a especificação oficial em PDF, árvore de pastas atualizada e diferenças conscientes registradas; comparação completa com o PDF em docs/PENDENCIAS.md

Fontes: `server/routes/institutions.js` · `server/routes/feed.js` · `server/routes/donations.js` · `src/screens/donation.ts` · `CLAUDE.md` · `docs/PENDENCIAS.md`

### 1.9.0 — E-mail pela Hostinger: recuperar senha e confirmar cadastro

*07/10/2026 · Minor · Autenticação, Onboarding, Servidor, Banco de dados*

- Envio de e-mail pelo SMTP da Hostinger (nodemailer), ligado pelas variáveis SMTP_USER e SMTP_PASS; sem elas, em dev o e-mail sai no log e em produção os recursos avisam que ainda não estão disponíveis
- Esqueci minha senha passa a funcionar: link por e-mail (1 hora, uso único) e nova tela #/reset-password; a resposta não revela se o e-mail tem conta
- Confirmação de cadastro por e-mail no lugar do SMS: nova tela #/verify-email (aviso, reenviar e confirmação pelo link de 3 dias), sem bloquear o uso do app; coluna users.email_verified (contas antigas e login social já ficam confirmados)
- Links guardados só como hash na nova tabela email_tokens; no máximo um e-mail de cada tipo por minuto; rotas POST /auth/reset-password, /auth/verify-email, /auth/resend-verification e GET /auth/mail-status
- E-mails com o visual do Salvee (botão laranja e link por extenso), nome escapado no HTML
- Passo a passo para criar a caixa de envio na Hostinger em docs/configuracao/email.md

Fontes: `server/mailer.js` · `server/routes/auth.js` · `server/routes/oauth.js` · `server/routes/users.js` · `server/db.js` · `server/package.json` · `src/screens/auth/reset-password.ts` · `src/screens/auth/verify-email.ts` · `src/screens/auth/register.ts` · `src/screens/auth/forgot-password.ts` · `src/services/auth.service.ts` · `src/router.ts` · `src/types/user.ts` · `docs/configuracao/email.md` · `CLAUDE.md`

### 1.8.1 — Botão de mostrar senha e verificação por SMS sem travar o cadastro

*07/10/2026 · Patch · Autenticação, Onboarding, Servidor*

- Campos de senha (entrar e cadastro) ganham o botão de olho para mostrar/ocultar a senha (componente Input, vale para todo campo de senha)
- Verificação de telefone: em produção, sem provedor de SMS, o código não é mais gravado no log do servidor (ninguém recebia e expunha códigos) e a API responde 503 com aviso
- Tela de verificação ganha "Pular por enquanto": o cadastro não fica mais travado esperando um SMS que não chega
- Telefone verificado passa a ser salvo no usuário (users.phone); "Reenviar SMS" mostra erro em vez de falhar em silêncio

Fontes: `src/components/Input.ts` · `src/screens/onboarding/verify-phone.ts` · `server/routes/auth.js`

### 1.8.0 — Login social com Google, Facebook e Apple e logos oficiais nos botões

*07/10/2026 · Minor · Autenticação, Servidor, Banco de dados*

- Botões "ou entre com" (login e cadastro) com os logos oficiais da Apple, do Google e do Facebook no lugar dos emojis e letras; componente único SocialLogin
- Login social pelo fluxo OAuth (authorization code) nas rotas /api/auth/oauth/:provider e /callback, sem dependência nova; protegido com state assinado + cookie contra login forjado
- Cria a conta no primeiro acesso ou vincula a uma conta existente com o mesmo e-mail confirmado; colunas users.google_id, facebook_id e apple_id
- Cada provedor só é ativado quando as credenciais dele estão nas variáveis de ambiente; sem elas o botão avisa "disponível em breve"
- Nova tela #/oauth recebe o login; erros e cancelamento voltam para o login com aviso. O router passa a aceitar query no hash (#/rota?x=y)
- Passo a passo para criar as credenciais de cada rede (Google, Facebook, Apple) em docs/configuracao/login-social.md

Fontes: `server/routes/oauth.js` · `server/index.js` · `server/db.js` · `src/components/SocialLogin.ts` · `src/screens/auth/oauth.ts` · `src/screens/auth/login.ts` · `src/screens/auth/register.ts` · `src/router.ts` · `src/services/api.ts` · `CLAUDE.md` · `server/.env.example` · `docs/configuracao/login-social.md`

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
