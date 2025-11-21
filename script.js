// Configuration
const API_BASE = '/api';

// Éléments DOM
const servicesGrid = document.getElementById('services-grid');
const projectsGrid = document.getElementById('projects-grid');
const contactForm = document.getElementById('contactForm');
const mobileToggle = document.getElementById('mobile-toggle');
const nav = document.getElementById('nav');

// Données globales
let siteData = {};

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
mobileToggle.addEventListener('click', function() {
    nav.classList.toggle('active');
});

// Charger toutes les données du site
async function loadSiteData() {
    try {
        const response = await fetch(`${API_BASE}/site-data`);
        const data = await response.json();
        
        siteData = data;
        
        updateSiteContent(data);
        loadServices(data.services);
        loadProjects(data.projects);
        
        console.log('✅ Données chargées avec succès');
    } catch (error) {
        console.error('❌ Erreur chargement données:', error);
        loadDefaultData();
    }
}

// Mettre à jour le contenu du site
function updateSiteContent(data) {
    const siteInfo = data.siteInfo || {};
    
    // Mettre à jour les informations de base
    if (siteInfo.company_name) {
        document.getElementById('site-name').textContent = siteInfo.company_name;
        document.getElementById('about-company-name').textContent = siteInfo.company_name;
        document.getElementById('footer-company-name').textContent = siteInfo.company_name;
        document.getElementById('copyright-company-name').textContent = siteInfo.company_name;
    }
    
    if (siteInfo.hero_title) {
        document.getElementById('hero-title').textContent = siteInfo.hero_title;
    }
    
    if (siteInfo.hero_description) {
        document.getElementById('hero-description').textContent = siteInfo.hero_description;
    }
    
    if (siteInfo.about_title) {
        document.getElementById('about-title').textContent = siteInfo.about_title;
    }
    
    if (siteInfo.about_description) {
        document.getElementById('about-description').textContent = siteInfo.about_description;
    }
    
    // Informations de contact
    if (siteInfo.address) {
        document.getElementById('contact-address').textContent = siteInfo.address;
        document.getElementById('footer-address').textContent = siteInfo.address;
    }
    
    if (siteInfo.phone) {
        document.getElementById('contact-phone').textContent = siteInfo.phone;
        document.getElementById('footer-phone').textContent = siteInfo.phone;
    }
    
    if (siteInfo.email) {
        document.getElementById('contact-email').textContent = siteInfo.email;
        document.getElementById('footer-email').textContent = siteInfo.email;
    }
    
    if (siteInfo.description) {
        document.getElementById('footer-description').textContent = siteInfo.description;
    }
    
    // Mettre à jour les liens WhatsApp
    updateWhatsAppLinks(siteInfo.phone);
}

// Mettre à jour les liens WhatsApp
function updateWhatsAppLinks(phone) {
    const phoneNumber = phone ? phone.replace(/\s/g, '') : '+33123456789';
    const companyName = siteData.siteInfo?.company_name || 'Rayz.com';
    
    const whatsappLinks = document.querySelectorAll('.btn-whatsapp, .btn-whatsapp-large');
    whatsappLinks.forEach(link => {
        link.href = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=Bonjour%20${encodeURIComponent(companyName)}%20je%20suis%20intéressé%20par%20vos%20services`;
    });
    
    // Mettre à jour les liens d'appel
    const callLinks = document.querySelectorAll('.btn-call, a[href^="tel:"]');
    callLinks.forEach(link => {
        link.href = `tel:${phoneNumber}`;
    });
}

// Charger les services
function loadServices(services) {
    if (!services || services.length === 0) {
        servicesGrid.innerHTML = '<p class="no-data">Aucun service disponible pour le moment.</p>';
        return;
    }
    
    servicesGrid.innerHTML = '';
    
    services.forEach((service, index) => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.style.animationDelay = `${index * 0.1}s`;
        
        serviceCard.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon || 'fas fa-cog'}"></i>
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
    
    const servicesToShow = services.slice(0, 5);
    servicesToShow.forEach(service => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#services">${service.title}</a>`;
        footerServices.appendChild(li);
    });
}

// Charger les projets
function loadProjects(projects) {
    if (!projects || projects.length === 0) {
        projectsGrid.innerHTML = '<p class="no-data">Aucun projet disponible pour le moment.</p>';
        return;
    }
    
    projectsGrid.innerHTML = '';
    
    projects.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-category', project.category || 'general');
        projectCard.style.animationDelay = `${index * 0.1}s`;
        
        const imageUrl = project.image_url || 'data:image/svg+xml,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDM1MCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjIwIiByeD0iMTAiIGZpbGw9IiNGNEY2RjgiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjIwMCIgcng9IjUiIGZpbGw9IiNFOUU3RUYiLz4KPGNpcmNsZSBjeD0iMTc1IiBjeT0iMTEwIiByPSI0MCIgZmlsbD0iIzAwOTZENiIvPgo8Y2lyY2xlIGN4PSIxNzUiIGN5PSIxMTAiIHI9IjE1IiBmaWxsPSIjRjhGQUZDIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjExMCIgcj0iOCIgZmlsbD0iIzAwOTZENiIvPgo8cmVjdCB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjMwIiB5PSIxNjAiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjRTlFN0VGIi8+Cjwvc3ZnPgo=';
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${imageUrl}" alt="${project.title}" loading="lazy">
                <div class="project-overlay">
                    <span class="btn btn-primary">Voir le projet</span>
                </div>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `;
        
        projectCard.addEventListener('click', () => {
            showProjectDetails(project);
        });
        
        projectsGrid.appendChild(projectCard);
    });
}

// Afficher les détails du projet
function showProjectDetails(project) {
    alert(`Projet: ${project.title}\n\n${project.description}`);
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
        
        if (emailResult.status === 200) {
            alert('✅ Message envoyé avec succès! Nous vous contacterons bientôt.');
            contactForm.reset();
        } else {
            throw new Error('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur envoi email:', error);
        alert('❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement par téléphone.');
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
        services: [
            {
                title: 'Surveillance Vidéo',
                description: 'Installation de systèmes de vidéosurveillance haute définition avec détection intelligente et vision nocturne.',
                icon: 'fas fa-video'
            },
            {
                title: 'Starlink',
                description: 'Installation professionnelle de systèmes Starlink pour une connectivité Internet haut débit partout.',
                icon: 'fas fa-satellite-dish'
            },
            {
                title: 'Systèmes d\'Alarme',
                description: 'Solutions d\'alarme complètes avec détection de mouvement, capteurs et notifications en temps réel.',
                icon: 'fas fa-shield-alt'
            }
        ],
        projects: []
    };
    
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
});
