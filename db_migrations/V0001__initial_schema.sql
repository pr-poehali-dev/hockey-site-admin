-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица новостей
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица матчей
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    match_date VARCHAR(50) NOT NULL,
    match_time VARCHAR(20) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    home_logo TEXT,
    away_logo TEXT,
    score VARCHAR(20),
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица игроков
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    position VARCHAR(100) NOT NULL,
    image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица галереи
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title VARCHAR(300),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица настроек сайта
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем администратора по умолчанию (логин: admin, пароль: dmitri1987)
-- Хеш пароля dmitri1987: $2b$10$...(будет создан в backend)
INSERT INTO admins (username, password_hash) 
VALUES ('admin', '$2b$10$YourHashHere') 
ON CONFLICT (username) DO NOTHING;

-- Вставляем начальные новости
INSERT INTO news (title, content, category, image_url, published_date) VALUES
('17 ЯНВАРЯ 2026 ГОДА. ТОРОС - ДИНАМО-АЛТАЙ', 'Анонс матча между командами Торос и Динамо-Алтай', 'Матч', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg', '2026-01-17 12:30:00'),
('Новый сезон 2025/2026', 'Начало нового сезона ВХЛ', 'Новость', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/ad4f37d5-567f-47c5-8081-7ee8c3633541.jpg', '2026-01-10 10:00:00'),
('Партнеры ХК "Торос"', 'Информация о партнерах клуба', 'Партнеры', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/7932246c-7bb3-4c22-8c49-3f970ee4c11d.jpg', '2026-01-05 14:00:00');

-- Вставляем начальные матчи
INSERT INTO matches (match_date, match_time, home_team, away_team, home_logo, score, location) VALUES
('21 ЯНВАРЯ', '19:00', 'ТОРОС', 'СОКОЛ', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/7932246c-7bb3-4c22-8c49-3f970ee4c11d.jpg', NULL, 'Нефтекамск'),
('19 ЯНВАРЯ', '17:00', 'ТОРОС', 'МЕТАЛЛУРГ НК', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/7932246c-7bb3-4c22-8c49-3f970ee4c11d.jpg', '0:0', 'Нефтекамск');

-- Вставляем начальных игроков
INSERT INTO players (number, name, position, image_url) VALUES
(17, 'Александр Иванов', 'Нападающий', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg'),
(23, 'Дмитрий Петров', 'Защитник', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg'),
(91, 'Сергей Смирнов', 'Вратарь', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg'),
(7, 'Максим Козлов', 'Нападающий', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg'),
(44, 'Андрей Новиков', 'Защитник', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg'),
(10, 'Игорь Федоров', 'Нападающий', 'https://cdn.poehali.dev/projects/a215b691-5cfb-4f4c-b25f-1a6a469468dc/files/0456d001-cb09-4443-8d8a-51dbbcc475ce.jpg');

-- Вставляем начальные настройки
INSERT INTO site_settings (setting_key, setting_value) VALUES
('site_title', 'ХК ТОРОС'),
('site_subtitle', 'Нефтекамск • ВХЛ • Сезон 2025/2026'),
('contact_phone', '+7 (34783) 5 54 23'),
('contact_email', 'reklama@hctoros.ru'),
('contact_address', 'Нефтекамск, Республика Башкортостан')
ON CONFLICT (setting_key) DO NOTHING;