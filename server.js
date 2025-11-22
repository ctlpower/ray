import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import nodemailer from 'nodemailer';
import multer from 'multer';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-super-securise';

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes dans .env');
  process.exit(1);
}

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
    fileSize: 10 * 1024 * 1024
  }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Routes API Publiques

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur Rayz.com fonctionnel',
    timestamp: new Date().toISOString()
  });
});

// Récupérer les données du site (avec fallbacks)
app.get('/api/site-data', async (req, res) => {
  try {
    let siteInfo, services, projects, promotions, socialLinks;

    // Données par défaut
    const defaultData = {
      siteInfo: {
        company_name: "RAY-Z ENTREPRISE SARL",
        hero_title: "Solutions de Sécurité Innovantes",
        hero_description: "Votre partenaire de confiance pour l'installation de systèmes de surveillance modernes, Starlink, alarmes et solutions de sécurité complètes.",
        about_title: "À Propos de RAY-Z ENTREPRISE",
        about_description: "Fondée en 2018 et située à Douala Logpom, RAY-Z ENTREPRISE SARL est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes. Notre équipe d'experts certifiés est passionnée par la création d'environnements plus sûrs et mieux connectés.",
        company_history: "Notre histoire commence par une vision simple : rendre la sécurité accessible à tous. Aujourd'hui, nous avons réalisé plus de 500 projets et maintenons un taux de satisfaction client de 98%.",
        address: "Douala Logpom, Cameroun",
        phone: "+237 6XX XXX XXX",
        email: "contact@rayz.com",
        whatsapp_number: "2376XXXXXX",
        location_map: "https://maps.google.com/?q=Douala+Logpom"
      },
      services: [
        {
          id: 1,
          title: "Surveillance Vidéo HD",
          description: "Systèmes de vidéosurveillance 4K avec détection intelligente, vision nocturne et stockage cloud.",
          icon: "fas fa-video",
          image: "/assets/default-service-1.jpg"
        },
        {
          id: 2,
          title: "Installation Starlink",
          description: "Connectivité Internet haut débit par satellite pour particuliers et entreprises.",
          icon: "fas fa-satellite-dish",
          image: "/assets/default-service-2.jpg"
        },
        {
          id: 3,
          title: "Systèmes d'Alarme",
          description: "Solutions d'alarme complètes avec détection de mouvement et notifications en temps réel.",
          icon: "fas fa-shield-alt",
          image: "/assets/default-service-3.jpg"
        }
      ],
      projects: [
        {
          id: 1,
          title: "Surveillance Résidentielle Premium",
          description: "Installation complète pour une villa avec 12 caméras 4K et système de monitoring 24/7.",
          category: "surveillance",
          image: "/assets/default-project-1.jpg"
        }
      ],
      promotions: [],
      socialLinks: [
        { platform: "facebook", url: "https://facebook.com/rayz" },
        { platform: "whatsapp", url: "https://wa.me/2376XXXXXX" }
      ]
    };

    try {
      // Essayer de récupérer les données de Supabase
      const [siteInfoRes, servicesRes, projectsRes, promotionsRes, socialLinksRes] = await Promise.allSettled([
        supabase.from('site_info').select('*').single(),
        supabase.from('services').select('*').order('order_index'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('promotions').select('*').eq('active', true).order('start_date', { ascending: false }),
        supabase.from('social_links').select('*')
      ]);

      siteInfo = siteInfoRes.status === 'fulfilled' && siteInfoRes.value.data ? siteInfoRes.value.data : defaultData.siteInfo;
      services = servicesRes.status === 'fulfilled' && servicesRes.value.data ? servicesRes.value.data : defaultData.services;
      projects = projectsRes.status === 'fulfilled' && projectsRes.value.data ? projectsRes.value.data : defaultData.projects;
      promotions = promotionsRes.status === 'fulfilled' && promotionsRes.value.data ? promotionsRes.value.data : defaultData.promotions;
      socialLinks = socialLinksRes.status === 'fulfilled' && socialLinksRes.value.data ? socialLinksRes.value.data : defaultData.socialLinks;

    } catch (dbError) {
      console.log('Utilisation des données par défaut');
      siteInfo = defaultData.siteInfo;
      services = defaultData.services;
      projects = defaultData.projects;
      promotions = defaultData.promotions;
      socialLinks = defaultData.socialLinks;
    }

    res.json({
      siteInfo,
      services,
      projects,
      promotions,
      socialLinks
    });

  } catch (error) {
    console.error('❌ Erreur API site-data:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
});

// Envoyer un email de contact avec EmailJS
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Configuration EmailJS
    const emailjsData = {
      service_id: 'service_4ab2q68',
      template_id: 'template_m8zvkj9',
      user_id: '4gEzT9DkXPjvp2WxD',
      template_params: {
        from_name: name,
        from_email: email,
        phone: phone || 'Non fourni',
        service: service || 'Non spécifié',
        message: message,
        to_email: 'contact@rayz.com'
      }
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailjsData)
    });

    if (response.ok) {
      res.json({ message: 'Email envoyé avec succès' });
    } else {
      throw new Error('Erreur EmailJS: ' + response.statusText);
    }
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    
    // Fallback: Envoyer un email simple via Nodemailer
    try {
      const transporter = nodemailer.createTransporter({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
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
      res.json({ message: 'Email envoyé avec succès (fallback)' });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: fallbackError.message 
      });
    }
  }
});

