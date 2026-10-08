# Pendências do Salvee

Atualizado em 07/10/2026 (v1.9.0). Ler no início de cada sessão e atualizar ao concluir algo.

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

## Próximas funções (especificação)
- [ ] **PIX real** (5.3): integrar provedor (Mercado Pago, Asaas, Efí…). O webhook de pagamento
      substitui a confirmação manual de doações (Configurações → Confirmar doações).
- [ ] **SMS** para verificar celular (opcional; hoje a confirmação é por e-mail). Tela `/verify-phone` mantida.
- [ ] Resgate de recompensas com **QR Code** único (5.5).
- [ ] "Perto de você" com **geolocalização real** (5.4).
- [ ] **Lembretes do calendário** (5.6).
- [ ] Conferir o **perfil da instituição** (5.2): carrossel, mapa e telefone com discador.
- [ ] Backup periódico de `~/salvee-uploads` e do MySQL (hPanel → Backups).
