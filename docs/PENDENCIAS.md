# Pendências do Salvee

Atualizado em 10/10/2026 (v1.15.0). Ler no início de cada sessão e atualizar ao concluir algo.

## Situação atual
- Produção: Node.js App da Hostinger em `https://skyblue-hedgehog-581364.hostingersite.com`
  (frontend + API), MySQL `u526770669_salvee`, deploy automático a cada push na `master`.
- O domínio antigo `darkblue-rook-985577.hostingersite.com` só redireciona para o novo.
- Variáveis já no painel do app: JWT_SECRET, PUBLIC_URL, DB_* e UPLOAD_DIR (`/home/u526770669/salvee-uploads`).

## Aguardando o cliente
O cliente ainda não tem **domínio próprio** nem **e-mail do projeto**. Com o domínio temporário
`*.hostingersite.com` não dá para criar caixa de e-mail na Hostinger.

1. **Domínio próprio** (ex.: `salvee.com.br`): registrar/apontar para o Node.js App na Hostinger.
   Depois: trocar o domínio no app, `PUBLIC_URL` no painel, as URIs de retorno do login social,
   o `.htaccess` da raiz (redirecionamento) e as referências no `CLAUDE.md`.
2. **E-mail de envio** (recuperar senha + confirmar cadastro): código pronto (v1.9.0).
   Falta criar a caixa e colocar `SMTP_USER`/`SMTP_PASS` no painel. Passo a passo: `docs/configuracao/email.md`.
3. **Login com Google** (e depois Facebook/Apple): código pronto (v1.8.0).
   Falta o cliente criar as credenciais com o e-mail dele. Passo a passo: `docs/configuracao/login-social.md`.

## Fazer assim que possível
- [ ] **Alerta "Perigoso" do Chrome** (Google Safe Browsing): a meta de verificação já está no site (v1.9.2).
      No Search Console, concluir a verificação de `https://skyblue-hedgehog-581364.hostingersite.com`,
      ver **Segurança e ações manuais → Problemas de segurança** e **Solicitar revisão**. Com o domínio próprio,
      verificar o domínio novo também.
- [ ] Trocar a senha do `admin@salvee.com` (ainda é a padrão `Salvee@2025`).
- [ ] Conferir no SSH que as fotos estão na pasta fixa: `ls -la ~/salvee-uploads` (deve ter os 2 arquivos do git).
- [ ] Limpeza no SSH (opcional): `rm ~/salvee.env.production` e a pasta antiga `~/salvee`.
- [ ] Testar no navegador as telas novas: Confirmar doações (admin), botão de olho nas senhas,
      Pular por enquanto (verificação), Criar nova senha e Confirme seu e-mail.

## 25. Funcionalidades da versão 1 (checklist do PDF)
Conferido em 10/10/2026 (v1.15.0): **15 completas, 2 parciais, 2 sem funcionar de verdade** (de 19 + painel admin).
✅ completo · 🟡 parcial · ❌ não funciona de verdade.

