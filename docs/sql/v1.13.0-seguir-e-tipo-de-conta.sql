-- Salvee v1.13.0 — seguir instituições e tipo de conta (spec 6.3, 11.2 e 23.1)
-- OPCIONAL: o servidor cria tudo sozinho ao subir (initDb em server/db.js).
-- Use só se quiser criar/conferir pelo phpMyAdmin (aba SQL do banco u526770669_salvee).
-- Passo a passo: docs/configuracao/mysql.md

CREATE TABLE IF NOT EXISTS `institution_follows` (
  `id` varchar(36) NOT NULL,
  `institution_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `institution_follows_institution_id_index` (`institution_id`),
  KEY `institution_follows_user_id_index` (`user_id`),
  UNIQUE KEY `institution_follows_institution_id_user_id_unique` (`institution_id`, `user_id`) -- segue uma vez
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Coluna nova em users. O MariaDB da Hostinger aceita IF NOT EXISTS aqui (pode rodar de novo).
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `account_type` varchar(255) DEFAULT 'user';

-- Conferência
SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'institution_follows';
SHOW COLUMNS FROM `users` LIKE 'account_type';
