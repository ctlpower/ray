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

// Routes pour l'API
// Récupérer les données du site
app.get('/api/site-data', async (req, res) => {
  try {
    // Récupérer les informations du site
    const { data: siteInfo, error: siteError } = await supabase
      .from('site_info')
      .select('*')
      .eq('id', 1)
      .single();

    // Récupérer les services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    // Récupérer les projets
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    // Récupérer les promotions actives
    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: false });

    if (siteError || servicesError || projectsError || promotionsError) {
      throw new Error('Erreur lors de la récupération des données');
    }

    res.json({
      siteInfo: siteInfo || {},
      services: services || [],
      projects: projects || [],
      promotions: promotions || []
    });
  } catch (err) {
    console.error('Erreur API site-data:', err);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des données',
      details: err.message 
    });
  }
});

// Mettre à jour les informations du site
app.post('/api/update-site-info', async (req, res) => {
  try {
    const {
      company_name, description, address, phone, email,
      facebook, twitter, instagram, linkedin, whatsapp,
      maintenance_mode, maintenance_message, logo_url,
      hero_title, hero_description, about_title, about_description
    } = req.body;

    const { data, error } = await supabase
      .from('site_info')
      .upsert({
        id: 1,
        company_name,
        description,
        address,
        phone,
        email,
        facebook,
        twitter,
        instagram,
        linkedin,
        whatsapp,
        maintenance_mode: maintenance_mode || false,
        maintenance_message,
        logo_url,
        hero_title,
        hero_description,
        about_title,
        about_description,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Informations du site mises à jour avec succès',
      data: data[0]
    });
  } catch (err) {
    console.error('Erreur mise à jour site info:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la mise à jour des informations' 
    });
  }
});

// Gestion des services
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', upload.single('image'), async (req, res) => {
  try {
    const { title, description, icon, promotion, promotion_text, order_index } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          title,
          description,
          icon,
          image_url,
          promotion: promotion || false,
          promotion_text,
          order_index: order_index || 0
        }
      ])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/services/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, promotion, promotion_text, order_index } = req.body;
    
    let updateData = {
      title,
      description,
      icon,
      promotion: promotion || false,
      promotion_text,
      order_index: order_index || 0,
      updated_at: new Date().toISOString()
    };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Service supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Gestion des projets
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          category,
          image_url
        }
      ])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    
    let updateData = {
      title,
      description,
      category,
      updated_at: new Date().toISOString()
    };

    if (req.file) {
      updateData.image_url = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Projet supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Gestion des promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions', upload.single('banner_image'), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      start_date,
      end_date,
      active,
      animation_type,
      discount_text,
      services_affected
    } = req.body;

    const banner_image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('promotions')
      .insert([
        {
          title,
          description,
          type,
          start_date,
          end_date,
          active: active || false,
          animation_type,
          discount_text,
          banner_image,
          services_affected: services_affected || []
        }
      ])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/promotions/:id', upload.single('banner_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      start_date,
      end_date,
      active,
      animation_type,
      discount_text,
      services_affected
    } = req.body;

    let updateData = {
      title,
      description,
      type,
      start_date,
      end_date,
      active: active || false,
      animation_type,
      discount_text,
      services_affected: services_affected || [],
      updated_at: new Date().toISOString()
    };

    if (req.file) {
      updateData.banner_image = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Promotion supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Envoi d'email de contact
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Utilisation de EmailJS côté client, cette route peut être utilisée pour d'autres traitements
    // Pour l'instant, nous allons simplement logger la demande
    console.log('Demande de contact reçue:', {
      name,
      email,
      phone,
      service,
      message,
      timestamp: new Date().toISOString()
    });

    // Sauvegarder le message dans Supabase
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          phone,
          service,
          message
        }
      ]);

    if (error) {
      console.error('Erreur sauvegarde message:', error);
    }

    res.json({ 
      success: true, 
      message: 'Votre message a été envoyé avec succès! Nous vous contacterons bientôt.' 
    });
  } catch (err) {
    console.error('Erreur envoi email:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' 
    });
  }
});

// Tâche cron pour désactiver les promotions expirées
cron.schedule('0 0 * * *', async () => {
  try {
    const { error } = await supabase
      .from('promotions')
      .update({ active: false })
      .lt('end_date', new Date().toISOString())
      .eq('active', true);

    if (error) {
      console.error('Erreur désactivation promotions:', error);
    } else {
      console.log('Promotions expirées désactivées');
    }
  } catch (err) {
    console.error('Erreur tâche cron:', err);
  }
});

// Routes pour les pages
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialisation de la base de données
async function initializeDatabase() {
  try {
    // Vérifier/Créer la table site_info
    const { error: siteError } = await supabase
      .from('site_info')
      .upsert({
        id: 1,
        company_name: 'Rayz.com',
        description: 'Votre partenaire de confiance pour des solutions de sécurité innovantes et performantes.',
        address: '123 Avenue de la Sécurité, 75000 Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@rayz.com',
        hero_title: 'Solutions de Sécurité Innovantes',
        hero_description: 'Rayz.com est votre partenaire de confiance pour l\'installation de systèmes de surveillance modernes, Starlink, alarmes et bien plus encore.',
        about_title: 'À Propos de Rayz.com',
        about_description: 'Fondée en 2018, Rayz.com est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes.',
        created_at: new Date().toISOString()
      })
      .select();

    if (siteError) console.log('Erreur initialisation site_info:', siteError);

    // Services par défaut
    const defaultServices = [
      {
        title: 'Surveillance Vidéo',
        description: 'Installation de systèmes de vidéosurveillance haute définition avec détection intelligente et vision nocturne.',
        icon: 'fas fa-video',
        order_index: 1
      },
      {
        title: 'Starlink',
        description: 'Installation professionnelle de systèmes Starlink pour une connectivité Internet haut débit partout.',
        icon: 'fas fa-satellite-dish',
        order_index: 2
      },
      {
        title: 'Systèmes d\'Alarme',
        description: 'Solutions d\'alarme complètes avec détection de mouvement, capteurs et notifications en temps réel.',
        icon: 'fas fa-shield-alt',
        order_index: 3
      },
      {
        title: 'Contrôle d\'Accès',
        description: 'Installation de systèmes de contrôle d\'accès avec badges, empreintes digitales et reconnaissance faciale.',
        icon: 'fas fa-fingerprint',
        order_index: 4
      },
      {
        title: 'Réseaux Sécurisés',
        description: 'Configuration de réseaux Wi-Fi sécurisés avec pare-feu et systèmes de protection avancés.',
        icon: 'fas fa-wifi',
        order_index: 5
      },
      {
        title: 'Vente d\'Équipements',
        description: 'Large gamme d\'équipements de sécurité disponibles à l\'achat sur notre site web Rayz.com.',
        icon: 'fas fa-store',
        order_index: 6
      }
    ];

    for (const service of defaultServices) {
      const { error: serviceError } = await supabase
        .from('services')
        .upsert(service)
        .select();
      
      if (serviceError) console.log('Erreur initialisation service:', serviceError);
    }

    console.log('Base de données initialisée avec succès');
  } catch (err) {
    console.error('Erreur initialisation base de données:', err);
  }
}

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📧 EmailJS configuré avec le template: template_m8zvkj9`);
  await initializeDatabase();
});
