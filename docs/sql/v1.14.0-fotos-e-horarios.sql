-- Salvee v1.14.0 — fotos do perfil e horário de funcionamento da instituição (spec 8.3, 13.3 e 13.10)
-- OPCIONAL: o servidor cria as colunas sozinho ao subir (initDb em server/db.js).
-- Use só se quiser criar/conferir pelo phpMyAdmin (aba SQL do banco u526770669_salvee).

ALTER TABLE `institutions` ADD COLUMN IF NOT EXISTS `photos` text NULL;           -- JSON com até 6 links /uploads/...
ALTER TABLE `institutions` ADD COLUMN IF NOT EXISTS `opening_hours` varchar(255) NULL;

-- Conferência
SHOW COLUMNS FROM `institutions` WHERE Field IN ('photos', 'opening_hours');
