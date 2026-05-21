-- Salvee: migração de usuários para MySQL Hostinger
-- Execute este arquivo no phpMyAdmin ou via SSH: mysql -u u526770669_salvee -p u526770669_salvee < migrate_users.sql

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  xp INT DEFAULT 0,
  salves INT DEFAULT 0,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (id, name, email, password_hash, xp, salves, level) VALUES
(
  '6171bb76-2dd9-4f95-acab-5c74eb919e52',
  'Admin Salvee',
  'admin@salvee.com',
  '$2a$10$DQtkCrb33E1aDmTrxfp/ZOY1ZD010YNp4jAFyPRoDsfOmVqsfRNEm',
  1000, 2000, 10
),
(
  'a2553810-5242-403e-899f-a46f82819d04',
  'José Felipe Amorim',
  'jose@salvee.com',
  '$2a$10$.g3LwSj46aimDlSUJ9Lw2OJblvK4A4GZYFwXWKjwOjnkBHG1j.05G',
  350, 500, 5
),
(
  'e49539b5-d619-4e5b-bdb3-c42134bad598',
  'Ana Clara Souza',
  'ana@salvee.com',
  '$2a$10$x2bqifS9hCxEuKdcb8W7pOJ2YIQ/KJQDaHPW5j.cj/Lq8/QfnDQHW',
  200, 150, 3
),
(
  '50f4c207-74ec-4d99-bbaa-66f76dd1168f',
  'Carlos Eduardo Lima',
  'carlos@salvee.com',
  '$2a$10$nL0IWE0hwTPhXa/rXQbmUedtCd7VzWQi9X7TPvLxnfsVzgDLtQp0K',
  480, 300, 6
),
(
  '0464f962-0a60-4366-88c5-7911efea4dfd',
  'Marina Oliveira',
  'marina@salvee.com',
  '$2a$10$CzJdxLyRcAt5DPKKQ5Wdkep9FVxOb/7uD4PzWztuKDvwSQ13r41M2',
  120, 80, 2
);

SELECT name, email, level, xp FROM users;
