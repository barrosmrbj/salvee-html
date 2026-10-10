-- Salvee v1.17.0 — banners "Promoções & metas" do topo da busca
-- OPCIONAL: o servidor cria a tabela sozinho ao subir (initDb em server/db.js).
-- Use só se quiser criar/conferir pelo phpMyAdmin (aba SQL do banco u526770669_salvee).
-- O cadastro dos banners é pelo app: Configurações → Administração → Promoções da busca.

CREATE TABLE IF NOT EXISTS `promotions` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) NULL,
  `image_url` varchar(255) NULL,
  `link_type` varchar(255) DEFAULT 'none',   -- none | campaign | institution
  `link_id` varchar(36) NULL,
  `starts_at` varchar(255) NULL,              -- AAAA-MM-DD
  `ends_at` varchar(255) NULL,                -- AAAA-MM-DD
  `active` tinyint(1) DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_by` varchar(36) NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conferência: banners ativos hoje
SELECT title, starts_at, ends_at, active, sort_order FROM `promotions`
WHERE active = 1 AND (starts_at IS NULL OR starts_at <= CURDATE()) AND (ends_at IS NULL OR ends_at >= CURDATE())
ORDER BY sort_order;