| # | Funcionalidade (seção 25) | Situação | O que falta |
|---|---|---|---|
| 1 | Splash e onboarding | ✅ | — |
| 2 | Escolha entre usuário e instituição | ✅ | Feita depois de criar a conta (decisão do projeto). |
| 3 | Cadastro de usuário comum | 🟡 | Validar senha mínima e formato do e-mail no cadastro. |
| 4 | Cadastro institucional com validação | ✅ | Aprovar / pedir revisão / rejeitar / corrigir e reenviar / telas de situação; várias fotos e horário (v1.14.0). |
| 5 | Login e recuperação de senha | 🟡 | Código pronto; falta a caixa de e-mail do cliente (domínio próprio). |
| 6 | Feed | ✅ | "Para você" ranqueado com impulsionamento de quem recebeu menos e etiqueta "Precisa de apoio" (v1.14.0). |
| 7 | Curtidas e comentários | ✅ | — |
| 8 | Posts, campanhas e eventos | ✅ | Vídeo (opcional no PDF). |
| 9 | Perfil institucional | ✅ | Carrossel de até 6 fotos, barra da campanha ativa e edição de dados/fotos pela instituição aprovada (v1.14.0). Meta mensal (além de campanha) ainda não existe. |
| 10 | Mural, Sobre e Info | ✅ | Info com endereço, CEP, horário, telefone, e-mail, mapa e rota Google Maps/Waze (v1.14.0). |
| 11 | Busca | ✅ | Instituições e campanhas por nome, categoria, cidade ou palavra-chave; menos ajudadas primeiro (v1.14.0). |
| 12 | Categorias | ✅ | Carrossel com as categorias reais; tocar mostra instituições e campanhas da categoria (v1.14.0). |
| 13 | Destaques | ✅ | Menos ajuda recente (30 dias) e menos seguidores primeiro (v1.14.0). |
| 14 | Causas perto de você | ✅ | Campanhas reais; "Perto de mim" com GPS opcional do usuário (distância em km) ou pela cidade; instituição marca o local no cadastro por GPS, endereço ou mapa (v1.15.0). Instituições antigas sem local precisam marcar em "Editar dados e fotos". |
| 15 | Doação com método realmente suportado | 🟡 | Só PIX na tela, mas sem cobrança real: o admin confirma à mão. Falta integrar provedor. |
| 16 | Gamificação básica com XP e Salves | ✅ | Pontos só com doação confirmada. Faltam aba própria na navegação e regra de pontos configurável. |
| 17 | Recompensas e QR Code | ❌ | Resgate desconta Salves e não guarda nada; QR é só texto; sem "Minhas recompensas" nem validação no parceiro. |
| 18 | Calendário de eventos confirmados | ✅ | Falta detalhe do evento com mapa e cancelar ali. |
| 19 | Configurações | ❌ | 7 itens sem ação: Notificações, Geral, Acessibilidade, Pagamentos, Segurança (alterar senha), Ajuda, Sobre (termos e privacidade). |
| — | Painel administrativo mínimo | ✅ | Instituições, doações, usuários, moderação. Faltam recompensas/parceiros e categorias. |

**Prioridade sugerida:** 17 + aba Gamificação → 19 (alterar senha, termos, privacidade, ajuda, sobre) → 3 → 18 (detalhe do evento com mapa).
**Dependem do cliente:** 5 (e-mail/domínio), 15 (provedor de PIX), login social (credenciais).

## Comparação com a especificação (`.Documentacao/Especificação SALVEE.pdf`)
Feita em 07/10/2026 (v1.9.1). ✅ feito · 🟡 parcial · ❌ não existe. Números = seções do PDF.

