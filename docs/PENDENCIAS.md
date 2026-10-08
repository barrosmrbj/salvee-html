# Pendências do Salvee

Atualizado em 07/10/2026 (v1.9.1). Ler no início de cada sessão e atualizar ao concluir algo.

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
- [ ] Trocar a senha do `admin@salvee.com` (ainda é a padrão `Salvee@2025`).
- [ ] Conferir no SSH que as fotos estão na pasta fixa: `ls -la ~/salvee-uploads` (deve ter os 2 arquivos do git).
- [ ] Limpeza no SSH (opcional): `rm ~/salvee.env.production` e a pasta antiga `~/salvee`.
- [ ] Testar no navegador as telas novas: Confirmar doações (admin), botão de olho nas senhas,
      Pular por enquanto (verificação), Criar nova senha e Confirme seu e-mail.

## Comparação com a especificação (`.Documentacao/Especificação SALVEE.pdf`)
Feita em 07/10/2026 (v1.9.1). ✅ feito · 🟡 parcial · ❌ não existe. Números = seções do PDF.

| Seção | Situação | O que falta |
|---|---|---|
| 5 Navegação | 🟡 | Abas devem ser Feed, Busca, **Gamificação**, Calendário (+ Configurações no topo); hoje Feed, Buscar, Agenda, Perfil. Botão "+" aparece para todos (deveria só instituição aprovada). |
| 6.1 Splash | ✅ | — |
| 6.2/6.3 Boas-vindas e tipo de conta | 🟡 | "Comece aqui" deve ir para a escolha Usuário/Instituição **antes** do cadastro, e a escolha deve ser gravada na conta. |
| 7 Cadastro de usuário | 🟡 | Validar tamanho mínimo de senha e formato do e-mail no cadastro. Login social ✅ (sem duplicar por e-mail). |
| 8 Cadastro de instituição | 🟡 | 3 etapas (PDF sugere 6). Faltam horários de funcionamento, **várias fotos** (só 1) e **salvar os documentos** (o campo existe, o arquivo não é gravado). |
| 8.6/8.7 Status | 🟡 | Botão "Pedir revisão" no admin e a instituição poder **reenviar correções**. |
| 9.3 Recuperar senha | ✅ | Falta só o e-mail do cliente (SMTP). |
| 9.4/10 Login de instituição por status | ❌ | Telas "Em análise", "Correção necessária", "Rejeitado". |
| 11 Feed | 🟡 | **Curtir, comentar**, botões **Ajudar / Doar / Participar**, tela de detalhe do post, **seguir** instituições, algoritmo com impulsionamento (hoje só por data). |
| 11.6 Mídia | 🟡 | Carrossel de imagens e vídeo (hoje 1 imagem). |
| 12 Criação de conteúdo | ❌ | Formulários de post, evento e campanha; editar/excluir; rotas POST/PATCH/DELETE. |
| 13 Perfil da instituição | 🟡 | **Mural vazio** (não carrega posts), carrossel de fotos, barra de meta de arrecadação, mapa + rota (Maps/Waze), conferir discador do telefone. |
| 14 Doação | 🟡 | Só PIX e sem anônima ✅ (v1.9.1). Falta **PIX real** e doação ligada a campanha. |
| 15 Campanhas | ❌ | Criação, tela de detalhe, valor arrecadado atualizado. |
| 16 Eventos | 🟡 | API de inscrição existe, mas **nenhuma tela chama "Participar"**; aviso de alteração do evento. |
| 17 Busca | 🟡 | "Causas perto de você" usa dados fixos: geolocalização real + fallback por cidade. |
| 18 Gamificação | 🟡 | Resgate não fica registrado; QR é só texto (sem validação/uso único); falta "Minhas recompensas", requisito de nível e **regra de XP/Salves configurável** (hoje fixa: valor/2 e valor/4). |
| 19 Calendário | 🟡 | Tela de detalhe com mapa, rota e cancelar participação. |
| 20 Configurações | 🟡 | Maioria dos itens sem ação: editar perfil (API existe), alterar senha, notificações, ajuda, termos e privacidade. |
| 21 Notificações | ❌ | Nenhuma. |
| 22 Painel admin | 🟡 | Aprovar/rejeitar ✅, confirmar doações ✅, papéis ✅. Faltam: pedir revisão, moderar conteúdo, categorias, recompensas/parceiros, acompanhar campanhas. |
| 24 Estados | ✅/🟡 | Várias telas mostram dados de exemplo quando a API falha (pode esconder erros). |
| 27.1 Selo | ✅ | — |

## Próximas funções (ordem sugerida)
- [ ] **Criação de conteúdo** pela instituição aprovada (post, evento, campanha) e botão "+" só para ela (12, 5).
- [ ] **Mural** do perfil carregando os posts; botões **Doar / Participar / Ajudar** no feed; tela de campanha (13.8, 11.8, 15.4).
- [ ] **Telas de status** da instituição no login e reenvio de correções (9.4, 10, 8.7).
- [ ] **Curtir e comentar**; seguir instituições (11.8, 23.1).
- [ ] **Recompensas com QR Code** de uso único e "Minhas recompensas"; XP/Salves configurável (18).
- [ ] **PIX real**: integrar provedor (Mercado Pago, Asaas, Efí…); o webhook substitui a confirmação manual de doações.
- [ ] Navegação com aba de **Gamificação** (5); escolha do tipo de conta antes do cadastro (6.3).
- [ ] "Perto de você" com **geolocalização real** (17.6); detalhe do evento com mapa (19.6); notificações (21).
- [ ] **SMS** para verificar celular (opcional; hoje a confirmação é por e-mail). Tela `/verify-phone` mantida.
- [ ] Backup periódico de `~/salvee-uploads` e do MySQL (hPanel → Backups).
