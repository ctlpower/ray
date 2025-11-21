import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import multer from 'multer';
import dotenv from 'dotenv';
import cron from 'node-cron';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
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
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes API
// Récupérer les données du site
app.get('/api/site-data', async (req, res) => {
  try {
    const [siteInfo, services, projects, promotions, carousel] = await Promise.all([
      supabase.from('site_info').select('*').eq('id', 1).single(),
      supabase.from('services').select('*').order('order_index'),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('promotions').select('*').eq('is_active', true),
      supabase.from('carousel').select('*').order('order_index')
    ]);

    res.json({
      site_info: siteInfo.data,
      services: services.data,
      projects: projects.data,
      promotions: promotions.data,
      carousel: carousel.data
    });
  } catch (err) {
    console.error('Error fetching site data:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des données' });
  }
});

// Mettre à jour les informations du site
app.post('/api/update-site-info', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_info')
      .update(req.body)
      .eq('id', 1);

    if (error) throw error;
    res.json({ message: 'Informations mises à jour avec succès' });
  } catch (err) {
    console.error('Error updating site info:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Gérer les services
app.post('/api/update-service', upload.single('image'), async (req, res) => {
  try {
    const serviceData = { ...req.body };
    if (req.file) {
      serviceData.image = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', req.body.id);

    if (error) throw error;
    res.json({ message: 'Service mis à jour avec succès' });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du service' });
  }
});

// Gérer les projets
app.post('/api/add-project', upload.single('image'), async (req, res) => {
  try {
    const projectData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectData]);

    if (error) throw error;
    res.json({ message: 'Projet ajouté avec succès', project: data[0] });
  } catch (err) {
    console.error('Error adding project:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du projet' });
  }
});

app.post('/api/delete-project', async (req, res) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.body.id);

    if (error) throw error;
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du projet' });
  }
});

// Gérer les promotions
app.post('/api/update-promotion', upload.single('banner_image'), async (req, res) => {
  try {
    const promotionData = { ...req.body };
    if (req.file) {
      promotionData.banner_image = `/uploads/${req.file.filename}`;
    }

    if (promotionData.id) {
      const { data, error } = await supabase
        .from('promotions')
        .update(promotionData)
        .eq('id', promotionData.id);
      
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('promotions')
        .insert([promotionData]);
      
      if (error) throw error;
    }

    res.json({ message: 'Promotion mise à jour avec succès' });
  } catch (err) {
    console.error('Error updating promotion:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la promotion' });
  }
});

// Gérer le carousel
app.post('/api/update-carousel', upload.array('images', 5), async (req, res) => {
  try {
    const updates = [];
    
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const updateData = {
          image: `/uploads/${req.files[i].filename}`,
          title: req.body.titles ? req.body.titles[i] : '',
          description: req.body.descriptions ? req.body.descriptions[i] : '',
          order_index: i
        };
        
        if (req.body.ids && req.body.ids[i]) {
          // Update existing
          const { error } = await supabase
            .from('carousel')
            .update(updateData)
            .eq('id', req.body.ids[i]);
          
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('carousel')
            .insert([updateData]);
          
          if (error) throw error;
        }
      }
    }

    res.json({ message: 'Carousel mis à jour avec succès' });
  } catch (err) {
    console.error('Error updating carousel:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du carousel' });
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

// Tâche cron pour désactiver les promotions expirées
cron.schedule('0 0 * * *', async () => {
  try {
    const { error } = await supabase
      .from('promotions')
      .update({ is_active: false })
      .lt('end_date', new Date().toISOString());

    if (error) throw error;
    console.log('Promotions expirées désactivées');
  } catch (err) {
    console.error('Error deactivating expired promotions:', err);
  }
});

// Initialisation de la base de données
async function initializeDatabase() {
  try {
    // Vérifier/Créer les tables
    const tables = ['site_info', 'services', 'projects', 'promotions', 'carousel'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') {
        console.log(`Table ${table} n'existe pas, création...`);
        // Dans un environnement réel, vous devriez exécuter les scripts SQL de création de table
      }
    }

    // Insérer les données par défaut
    const { data: siteInfo } = await supabase.from('site_info').select('*').eq('id', 1);
    if (!siteInfo || siteInfo.length === 0) {
      await supabase.from('site_info').insert([{
        id: 1,
        company_name: 'Rayz.com',
        description: 'Votre partenaire de confiance pour des solutions de sécurité innovantes',
        address: '123 Avenue de la Sécurité, 75000 Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@rayz.com',
        whatsapp: '+33123456789',
        facebook: 'https://facebook.com/rayz',
        twitter: 'https://twitter.com/rayz',
        instagram: 'https://instagram.com/rayz',
        linkedin: 'https://linkedin.com/company/rayz',
        maintenance_mode: false,
        maintenance_message: ''
      }]);
    }

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
