# Pendências do Salvee

Atualizado em 11/10/2026 (v1.20.0). Ler no início de cada sessão e atualizar ao concluir algo.

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
Conferido em 11/10/2026 (v1.20.0): **19 completas, 1 parcial (doação sem PIX real), 0 sem funcionar** (de 19 + painel admin).
✅ completo · 🟡 parcial · ❌ não funciona de verdade.

| # | Funcionalidade (seção 25) | Situação | O que falta |
|---|---|---|---|
| 1 | Splash e onboarding | ✅ | — |
| 2 | Escolha entre usuário e instituição | ✅ | Feita depois de criar a conta (decisão do projeto). |
| 3 | Cadastro de usuário comum | ✅ | Formato do e-mail, senha com 8+ caracteres, letras e números, e aceite dos Termos gravado com a versão (v1.20.0). |
| 4 | Cadastro institucional com validação | ✅ | Aprovar / pedir revisão / rejeitar / corrigir e reenviar / telas de situação; várias fotos e horário (v1.14.0). |
| 5 | Login e recuperação de senha | ✅ | Código pronto e testado; o envio real só depende da caixa de e-mail do cliente (domínio próprio). |
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
| 16 | Gamificação básica com XP e Salves | ✅ | Aba Prêmios na navegação e regra de pontos configurável pelo admin, com liga/desliga e promoção (v1.19.0). |
| 17 | Recompensas e QR Code | ✅ | Resgate com QR Code único, Minhas recompensas (disponível/usada/vencida), validação no parceiro por admin/gestor, cadastro de recompensas e parceiros (v1.19.0). Parceiro com login próprio fica para depois (spec 26). |
| 18 | Calendário de eventos confirmados | ✅ | Falta detalhe do evento com mapa e cancelar ali. |
| 19 | Configurações | ✅ | Editar perfil (nome e foto), Segurança (alterar senha e excluir conta), Centro de ajuda, Sobre, Termos de uso e Política de privacidade (v1.20.0). Itens sem função saíram; Notificações volta com a spec 21. Termos/Política com dados da empresa "[a definir]" em `src/config/empresa.ts`. |
| — | Painel administrativo mínimo | ✅ | Instituições, doações, usuários, moderação, promoções, recompensas/parceiros e regras de pontos. Falta gerenciar categorias. |

**Prioridade sugerida:** 18 (detalhe do evento com mapa) → notificações (21) → categorias no admin.
**Falta do cliente para os Termos:** razão social, CNPJ, endereço, e-mail de contato e encarregado de dados (`src/config/empresa.ts`) e revisão jurídica do texto.
**Dependem do cliente:** 5 (e-mail/domínio), 15 (provedor de PIX), login social (credenciais).

## Comparação com a especificação (`Plano de Negócio/referencias/Especificação SALVEE.pdf`)
Refeita em 11/10/2026 (v1.20.0). ✅ feito · 🟡 parcial · ❌ não existe. Números = seções do PDF.

| Seção | Situação | O que falta |
|---|---|---|
| 5 Navegação | ✅ | Feed, Buscar, Prêmios, Agenda; Perfil e Configurações pelo topo (v1.19.0). |
| 6 Splash, boas-vindas e tipo de conta | ✅ | Escolha depois de criar o acesso (diferença consciente). |
| 7 Cadastro de usuário | ✅ | Validação de e-mail e senha e aceite dos Termos (v1.20.0). Login social pronto, sem credenciais. |
| 8 Cadastro de instituição | ✅ | Etapas com rascunho, fotos, horário, documento e local no mapa. |
| 9/10 Login, recuperar senha e status da instituição | ✅ | Falta avisar por e-mail/notificação quando o status muda (21). |
| 11 Feed | ✅ | Impulsionamento, curtir, comentar, seguir. |
| 11.6/12 Mídia | 🟡 | Até 5 imagens; falta **vídeo**. |
| 13 Perfil da instituição | ✅ | Falta só meta mensal fora de campanha. |
| 14 Doação | 🟡 | Só PIX com confirmação manual; falta **PIX real** (provedor + webhook). |
| 15 Campanhas | ✅ | Na busca e em "Causas perto de você" (v1.14.0). |
| 16 Eventos | 🟡 | Falta avisar o participante quando o evento muda (depende de 21). |
| 17 Busca | ✅ | GPS opcional, categorias e promoções. |
| 18 Gamificação | ✅ | QR de uso único e regras configuráveis (v1.19.0). Login próprio de parceiro fica para depois (26). |
| 19 Calendário | 🟡 | Falta tela de **detalhe do evento** com mapa, rota e cancelar. |
| 20 Configurações | ✅ | v1.20.0. Notificações entra com a 21. |
| 21 Notificações | ❌ | Nenhuma (push e e-mail de avisos). |
| 22 Painel admin | 🟡 | Faltam gerenciar **categorias**, tela de moderação de conteúdo e acompanhar campanhas. |
| 24 Estados | 🟡 | Algumas telas mostram dados de exemplo quando a API falha. |
| 27.1 Selo | ✅ | — |

## Próximas funções (ordem sugerida)
- [x] Criação de conteúdo, mural, botões Doar/Participar/Ajudar (v1.10.0).
- [x] Curtir, comentar e tela de detalhe do post (v1.11.0).
- [x] Tela da campanha, seguir instituições e escolha do tipo de conta antes do cadastro (v1.13.0).
- [ ] Vídeo nas publicações (11.6).
- [x] Telas de status da instituição no login, pedir revisão e reenviar correções (v1.12.0).
- [x] Recompensas com QR Code, Minhas recompensas, aba Prêmios e regra de pontos configurável (v1.19.0).
- [x] Configurações completas, Termos de uso, Política de privacidade, excluir conta e validação do cadastro (v1.20.0).
- [ ] **PIX real**: integrar provedor (Mercado Pago, Asaas, Efí…); o webhook substitui a confirmação manual de doações.
- [ ] Detalhe do evento com mapa (19.6); notificações (21); categorias no admin (22).
- [ ] **SMS** para verificar celular (opcional; hoje a confirmação é por e-mail). Tela `/verify-phone` mantida.
- [ ] Backup periódico de `~/salvee-uploads` e do MySQL (hPanel → Backups).
