// Configuration
const API_BASE = '/api';

// Éléments DOM
const promotionBanner = document.getElementById('promotion-banner');
const promotionText = document.getElementById('promotion-text');
const promotionClose = document.getElementById('promotion-close');
const maintenanceBanner = document.getElementById('maintenance-banner');
const maintenanceMessage = document.getElementById('maintenance-message');
const heroPromotion = document.getElementById('hero-promotion');
const specialPromotion = document.getElementById('special-promotion');
const servicesGrid = document.getElementById('services-grid');
const projectsGrid = document.getElementById('projects-grid');
const contactForm = document.getElementById('contactForm');
const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const loadingSpinner = document.getElementById('loading-spinner');

// Données globales
let siteData = {};
let activePromotions = [];

// Afficher/Masquer le loading
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobile-toggle');
const nav = document.getElementById('nav');

mobileToggle.addEventListener('click', function() {
    nav.classList.toggle('active');
});

// Fermer la bannière de promotion
promotionClose.addEventListener('click', function() {
    promotionBanner.style.display = 'none';
});

// Fermer la modal
modalClose.addEventListener('click', function() {
    projectModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Fermer la modal en cliquant à l'extérieur
window.addEventListener('click', function(e) {
    if (e.target === projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Charger toutes les données du site
async function loadSiteData() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/site-data`);
        const data = await response.json();
        
        siteData = data;
        activePromotions = data.promotions || [];
        
        updateSiteContent(data);
        updatePromotions(data.promotions);
        loadServices(data.services);
        loadProjects(data.projects);
        
        hideLoading();
    } catch (error) {
        console.error('Erreur chargement données:', error);
        hideLoading();
        // Charger les données par défaut en cas d'erreur
        loadDefaultData();
    }
}

// Mettre à jour le contenu du site
function updateSiteContent(data) {
    const siteInfo = data.siteInfo || {};
    
    // Mettre à jour les informations de base
    document.getElementById('site-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('hero-title').textContent = siteInfo.hero_title || 'Solutions de Sécurité Innovantes';
    document.getElementById('hero-description').textContent = siteInfo.hero_description || 'Rayz.com est votre partenaire de confiance pour l\'installation de systèmes de surveillance modernes, Starlink, alarmes et bien plus encore.';
    document.getElementById('about-title').textContent = siteInfo.about_title || 'À Propos de';
    document.getElementById('about-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('about-description').textContent = siteInfo.about_description || 'Fondée en 2018, Rayz.com est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes. Notre équipe d'experts est passionnée par la création d'environnements plus sûrs et mieux connectés.';
    
    // Informations de contact
    document.getElementById('contact-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, 75000 Paris';
    document.getElementById('contact-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
    document.getElementById('contact-email').textContent = siteInfo.email || 'contact@rayz.com';
    
    // Footer
    document.getElementById('footer-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('footer-description').textContent = siteInfo.description || 'Votre partenaire de confiance pour des solutions de sécurité innovantes et performantes.';
    document.getElementById('footer-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, Paris';
    document.getElementById('footer-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
    document.getElementById('footer-email').textContent = siteInfo.email || 'contact@rayz.com';
    document.getElementById('copyright-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    
    // Mettre à jour les liens sociaux
    updateSocialLinks(siteInfo);
    
    // Mode maintenance
    if (siteInfo.maintenance_mode) {
        maintenanceBanner.style.display = 'block';
        maintenanceMessage.textContent = siteInfo.maintenance_message || 'Le site est en maintenance. Veuillez revenir plus tard.';
    }
}

// Mettre à jour les liens sociaux
function updateSocialLinks(siteInfo) {
    const socialLinks = [
        { id: 'social-facebook', url: siteInfo.facebook },
        { id: 'footer-facebook', url: siteInfo.facebook },
        { id: 'social-twitter', url: siteInfo.twitter },
        { id: 'footer-twitter', url: siteInfo.twitter },
        { id: 'social-instagram', url: siteInfo.instagram },
        { id: 'footer-instagram', url: siteInfo.instagram },
        { id: 'social-linkedin', url: siteInfo.linkedin },
        { id: 'footer-linkedin', url: siteInfo.linkedin },
        { id: 'social-whatsapp', url: siteInfo.whatsapp }
    ];
    
    socialLinks.forEach(link => {
        const element = document.getElementById(link.id);
        if (element && link.url) {
            element.href = link.url;
        }
    });
    
    // Mettre à jour les liens WhatsApp avec le numéro de téléphone
    const whatsappLinks = document.querySelectorAll('.btn-whatsapp, .btn-whatsapp-large');
    const phone = siteInfo.phone ? siteInfo.phone.replace(/\s/g, '') : '+33123456789';
    
    whatsappLinks.forEach(link => {
        link.href = `https://api.whatsapp.com/send?phone=${phone}&text=Bonjour%20${encodeURIComponent(siteInfo.company_name || 'Rayz.com')}%20je%20suis%20intéressé%20par%20vos%20services`;
    });
    
    // Mettre à jour les liens d'appel
    const callLinks = document.querySelectorAll('.btn-call, a[href^="tel:"]');
    callLinks.forEach(link => {
        link.href = `tel:${phone}`;
    });
}

// Gérer les promotions
function updatePromotions(promotions) {
    if (!promotions || promotions.length === 0) return;
    
    const activePromotion = promotions[0]; // Prendre la première promotion active
    
    // Bannière de promotion
    promotionBanner.style.display = 'block';
    promotionText.textContent = activePromotion.title;
    
    // Promotion dans le hero
    if (activePromotion.animation_type === 'hero') {
        heroPromotion.style.display = 'block';
        document.getElementById('promotion-hero-title').textContent = activePromotion.title;
        document.getElementById('promotion-hero-description').textContent = activePromotion.description;
        
        // Timer de promotion
        startPromotionTimer(activePromotion.end_date);
    }
    
    // Section promotion spéciale
    if (activePromotion.animation_type === 'section') {
        specialPromotion.style.display = 'block';
        document.getElementById('promotion-section-title').textContent = activePromotion.title;
        document.getElementById('promotion-section-description').textContent = activePromotion.description;
    }
}

// Timer de promotion
function startPromotionTimer(endDate) {
    const countDownDate = new Date(endDate).getTime();
    
    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        
        if (distance < 0) {
            clearInterval(timer);
            heroPromotion.style.display = 'none';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Charger les services
function loadServices(services) {
    if (!services || services.length === 0) return;
    
    servicesGrid.innerHTML = '';
    
    services.forEach((service, index) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.style.animationDelay = `${index * 0.1}s`;
        
        const imageUrl = service.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGQUZDIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzAwOTZENiIvPgo8cmVjdCB4PSI1MCIgeT0iMTMwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwIiByeD0iNSIgZmlsbD0iI0U1RTdFRiIvPgo8L3N2Zz4K';
        
        serviceCard.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            ${service.promotion ? `<div class="service-promotion">${service.promotion_text || 'Promotion'}</div>` : ''}
        `;
        
        servicesGrid.appendChild(serviceCard);
    });
    
    // Mettre à jour les services dans le footer
    updateFooterServices(services);
}

// Mettre à jour les services dans le footer
function updateFooterServices(services) {
    const footerServices = document.getElementById('footer-services');
    if (!footerServices) return;
    
    footerServices.innerHTML = '';
    
    services.slice(0, 5).forEach(service => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#services">${service.title}</a>`;
        footerServices.appendChild(li);
    });
}

// Charger les projets
function loadProjects(projects) {
    if (!projects || projects.length === 0) return;
    
    projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-category', project.category);
        projectCard.setAttribute('data-project', project.id);
        projectCard.style.animationDelay = `${index * 0.1}s`;
        
        const imageUrl = project.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDM1MCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjIwIiByeD0iMTAiIGZpbGw9IiNGNEY2RjgiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjIwMCIgcng9IjUiIGZpbGw9IiNFOUU3RUYiLz4KPGNpcmNsZSBjeD0iMTc1IiBjeT0iMTEwIiByPSI0MCIgZmlsbD0iIzAwOTZENiIvPgo8Y2lyY2xlIGN4PSIxNzUiIGN5PSIxMTAiIHI9IjE1IiBmaWxsPSIjRjhGQUZDIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjExMCIgcj0iOCIgZmlsbD0iIzAwOTZENiIvPgo8cmVjdCB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjMwIiB5PSIxNjAiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjRTlFN0VGIi8+Cjwvc3ZnPgo=';
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${imageUrl}" alt="${project.title}" loading="lazy">
                <div class="project-overlay">
                    <a href="#" class="btn btn-primary">Voir le projet</a>
                </div>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `;
        
        projectCard.addEventListener('click', (e) => {
            e.preventDefault();
            openProjectModal(project);
        });
        
        projectsGrid.appendChild(projectCard);
    });
    
    // Initialiser le filtrage
    initProjectFiltering();
}

// Initialiser le filtrage des projets
function initProjectFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Ouvrir la modal du projet
function openProjectModal(project) {
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const projectDetailTitle = document.getElementById('projectDetailTitle');
    const projectDetailDescription = document.getElementById('projectDetailDescription');
    
    modalTitle.textContent = project.title;
    modalImage.src = project.image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSIzMDAiIHJ4PSIxMCIgZmlsbD0iI0U1RTdFRiIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyMDAiIHI9IjYwIiBmaWxsPSIjMDA5NkQ2Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIwMCIgcj0iMjUiIGZpbGw9IiNGNUY3RkEiLz4KPHJlY3QgeD0iMjUwIiB5PSIyNzAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAiIHJ4PSI1IiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjI3MCIgeT0iMjgwIiB3aWR0aD0iMjYwIiBoZWlnaHQ9IjEwIiByeD0iNSIgZmlsbD0iI0U1RTdFRiIvPgo8L3N2Zz4K';
    modalCaption.textContent = project.title;
    projectDetailTitle.textContent = project.title;
    projectDetailDescription.textContent = project.description;
    
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Gestion du formulaire de contact
contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
    };
    
    // Validation basique
    if (!formData.name || !formData.email || !formData.message) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    showLoading();
    
    try {
        // Envoyer l'email via EmailJS
        const emailResult = await emailjs.send('service_4ab2q68', 'template_m8zvkj9', {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            service: formData.service,
            message: formData.message,
            to_email: siteData.siteInfo?.email || 'contact@rayz.com'
        });
        
        // Sauvegarder dans la base de données
        const saveResult = await fetch(`${API_BASE}/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await saveResult.json();
        
        if (emailResult.status === 200 && result.success) {
            alert('✅ Message envoyé avec succès! Nous vous contacterons bientôt.');
            contactForm.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur envoi email:', error);
        alert('❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.');
    } finally {
        hideLoading();
    }
});

// Navigation fluide
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Fermer le menu mobile si ouvert
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        }
    });
});

// Charger les données par défaut en cas d'erreur
function loadDefaultData() {
    const defaultData = {
        siteInfo: {
            company_name: 'Rayz.com',
            description: 'Votre partenaire de confiance pour des solutions de sécurité innovantes',
            address: '123 Avenue de la Sécurité, 75000 Paris',
            phone: '+33 1 23 45 67 89',
            email: 'contact@rayz.com'
        },
        services: [
            {
                title: 'Surveillance Vidéo',
                description: 'Installation de systèmes de vidéosurveillance haute définition avec détection intelligente.',
                icon: 'fas fa-video'
            }
        ],
        projects: [],
        promotions: []
    };
    
    updateSiteContent(defaultData);
    loadServices(defaultData.services);
    loadProjects(defaultData.projects);
}

// Animation au défilement
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .project-card, .stat');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadSiteData();
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Vérifier les promotions toutes les minutes
    setInterval(() => {
        if (activePromotions.length > 0) {
            updatePromotions(activePromotions);
        }
    }, 60000);
});
