-- Salvee v1.15.0 — coordenadas da instituição (spec 17.6 "Causas perto de você")
-- OPCIONAL: o servidor cria as colunas sozinho ao subir (initDb em server/db.js).
-- Use só se quiser criar/conferir pelo phpMyAdmin (aba SQL do banco u526770669_salvee).

ALTER TABLE `institutions` ADD COLUMN IF NOT EXISTS `latitude` double NULL;
ALTER TABLE `institutions` ADD COLUMN IF NOT EXISTS `longitude` double NULL;

-- Conferência: instituições aprovadas sem local no mapa (não aparecem por distância no GPS)
SELECT id, name, city, latitude, longitude FROM `institutions`
WHERE status = 'approved' AND (latitude IS NULL OR longitude IS NULL);
