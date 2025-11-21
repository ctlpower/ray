-- Création des tables pour Rayz.com

-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des slides hero
CREATE TABLE IF NOT EXISTS hero_slides (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  image TEXT, -- Stockage base64 ou URL
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Nom de l'icône FontAwesome
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des projets
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  image TEXT,
  details TEXT, -- Détails supplémentaires en JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table à propos
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  image TEXT,
  stats JSONB, -- Stockage des statistiques en JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des liens sociaux
CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  icon VARCHAR(100), -- Nom de l'icône FontAwesome
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des paramètres du site
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'Rayz.com',
  logo TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  theme_settings JSONB, -- Couleurs, polices, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  service VARCHAR(100),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des promotions
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  active BOOLEAN DEFAULT false,
  theme_settings JSONB, -- Paramètres visuels pour la promotion
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de l'administrateur par défaut (mot de passe: admin123)
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2a$10$8K1p/a0dRTlB0Z6bZ8BzE.O6g/6bJY2bY7b8c6fV5nV3kK8b8b8b8');

-- Insertion des données par défaut
INSERT INTO hero_slides (title, description, button_text, button_link, image, order_index) VALUES 
('Solutions de Sécurité Innovantes', 'Rayz.com est votre partenaire de confiance pour l''installation de systèmes de surveillance modernes, Starlink, alarmes et bien plus encore.', 'Voir nos projets', '#projects', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDYwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDUwIiByeD0iMTUiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTE1MCAxNTBINDVWMTE1SDE1MFYxNTBaIiBmaWxsPSIjRTVFN0VGIi8+CjxwYXRoIGQ9Ik0xNTAgMTg1SDQ1VjIyMEgxNTBWMTg1WiIgZmlsbD0iI0U1RTdFRiIvPgo8cGF0aCBkPSJNMTUwIDI1NUg0NVYyOTBIMTUwVjI1NVoiIGZpbGw9IiNFNUU3RUYiLz4KPHBhdGggZD0iTTE1MCAzMjVINDVWMzYwSDE1MFYzMjVaIiBmaWxsPSIjRTVFN0VGIi8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjIyNSIgcj0iODAiIGZpbGw9IiMwMDk2RDYiLz4KPHBhdGggZD0iTTI2MCAyMjVMMzIwIDI2NVYxODVMMjYwIDIyNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zNDAgMjI1TDI4MCAxODVWMjY1TDM0MCAyMjVaIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIzNzAiIHk9IjE1MCIgd2lkdGg9IjE4NSIgaGVpZ2h0PSIyMDAiIHJ4PSIxMCIgZmlsbD0iI0Y1RjdGQSIvPgo8cmVjdCB4PSIzOTAiIHk9IjE3MCIgd2lkdGg9IjE0NSIgaGVpZ2h0PSIxNDAiIHJ4PSI1IiBmaWxsPSIjRTVFN0VGIi8+CjxjaXJjbGUgY3g9IjQxMCIgY3k9IjE5MCIgcj0iNSIgZmlsbD0iIzAwOTZENiIvPgo8Y2lyY2xlIGN4PSI0MzAiIGN5PSIxOTAiIHI9IjUiIGZpbGw9IiMwMDk2RDYiLz4KPGNpcmNsZSBjeD0iNDUwIiBjeT0iMTkwIiByPSI1IiBmaWxsPSIjMDA5NkQ2Ii8+CjxyZWN0IHg9IjQxMCIgeT0iMjEwIiB3aWR0aD0iMTI1IiBoZWlnaHQ9IjEwIiByeD0iNSIgZmlsbD0iI0U1RTdFRiIvPgo8cmVjdCB4PSI0MTAiIHk9IjIzMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMCIgcng9IjUiIGZpbGw9IiNFNUU3RUYiLz4KPHJlY3QgeD0iNDEwIiB5PSIyNTAiIHdpZHRoPSI4NSIgaGVpZ2h0PSIxMCIgcng9IjUiIGZpbGw9IiNFNUU3RUYiLz4KPHJlY3QgeD0iNDEwIiB5PSIyNzAiIHdpZHRoPSI3NSIgaGVpZ2h0PSIxMCIgcng9IjUiIGZpbGw9IiNFNUU3RUYiLz4KPHJlY3QgeD0iNDEwIiB5PSIyOTAiIHdpZHRoPSI2NSIgaGVpZ2h0PSIxMCIgcng9IjUiIGZpbGw9IiNFNUU3RUYiLz4KPC9zdmc+Cg==', 0),
('Installation Starlink Professionnelle', 'Connectez-vous partout avec nos solutions d''installation Starlink haut débit pour particuliers et entreprises.', 'Nos services', '#services', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDYwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDUwIiByeD0iMTUiIGZpbGw9IiNGRkZGRkYiLz4KPHBhdGggZD0iTTMwMCAxMDBIMzE1VjM1MEgzMDBWMTAwWiIgZmlsbD0iI0U1RTdFRiIvPgo8cGF0aCBkPSJNMjg1IDEwMEgzMDBWMzUwSDI4NVYxMDBaIiBmaWxsPSIjRTVFN0VGIi8+CjxwYXRoIGQ9Ik0xNTAgMTUwSDE2NVYzMDBIMTUwVjE1MFoiIGZpbGw9IiNFNUU3RUYiLz4KPHBhdGggZD0iTTEzNSAxNTBIMTUwVjMwMEgxMzVWMTUwWiIgZmlsbD0iI0U1RTdFRiIvPgo8cGF0aCBkPSJNNDUwIDE1MEg0NjVWMzAwSDQ1MFYxNTBaIiBmaWxsPSIjRTVFN0VGIi8+CjxwYXRoIGQ9Ik00MzUgMTUwSDQ1MFYzMDAgSDQzNVYxNTBaIiBmaWxsPSIjRTVFN0VGIi8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iIzAwOTZENiIvPgo8cGF0aCBkPSJNMjc1IDcwSDMyNVY5MEgyNzVWNzBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjk1IDU1TDMwNSA3NUgyODVMMjk1IDU1WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTMwNSA1NUwyOTUgNzVIMzE1TDMwNSA1NVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMDAgMzUwSDQwMFYzNjVIMjAwVjM1MFoiIGZpbGw9IiMwMDk2RDYiLz4KPHBhdGggZD0iTTE4NSAzMzVINDAwVjM1MEgxODVWMzM1WiIgZmlsbD0iIzAwOTZENiIvPgo8L3N2Zz4K', 1);

INSERT INTO services (title, description, icon) VALUES 
('Surveillance Vidéo', 'Installation de systèmes de vidéosurveillance haute définition avec détection intelligente et vision nocturne.', 'fas fa-video'),
('Starlink', 'Installation professionnelle de systèmes Starlink pour une connectivité Internet haut débit partout.', 'fas fa-satellite-dish'),
('Systèmes d''Alarme', 'Solutions d''alarme complètes avec détection de mouvement, capteurs et notifications en temps réel.', 'fas fa-shield-alt'),
('Contrôle d''Accès', 'Installation de systèmes de contrôle d''accès avec badges, empreintes digitales et reconnaissance faciale.', 'fas fa-fingerprint'),
('Réseaux Sécurisés', 'Configuration de réseaux Wi-Fi sécurisés avec pare-feu et systèmes de protection avancés.', 'fas fa-wifi'),
('Vente d''Équipements', 'Large gamme d''équipements de sécurité disponibles à l''achat sur notre site web Rayz.com.', 'fas fa-store');

INSERT INTO about (title, description, image, stats) VALUES 
('À Propos de Rayz.com', 'Fondée en 2018, Rayz.com est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes. Notre équipe d''experts est passionnée par la création d''environnements plus sûrs et mieux connectés.', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDUwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNDAwIiByeD0iMTUiIGZpbGw9IiNGRkZGRkYiLz4KPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iNDYwIiBoZWlnaHQ9IjM2MCIgcng9IjEwIiBmaWxsPSIjRjhGQUZDIi8+CjxjaXJjbGUgY3g9IjI1MCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiMwMDk2RDYiLz4KPHBhdGggZD0iTTIxMCAxNTBMMjUwIDExMEwyOTAgMTUwSDIxMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yOTAgMTUwTDI1MCAxOTBMMjEwIDE1MEgyOTBaIiBmaWxsPSJ3aGl0ZSIvPgo8cmVjdCB4PSIxNTAiIHk9IjI0MCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIxMCIgZmlsbD0iI0U5RTdFRiIvPgo8cmVjdCB4PSIxNzAiIHk9IjI2MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSI2MCIgcng9IjUiIGZpbGw9IiNGNEY2RjgiLz4KPC9zdmc+Cg==', '{"projects": "500+", "satisfaction": "98%", "support": "24/7"}');

INSERT INTO social_links (platform, url, icon) VALUES 
('Facebook', 'https://facebook.com/rayz', 'fab fa-facebook-f'),
('Twitter', 'https://twitter.com/rayz', 'fab fa-twitter'),
('Instagram', 'https://instagram.com/rayz', 'fab fa-instagram'),
('LinkedIn', 'https://linkedin.com/company/rayz', 'fab fa-linkedin-in'),
('WhatsApp', 'https://wa.me/33123456789', 'fab fa-whatsapp');

INSERT INTO site_settings (site_name, logo, contact_email, contact_phone, contact_address, theme_settings) VALUES 
('Rayz.com', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNSIgZmlsbD0iIzAwOTZENiIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMCIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE0IDE0TDI2IDIwTDE0IDI2VjE0WiIgZmlsbD0iIzAwOTZENiIvPgo8L3N2Zz4K', 'contact@rayz.com', '+33 1 23 45 67 89', '123 Avenue de la Sécurité, 75000 Paris', '{"primary": "#0096D6", "secondary": "#FF6B35", "accent": "#00D4AA"}');