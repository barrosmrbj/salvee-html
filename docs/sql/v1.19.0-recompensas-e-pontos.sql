-- Salvee v1.19.0 — recompensas com QR Code e regra de pontos configurável (spec 18)
-- OPCIONAL: o servidor cria tudo sozinho ao subir (initDb em server/db.js).
-- Use só se quiser criar/conferir pelo phpMyAdmin (aba SQL do banco u526770669_salvee).
-- A configuração é pelo app: Configurações → Administração → Pontos e recompensas (regras).

CREATE TABLE IF NOT EXISTS `settings` (
  `key` varchar(64) NOT NULL,
  `value` text NOT NULL,           -- JSON
  `updated_by` varchar(36) NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `rewards` ADD COLUMN IF NOT EXISTS `active` tinyint(1) DEFAULT 1;
ALTER TABLE `rewards` ADD COLUMN IF NOT EXISTS `min_level` int DEFAULT 0;
ALTER TABLE `rewards` ADD COLUMN IF NOT EXISTS `valid_until` varchar(255) NULL;   -- AAAA-MM-DD
ALTER TABLE `rewards` ADD COLUMN IF NOT EXISTS `reward_type` varchar(255) NULL;

CREATE TABLE IF NOT EXISTS `user_rewards` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `reward_id` varchar(36) NOT NULL,
  `code` varchar(32) NOT NULL,       -- vai no QR Code; uso único
  `cost_paid` int NOT NULL,
  `expires_at` varchar(255) NULL,    -- AAAA-MM-DD
  `used_at` timestamp NULL,
  `validated_by` varchar(36) NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_rewards_code_unique` (`code`),
  KEY `user_rewards_user_id_index` (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conferência: resgates por recompensa e quantos já foram usados
SELECT r.title, COUNT(u.id) AS resgates, SUM(u.used_at IS NOT NULL) AS usados
FROM `rewards` r LEFT JOIN `user_rewards` u ON u.reward_id = r.id
GROUP BY r.id, r.title;
