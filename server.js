const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Routes pour l'API
// Récupérer les projets
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// Récupérer les services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des services' });
  }
});

// Récupérer les informations du site
app.get('/api/site-info', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_info WHERE id = 1');
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des informations du site' });
  }
});

// Ajouter un projet
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      'INSERT INTO projects (title, description, category, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, category, image]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du projet' });
  }
});

// Modifier un projet
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    let image = null;
    
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
      await pool.query(
        'UPDATE projects SET title = $1, description = $2, category = $3, image = $4 WHERE id = $5',
        [title, description, category, image, id]
      );
    } else {
      await pool.query(
        'UPDATE projects SET title = $1, description = $2, category = $3 WHERE id = $4',
        [title, description, category, id]
      );
    }
    
    res.json({ message: 'Projet modifié avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la modification du projet' });
  }
});

// Supprimer un projet
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
});

// Mettre à jour les informations du site
app.put('/api/site-info', async (req, res) => {
  try {
    const { company_name, description, address, phone, email, facebook, twitter, instagram, linkedin, whatsapp, maintenance_mode, maintenance_message } = req.body;
    
    await pool.query(`
      INSERT INTO site_info (id, company_name, description, address, phone, email, facebook, twitter, instagram, linkedin, whatsapp, maintenance_mode, maintenance_message)
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        company_name = $1,
        description = $2,
        address = $3,
        phone = $4,
        email = $5,
        facebook = $6,
        twitter = $7,
        instagram = $8,
        linkedin = $9,
        whatsapp = $10,
        maintenance_mode = $11,
        maintenance_message = $12
    `, [company_name, description, address, phone, email, facebook, twitter, instagram, linkedin, whatsapp, maintenance_mode, maintenance_message]);
    
    res.json({ message: 'Informations du site mises à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des informations du site' });
  }
});

// Route pour la page d'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route pour la page principale
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialisation de la base de données
async function initializeDatabase() {
  try {
    // Création de la table projects
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Création de la table services
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100)
      )
    `);
    
    // Insertion des services par défaut
    await pool.query(`
      INSERT INTO services (title, description, icon) VALUES
      ('Surveillance Vidéo', 'Installation de systèmes de vidéosurveillance haute définition avec détection intelligente et vision nocturne.', 'fas fa-video'),
      ('Starlink', 'Installation professionnelle de systèmes Starlink pour une connectivité Internet haut débit partout.', 'fas fa-satellite-dish'),
      ('Systèmes d''Alarme', 'Solutions d''alarme complètes avec détection de mouvement, capteurs et notifications en temps réel.', 'fas fa-shield-alt'),
      ('Contrôle d''Accès', 'Installation de systèmes de contrôle d''accès avec badges, empreintes digitales et reconnaissance faciale.', 'fas fa-fingerprint'),
      ('Réseaux Sécurisés', 'Configuration de réseaux Wi-Fi sécurisés avec pare-feu et systèmes de protection avancés.', 'fas fa-wifi'),
      ('Vente d''Équipements', 'Large gamme d''équipements de sécurité disponibles à l''achat sur notre site web Rayz.com.', 'fas fa-store')
      ON CONFLICT DO NOTHING
    `);
    
    // Création de la table site_info
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_info (
        id INTEGER PRIMARY KEY,
        company_name VARCHAR(255) DEFAULT 'Rayz.com',
        description TEXT,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(100),
        facebook VARCHAR(255),
        twitter VARCHAR(255),
        instagram VARCHAR(255),
        linkedin VARCHAR(255),
        whatsapp VARCHAR(255),
        maintenance_mode BOOLEAN DEFAULT FALSE,
        maintenance_message TEXT
      )
    `);
    
    // Insertion des informations par défaut du site
    await pool.query(`
      INSERT INTO site_info (id, company_name, description, address, phone, email) 
      VALUES (1, 'Rayz.com', 'Votre partenaire de confiance pour des solutions de sécurité innovantes et performantes.', '123 Avenue de la Sécurité, 75000 Paris', '+33 1 23 45 67 89', 'contact@rayz.com')
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('Base de données initialisée avec succès');
  } catch (err) {
    console.error('Erreur lors de l\'initialisation de la base de données:', err);
  }
}

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  await initializeDatabase();
});