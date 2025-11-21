const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration Email
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de multer pour l'upload d'images
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Routes API

// Récupérer les données du site
app.get('/api/site-data', async (req, res) => {
  try {
    const [siteInfo, services, projects, promotions, banners] = await Promise.all([
      supabase.from('site_info').select('*').eq('id', 1).single(),
      supabase.from('services').select('*').order('order_index'),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('promotions').select('*').eq('is_active', true).order('start_date'),
      supabase.from('banners').select('*').eq('is_active', true).order('order_index')
    ]);

    res.json({
      siteInfo: siteInfo.data,
      services: services.data,
      projects: projects.data,
      promotions: promotions.data,
      banners: banners.data
    });
  } catch (error) {
    console.error('Error fetching site data:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Upload d'image vers Supabase Storage
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const fileName = `images/${Date.now()}-${req.file.originalname}`;
    const { data, error } = await supabase.storage
      .from('website-assets')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('website-assets')
      .getPublicUrl(fileName);

    res.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// Mettre à jour les informations du site
app.post('/api/update-site-info', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_info')
      .upsert({ id: 1, ...req.body })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Informations mises à jour avec succès', data });
  } catch (error) {
    console.error('Error updating site info:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// Gérer les services
app.post('/api/update-service', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .upsert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Service mis à jour avec succès', data });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du service' });
  }
});

// Gérer les projets
app.post('/api/update-project', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.existing_image;

    if (req.file) {
      const uploadResult = await supabase.storage
        .from('website-assets')
        .upload(`projects/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadResult.error) throw uploadResult.error;

      const { data: urlData } = supabase.storage
        .from('website-assets')
        .getPublicUrl(uploadResult.data.path);

      imageUrl = urlData.publicUrl;
    }

    const projectData = {
      ...req.body,
      image: imageUrl,
      updated_at: new Date().toISOString()
    };

    if (!req.body.id) {
      projectData.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('projects')
      .upsert(projectData)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Projet mis à jour avec succès', data });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
});

// Gérer les promotions
app.post('/api/update-promotion', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.existing_image;

    if (req.file) {
      const uploadResult = await supabase.storage
        .from('website-assets')
        .upload(`promotions/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadResult.error) throw uploadResult.error;

      const { data: urlData } = supabase.storage
        .from('website-assets')
        .getPublicUrl(uploadResult.data.path);

      imageUrl = urlData.publicUrl;
    }

    const promotionData = {
      ...req.body,
      image: imageUrl,
      updated_at: new Date().toISOString()
    };

    if (!req.body.id) {
      promotionData.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('promotions')
      .upsert(promotionData)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Promotion mise à jour avec succès', data });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la promotion' });
  }
});

// Gérer les bannières
app.post('/api/update-banner', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = req.body.existing_image;

    if (req.file) {
      const uploadResult = await supabase.storage
        .from('website-assets')
        .upload(`banners/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadResult.error) throw uploadResult.error;

      const { data: urlData } = supabase.storage
        .from('website-assets')
        .getPublicUrl(uploadResult.data.path);

      imageUrl = urlData.publicUrl;
    }

    const bannerData = {
      ...req.body,
      image: imageUrl,
      updated_at: new Date().toISOString()
    };

    if (!req.body.id) {
      bannerData.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('banners')
      .upsert(bannerData)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Bannière mise à jour avec succès', data });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la bannière' });
  }
});

// Envoyer un email de contact
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || 'contact@rayz.com',
      subject: `Nouveau message de contact - ${name}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Téléphone:</strong> ${phone || 'Non fourni'}</p>
        <p><strong>Service intéressé:</strong> ${service || 'Non spécifié'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await emailTransporter.sendMail(mailOptions);

    // Envoyer aussi un accusé de réception
    const confirmationMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation de réception - Rayz.com',
      html: `
        <h2>Merci pour votre message!</h2>
        <p>Nous avons bien reçu votre message et nous vous contacterons dans les plus brefs délais.</p>
        <p><strong>L'équipe Rayz.com</strong></p>
      `
    };

    await emailTransporter.sendMail(confirmationMail);

    res.json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' });
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
    // Cette fonction serait appelée manuellement la première fois
    console.log('Base de données Supabase configurée');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Démarrage du serveur
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  await initializeDatabase();
});
