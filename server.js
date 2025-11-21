import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes API

// Récupérer les données du site
app.get('/api/site-data', async (req, res) => {
  try {
    const { data: siteInfo, error: siteError } = await supabase
      .from('site_info')
      .select('*')
      .single();

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('order_index');

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: promotions, error: promotionsError } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .order('start_date', { ascending: false });

    const { data: socialLinks, error: socialError } = await supabase
      .from('social_links')
      .select('*');

    if (siteError || servicesError || projectsError || promotionsError || socialError) {
      throw new Error('Erreur lors de la récupération des données');
    }

    res.json({
      siteInfo: siteInfo || {},
      services: services || [],
      projects: projects || [],
      promotions: promotions || [],
      socialLinks: socialLinks || []
    });
  } catch (error) {
    console.error('Erreur API site-data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour les informations du site
app.post('/api/update-site-info', async (req, res) => {
  try {
    const { siteInfo } = req.body;

    const { data, error } = await supabase
      .from('site_info')
      .upsert({ id: 1, ...siteInfo })
      .select();

    if (error) throw error;

    res.json({ message: 'Informations du site mises à jour avec succès', data: data[0] });
  } catch (error) {
    console.error('Erreur update site-info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gérer les services
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/services', upload.single('image'), async (req, res) => {
  try {
    const { title, description, icon, promotion_id, discount } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('services')
      .insert([{ title, description, icon, image, promotion_id, discount }])
      .select();

    if (error) throw error;
    res.json({ message: 'Service ajouté avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/services/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, promotion_id, discount } = req.body;
    let updates = { title, description, icon, promotion_id, discount };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'Service modifié avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gérer les projets
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, description, category, image }])
      .select();

    if (error) throw error;
    res.json({ message: 'Projet ajouté avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    let updates = { title, description, category };

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'Projet modifié avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gérer les promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/promotions', upload.single('banner_image'), async (req, res) => {
  try {
    const { name, description, start_date, end_date, active, animation_class, discount_text } = req.body;
    const banner_image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('promotions')
      .insert([{ name, description, start_date, end_date, active, animation_class, discount_text, banner_image }])
      .select();

    if (error) throw error;
    res.json({ message: 'Promotion ajoutée avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/promotions/:id', upload.single('banner_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, start_date, end_date, active, animation_class, discount_text } = req.body;
    let updates = { name, description, start_date, end_date, active, animation_class, discount_text };

    if (req.file) {
      updates.banner_image = `/uploads/${req.file.filename}`;
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'Promotion modifiée avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('promotions').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gérer les liens sociaux
app.post('/api/social-links', async (req, res) => {
  try {
    const { platform, url } = req.body;

    const { data, error } = await supabase
      .from('social_links')
      .insert([{ platform, url }])
      .select();

    if (error) throw error;
    res.json({ message: 'Lien social ajouté avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/social-links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url } = req.body;

    const { data, error } = await supabase
      .from('social_links')
      .update({ platform, url })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'Lien social modifié avec succès', data: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/social-links/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('social_links').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Lien social supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Envoyer un email de contact
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Configuration du transporteur nodemailer
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL || 'contact@rayz.com',
      subject: `Nouveau message de ${name} - Rayz.com`,
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

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email envoyé avec succès' });
  } catch (error) {
    console.error('Erreur envoi email:', error);
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

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Site principal: http://localhost:${PORT}`);
  console.log(`Administration: http://localhost:${PORT}/admin`);
});
