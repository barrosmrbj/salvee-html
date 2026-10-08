# Banco de produção (MySQL/MariaDB da Hostinger): como as mudanças chegam

## Regra geral: é automático
Toda mudança de banco do Salvee (tabela ou coluna nova) fica em `initDb()` (`server/db.js`).
Quando a Hostinger implanta um push na `master`, o servidor sobe, roda o `initDb()` e:
1. cria as tabelas e colunas que faltarem (nunca apaga dados);
2. deixa todas as tabelas com a mesma collation `utf8mb4_unicode_ci` (evita o erro
   "Illegal mix of collations" que aconteceu na v1.10.0).

Ou seja: **não é preciso rodar nada no phpMyAdmin**. Os scripts em `docs/sql/` são opcionais,
para quem quiser criar ou conferir na mão.

## Como conferir depois de um deploy
**Pelo SSH** (mostra o log do app):
```bash
tail -30 ~/domains/skyblue-hedgehog-581364.hostingersite.com/hbuilds/current/nodejs/console.log
```
Tem que aparecer `Database ready` e `Salvee API <versão> running`. Erro de banco aparece como
`Falha ao conectar/preparar o banco` ou `Falha ao unificar a collation`.

**Pelo phpMyAdmin:** hPanel → Bancos de dados → phpMyAdmin → `u526770669_salvee` → a tabela
nova deve aparecer na lista da esquerda.

## Criar na mão pelo phpMyAdmin (opcional)
Exemplo da v1.11.0 (curtidas e comentários):
1. **Backup antes:** hPanel → Backups → Bancos de dados → baixar o `u526770669_salvee`
   (ou, no phpMyAdmin, aba **Exportar** → Executar).
2. hPanel → Bancos de dados → **phpMyAdmin** → clicar em `u526770669_salvee` na esquerda.
3. Aba **SQL** → colar o conteúdo de `docs/sql/v1.11.0-curtidas-comentarios.sql` → **Executar**.
4. O resultado da última consulta deve listar `post_likes` e `post_comments` com
   `utf8mb4_unicode_ci`. Pode rodar de novo sem problema (`IF NOT EXISTS`).

## Estrutura das tabelas de curtidas e comentários (v1.11.0)
| Tabela | Colunas | Regras |
|---|---|---|
| `post_likes` | `id`, `post_id`, `user_id`, `created_at`, `updated_at` | Uma curtida por pessoa por publicação (índice único `post_id + user_id`). |
| `post_comments` | `id`, `post_id`, `user_id`, `content` (texto, até 500 caracteres pelo app), `created_at`, `updated_at` | Apagar: autor, instituição dona da publicação ou admin/gestor. |

Ao excluir uma publicação, o servidor apaga junto as curtidas, os comentários e as inscrições
na agenda dela.

## Consultas úteis (aba SQL do phpMyAdmin)
```sql
-- publicações mais curtidas
SELECT p.id, LEFT(p.content, 60) AS texto, COUNT(l.id) AS curtidas
FROM posts p LEFT JOIN post_likes l ON l.post_id = p.id
GROUP BY p.id ORDER BY curtidas DESC LIMIT 10;

-- últimos comentários
SELECT c.created_at, u.name, LEFT(c.content, 80) AS comentario
FROM post_comments c LEFT JOIN users u ON u.id = c.user_id
ORDER BY c.created_at DESC LIMIT 20;
```