| Seção | Situação | O que falta |
|---|---|---|
| 5 Navegação | 🟡 | Abas devem ser Feed, Busca, **Gamificação**, Calendário (+ Configurações no topo); hoje Feed, Buscar, Agenda, Perfil. Botão "+" só para instituição aprovada ✅ (v1.10.0). |
| 6.1 Splash | ✅ | — |
| 6.2/6.3 Boas-vindas e tipo de conta | ✅ | Escolha Usuário/Instituição logo depois de criar o acesso, gravada em `users.account_type` (v1.13.1). Diferença consciente: o PDF põe a escolha antes do cadastro, mas as duas contas começam pelo mesmo acesso (o do responsável). |
| 7 Cadastro de usuário | 🟡 | Validar tamanho mínimo de senha e formato do e-mail no cadastro. Login social ✅ (sem duplicar por e-mail). |
| 8 Cadastro de instituição | 🟡 | 3 etapas (PDF sugere 6). Documento salvo e visível no admin, cidade/estado e etapa 1 sem duplicar ✅ (v1.12.0). Faltam horários de funcionamento e **várias fotos** (só 1). |
| 8.6/8.7 Status | ✅ | "Pedir revisão" no admin (com o que corrigir) e a instituição corrige e reenvia (v1.12.0). |
| 9.3 Recuperar senha | ✅ | Falta só o e-mail do cliente (SMTP). |
| 9.4/10 Login de instituição por status | ✅ | Tela de situação depois do login, aviso no feed e atalho em Configurações (v1.12.0). Falta avisar por e-mail/notificação quando o status muda (21). |
| 11 Feed | 🟡 | Botões Ajudar / Doar / Participar ✅ (v1.10.0); curtir, comentar e detalhe ✅ (v1.11.0); seguir instituições e aba "Seguindo" ✅ (v1.13.0). Falta o **algoritmo com impulsionamento** de instituições menos ajudadas (hoje só por data). |
| 11.6 Mídia | 🟡 | Carrossel de até 5 imagens ✅ (v1.10.0). Falta vídeo. |
| 12 Criação de conteúdo | ✅ | Post, evento e campanha; editar/excluir (v1.10.0). Falta vídeo. |
| 13 Perfil da instituição | 🟡 | Mural com as publicações ✅ (v1.10.0). Faltam carrossel de fotos da instituição, barra de meta de arrecadação, mapa + rota (Maps/Waze), conferir discador do telefone. |
| 14 Doação | 🟡 | Só PIX e sem anônima ✅ (v1.9.1). Falta **PIX real** e doação ligada a campanha. |
| 15 Campanhas | 🟡 | Criação, progresso, prazo, Doar ligado e arrecadado somado ✅ (v1.10.0); tela da campanha ✅ (v1.13.0). Falta aparecer na **busca** e em "Causas perto de você". |
| 16 Eventos | 🟡 | Criação e **Participar** (entra na agenda) ✅ (v1.10.0). Falta avisar o participante quando o evento muda. |
| 17 Busca | 🟡 | "Causas perto de você" usa dados fixos: geolocalização real + fallback por cidade. |
| 18 Gamificação | 🟡 | Resgate não fica registrado; QR é só texto (sem validação/uso único); falta "Minhas recompensas", requisito de nível e **regra de XP/Salves configurável** (hoje fixa: valor/2 e valor/4). |
| 19 Calendário | 🟡 | Tela de detalhe com mapa, rota e cancelar participação. |
| 20 Configurações | 🟡 | Maioria dos itens sem ação: editar perfil (API existe), alterar senha, notificações, ajuda, termos e privacidade. |
| 21 Notificações | ❌ | Nenhuma. |
| 22 Painel admin | 🟡 | Aprovar/rejeitar/pedir revisão ✅, confirmar doações ✅, papéis ✅, excluir publicações e comentários ✅. Faltam: tela de moderação de conteúdo, categorias, recompensas/parceiros, acompanhar campanhas. |
| 24 Estados | ✅/🟡 | Várias telas mostram dados de exemplo quando a API falha (pode esconder erros). |
| 27.1 Selo | ✅ | — |

## Próximas funções (ordem sugerida)
- [x] Criação de conteúdo, mural, botões Doar/Participar/Ajudar (v1.10.0).
- [x] Curtir, comentar e tela de detalhe do post (v1.11.0).
- [x] Tela da campanha, seguir instituições e escolha do tipo de conta antes do cadastro (v1.13.0).
- [ ] Vídeo nas publicações (11.6); campanhas na busca (15.2).
- [x] Telas de status da instituição no login, pedir revisão e reenviar correções (v1.12.0).
- [ ] **Recompensas com QR Code** de uso único e "Minhas recompensas"; XP/Salves configurável (18).
- [ ] **PIX real**: integrar provedor (Mercado Pago, Asaas, Efí…); o webhook substitui a confirmação manual de doações.
- [ ] Navegação com aba de **Gamificação** (5).
- [ ] "Perto de você" com **geolocalização real** (17.6); detalhe do evento com mapa (19.6); notificações (21).
- [ ] **SMS** para verificar celular (opcional; hoje a confirmação é por e-mail). Tela `/verify-phone` mantida.
- [ ] Backup periódico de `~/salvee-uploads` e do MySQL (hPanel → Backups).
