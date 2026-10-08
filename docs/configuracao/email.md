# E-mail do Salvee: como configurar (Hostinger)

O código já está pronto (v1.9.0, `server/mailer.js`). O Salvee usa e-mail para duas coisas:

1. **Recuperar a senha:** "Esqueci minha senha" envia um link para criar uma nova senha (vale 1 hora, uso único).
2. **Confirmar o cadastro:** depois de criar a conta, a pessoa recebe "Confirme seu e-mail" (o link vale 3 dias).
   A confirmação **não bloqueia** o uso do app. Substitui a verificação por SMS, que fica para o futuro.

Enquanto as variáveis abaixo não existirem no painel, em produção:
- "Esqueci minha senha" avisa que a recuperação ainda não está disponível;
- o cadastro pula a tela de confirmação.

No computador (dev), sem as variáveis, o e-mail aparece no terminal do servidor, com o link, para testar.

> **De quem é a caixa de e-mail:** do cliente (dono do app), no domínio dele. O ideal é ter um
> domínio próprio (ex.: `salvee.com.br`). Com o domínio temporário `*.hostingersite.com` a Hostinger
> pode não permitir criar caixas; nesse caso, registrar/apontar um domínio próprio primeiro.

---

## Parte 1: criar a caixa de envio no hPanel
1. **hpanel.hostinger.com** → menu **E-mails**.
2. Escolher o domínio do Salvee (se pedir, ativar o **E-mail da Hostinger** grátis que vem no plano).
3. **Criar conta de e-mail**:
   - Endereço: `nao-responda@<dominio>` (ou `contato@<dominio>`)
   - Senha: forte, guardar em local seguro (**não** colar em chat).
4. Na lista de contas, abrir **Configurar dispositivos / Detalhes de configuração** e conferir o
   **SMTP**: servidor `smtp.hostinger.com`, porta `465`, SSL.

## Parte 2: colocar no app
hPanel → app **skyblue-hedgehog** → **Variáveis de ambiente** → **Editar** → **Adicionar mais**:

| Chave | Valor |
|---|---|
| `SMTP_USER` | o endereço completo, ex.: `nao-responda@<dominio>` |
| `SMTP_PASS` | a senha da caixa |
| `MAIL_FROM` | (opcional) nome que aparece: `Salvee <nao-responda@<dominio>>` |
| `SMTP_HOST` | (opcional) só se for diferente de `smtp.hostinger.com` |
| `SMTP_PORT` | (opcional) só se for diferente de `465` (`587` também funciona) |

Salvar e **reimplantar**.

## Parte 3: testar
1. `https://skyblue-hedgehog-581364.hostingersite.com/api/auth/mail-status` deve mostrar `{"enabled":true}`.
2. No app: **Entrar → Esqueci minha senha** → digitar um e-mail cadastrado → o e-mail chega em até 1 minuto
   (ver também o spam) → **Criar nova senha** → entrar com a nova senha.
3. Criar uma conta nova → chega "Confirme seu e-mail" → tocar no botão → "E-mail confirmado!".

## Para os e-mails não caírem no spam
No hPanel → **Domínios → DNS**, conferir se existem os registros **SPF**, **DKIM** e **DMARC** do
e-mail da Hostinger (em geral são criados sozinhos quando o e-mail é ativado no domínio).

## Se algo der errado
- Log do app com `[e-mail nova senha] ...` ou `[e-mail confirmação] ...`: a linha diz o motivo
  (`Invalid login` = usuário/senha errados; `ECONNREFUSED`/`timeout` = servidor ou porta errados).
- A pessoa não recebe: pedir de novo depois de 1 minuto (antes disso o app não reenvia) e olhar o spam.
- O link abre "inválido ou vencido": o de nova senha vale 1 hora e só uma vez; pedir outro.
