const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Créer le dossier uploads s'il n'existe pas
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes API
app.get('/api/site-data', async (req, res) => {
  try {
    const { data: siteInfo, error: siteError } = await supabase
      .from('site_info')
      .select('*')
      .eq('id', 1)
      .single();

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: false });

    if (siteError) console.error('Erreur site_info:', siteError);
    if (servicesError) console.error('Erreur services:', servicesError);
    if (projectsError) console.error('Erreur projects:', projectsError);
    if (promotionsError) console.error('Erreur promotions:', promotionsError);

    res.json({
      siteInfo: siteInfo || {},
      services: services || [],
      projects: projects || [],
      promotions: promotions || []
    });
  } catch (err) {
    console.error('Erreur API site-data:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des données'
    });
  }
});

// Route pour l'admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route pour toutes les autres requêtes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialisation de la base de données
async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Test de connexion
    const { data, error } = await supabase.from('site_info').select('*').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error);
      return;
    }
    
    console.log('✅ Connexion à Supabase réussie');
  } catch (err) {
    console.error('❌ Erreur initialisation base de données:', err);
  }
}

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📧 EmailJS configuré`);
  await initializeDatabase();
});
