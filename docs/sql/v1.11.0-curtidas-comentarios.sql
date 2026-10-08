-- Salvee v1.11.0 — curtidas e comentários (spec 11.8)
-- OPCIONAL: o servidor cria estas tabelas sozinho ao subir (initDb em server/db.js).
-- Use este script só se quiser criar/conferir pelo phpMyAdmin. Pode rodar mais de uma vez
-- (IF NOT EXISTS não apaga nem duplica nada). Passo a passo: docs/configuracao/mysql.md

CREATE TABLE IF NOT EXISTS `post_likes` (
  `id` varchar(36) NOT NULL,
  `post_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_likes_post_id_index` (`post_id`),
  UNIQUE KEY `post_likes_post_id_user_id_unique` (`post_id`, `user_id`) -- cada pessoa curte uma vez
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `post_comments` (
  `id` varchar(36) NOT NULL,
  `post_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_comments_post_id_index` (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conferência: as duas tabelas devem aparecer, com collation utf8mb4_unicode_ci
SELECT TABLE_NAME, TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('post_likes', 'post_comments');