// Routes API Administrateur (Sécurisées)

// Connexion administrateur
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Vérifier les identifiants
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'rayz2024';
    
    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign(
        { username: username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Connexion réussie',
        token: token,
        user: { username: username, role: 'admin' }
      });
    } else {
      res.status(401).json({ error: 'Identifiants incorrects' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes admin sécurisées
app.use('/api/admin/*', authenticateToken);

// Mettre à jour les informations du site
app.post('/api/admin/update-site-info', async (req, res) => {
  try {
    const { siteInfo } = req.body;

    const { data, error } = await supabase
      .from('site_info')
      .upsert({ id: 1, ...siteInfo })
      .select();

    if (error) throw error;

    res.json({ 
      message: 'Informations du site mises à jour avec succès', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gérer les services
app.get('/api/admin/services', async (req, res) => {
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

app.post('/api/admin/services', upload.single('image'), async (req, res) => {
  try {
    const { title, description, icon, promotion_id, discount, featured } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('services')
      .insert([{ 
        title, 
        description, 
        icon, 
        image, 
        promotion_id: promotion_id || null, 
        discount: discount || null,
        featured: featured === 'true'
      }])
      .select();

    if (error) throw error;
    
    res.json({ 
      message: 'Service ajouté avec succès', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gérer les projets
app.post('/api/admin/projects', upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, client, location } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, description, category, image, client, location }])
      .select();

    if (error) throw error;
    
    res.json({ 
      message: 'Projet ajouté avec succès', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gérer les promotions
app.post('/api/admin/promotions', upload.single('banner_image'), async (req, res) => {
  try {
    const { name, description, start_date, end_date, active, animation_class, discount_text, custom_css, featured_services } = req.body;
    const banner_image = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('promotions')
      .insert([{ 
        name, 
        description, 
        start_date, 
        end_date, 
        active: active === 'true', 
        animation_class, 
        discount_text, 
        banner_image,
        custom_css,
        featured_services
      }])
      .select();

    if (error) throw error;
    
    res.json({ 
      message: 'Promotion ajoutée avec succès', 
      data: data[0] 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes pour les pages

// Route pour la page d'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// Route pour la page principale
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs 404 pour les routes API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route API non trouvée' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('🚀 Serveur Rayz.com démarré');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Site: http://localhost:${PORT}`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log(`🔍 API Health: http://localhost:${PORT}/api/health`);
  
  // Vérification des variables d'environnement
  console.log('\n🔧 Configuration:');
  console.log(`✅ Supabase URL: ${supabaseUrl ? 'Configuré' : 'Manquant'}`);
  console.log(`✅ Supabase Key: ${supabaseKey ? 'Configuré' : 'Manquant'}`);
  console.log(`✅ JWT Secret: ${JWT_SECRET ? 'Configuré' : 'Manquant'}`);
});
