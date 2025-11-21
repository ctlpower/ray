// Configuration
const API_BASE = '/api';
let siteData = {};

// Éléments DOM
const promotionBanner = document.getElementById('promotion-banner');
const promotionText = document.getElementById('promotion-text');
const promotionIcon = document.getElementById('promotion-icon');
const promotionClose = document.getElementById('promotion-close');
const maintenanceBanner = document.getElementById('maintenance-banner');
const maintenanceMessage = document.getElementById('maintenance-message');
const heroCarousel = document.getElementById('hero-carousel');
const carouselIndicators = document.getElementById('carousel-indicators');
const servicesGrid = document.getElementById('services-grid');
const promotionsGrid = document.getElementById('promotions-grid');
const projectsGrid = document.getElementById('projects-grid');
const contactForm = document.getElementById('contactForm');
const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const whatsappBtn = document.getElementById('whatsapp-btn');

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

// Charger les données du site
async function loadSiteData() {
    try {
        const response = await fetch(`${API_BASE}/site-data`);
        siteData = await response.json();
        
        updateSiteContent();
        setupPromotions();
        setupHeroCarousel();
        loadServices();
        loadPromotions();
        loadProjects();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

// Mettre à jour le contenu du site
function updateSiteContent() {
    const { siteInfo } = siteData;
    
    if (!siteInfo) return;

    // Mettre à jour les informations du site
    document.getElementById('site-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('hero-title').textContent = siteInfo.hero_title || 'Solutions de Sécurité Innovantes';
    document.getElementById('hero-description').textContent = siteInfo.hero_description || 'Rayz.com est votre partenaire de confiance pour l\'installation de systèmes de surveillance modernes, Starlink, alarmes et bien plus encore.';
    document.getElementById('about-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('about-description').textContent = siteInfo.about_description || 'Fondée en 2018, Rayz.com est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes. Notre équipe d\'experts est passionnée par la création d\'environnements plus sûrs et mieux connectés.';
    document.getElementById('contact-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, 75000 Paris';
    document.getElementById('contact-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
    document.getElementById('contact-email').textContent = siteInfo.email || 'contact@rayz.com';
    document.getElementById('footer-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('footer-description').textContent = siteInfo.footer_description || 'Votre partenaire de confiance pour des solutions de sécurité innovantes et performantes.';
    document.getElementById('footer-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, Paris';
    document.getElementById('footer-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
    document.getElementById('footer-email').textContent = siteInfo.email || 'contact@rayz.com';
    document.getElementById('copyright-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    
    // Mettre à jour le logo
    if (siteInfo.logo_url) {
        document.getElementById('site-logo').src = siteInfo.logo_url;
    }
    
    // Mettre à jour l'image about
    if (siteInfo.about_image_url) {
        document.getElementById('about-image').src = siteInfo.about_image_url;
    }
    
    // Mettre à jour les liens sociaux
    if (siteInfo.facebook_url) {
        document.getElementById('social-facebook').href = siteInfo.facebook_url;
        document.getElementById('footer-facebook').href = siteInfo.facebook_url;
    }
    if (siteInfo.twitter_url) {
        document.getElementById('social-twitter').href = siteInfo.twitter_url;
        document.getElementById('footer-twitter').href = siteInfo.twitter_url;
    }
    if (siteInfo.instagram_url) {
        document.getElementById('social-instagram').href = siteInfo.instagram_url;
        document.getElementById('footer-instagram').href = siteInfo.instagram_url;
    }
    if (siteInfo.linkedin_url) {
        document.getElementById('social-linkedin').href = siteInfo.linkedin_url;
        document.getElementById('footer-linkedin').href = siteInfo.linkedin_url;
    }
    if (siteInfo.whatsapp_url) {
        document.getElementById('social-whatsapp').href = siteInfo.whatsapp_url;
        document.getElementById('whatsapp-btn').href = siteInfo.whatsapp_url;
        document.getElementById('whatsapp-btn').style.display = 'flex';
    }
    
    // Gérer le mode maintenance
    if (siteInfo.maintenance_mode) {
        maintenanceBanner.style.display = 'block';
        maintenanceMessage.textContent = siteInfo.maintenance_message || 'Le site est en maintenance. Veuillez revenir plus tard.';
    }
}

// Configurer les promotions
function setupPromotions() {
    const { promotions } = siteData;
    
    if (!promotions || promotions.length === 0) return;
    
    const currentPromotion = promotions[0]; // Prendre la première promotion active
    
    if (currentPromotion) {
        promotionBanner.style.display = 'block';
        promotionText.textContent = currentPromotion.title;
        
        // Changer l'icône selon le type de promotion
        switch(currentPromotion.type) {
            case 'christmas':
                promotionIcon.textContent = '🎄';
                promotionBanner.style.background = 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)';
                break;
            case 'black_friday':
                promotionIcon.textContent = '🛍️';
                promotionBanner.style.background = 'linear-gradient(135deg, #000 0%, #333 100%)';
                break;
            case 'womens_day':
                promotionIcon.textContent = '🌸';
                promotionBanner.style.background = 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)';
                break;
            case 'national_day':
                promotionIcon.textContent = '🇨🇲';
                promotionBanner.style.background = 'linear-gradient(135deg, #007a5e 0%, #ce1126 50%, #fcd116 100%)';
                break;
            default:
                promotionIcon.textContent = '🎉';
        }
    }
}

// Configurer le carousel hero
function setupHeroCarousel() {
    const { banners } = siteData;
    
    if (!banners || banners.length === 0) {
        // Bannière par défaut
        heroCarousel.innerHTML = `
            <div class="carousel-slide active">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjMDA5NkQ2Ii8+CjxjaXJjbGUgY3g9IjYwMCIgY3k9IjQwMCIgcj0iMTUwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xIi8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iODAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjA1Ii8+CjxjaXJjbGUgY3g9IjkwMCIgY3k9IjYwMCIgcj0iMTAwIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4wNyIvPgo8cmVjdCB4PSI0MDAiIHk9IjMwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjEiIHJ4PSIyMCIvPgo8L3N2Zz4K" alt="Rayz.com Sécurité">
            </div>
        `;
        return;
    }
    
    heroCarousel.innerHTML = '';
    carouselIndicators.innerHTML = '';
    
    banners.forEach((banner, index) => {
        const slide = document.createElement('div');
        slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `<img src="${banner.image}" alt="${banner.title}">`;
        heroCarousel.appendChild(slide);
        
        const indicator = document.createElement('div');
        indicator.className = `carousel-indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('data-slide', index);
        carouselIndicators.appendChild(indicator);
    });
    
    // Configurer le carousel automatique
    startCarousel();
}

// Démarrer le carousel automatique
function startCarousel() {
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const carouselIndicators = document.querySelectorAll('.carousel-indicator');
    let currentSlide = 0;
    
    function showSlide(index) {
        carouselSlides.forEach(slide => slide.classList.remove('active'));
        carouselIndicators.forEach(indicator => indicator.classList.remove('active'));
        
        carouselSlides[index].classList.add('active');
        carouselIndicators[index].classList.add('active');
        currentSlide = index;
    }
    
    carouselIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // Auto-advance carousel
    setInterval(() => {
        let nextSlide = (currentSlide + 1) % carouselSlides.length;
        showSlide(nextSlide);
    }, 5000);
}

// Charger les services
function loadServices() {
    const { services } = siteData;
    
    if (!services || services.length === 0) return;
    
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            ${service.discount ? `<div class="service-price">
                <span class="service-discount">-${service.discount}%</span>
            </div>` : ''}
        `;
        servicesGrid.appendChild(serviceCard);
    });
    
    // Mettre à jour les services dans le footer
    updateFooterServices();
    
    // Animer les services
    animateServices();
}

// Mettre à jour les services dans le footer
function updateFooterServices() {
    const { services } = siteData;
    const footerServices = document.getElementById('footer-services');
    
    if (!services || !footerServices) return;
    
    footerServices.innerHTML = '';
    
    services.slice(0, 5).forEach(service => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#services">${service.title}</a>`;
        footerServices.appendChild(li);
    });
}

// Charger les promotions
function loadPromotions() {
    const { promotions } = siteData;
    
    if (!promotions || promotions.length === 0) return;
    
    promotionsGrid.innerHTML = '';
    
    promotions.forEach(promotion => {
        const promotionCard = document.createElement('div');
        promotionCard.className = 'promotion-card';
        
        const startDate = new Date(promotion.start_date).toLocaleDateString('fr-FR');
        const endDate = new Date(promotion.end_date).toLocaleDateString('fr-FR');
        
        promotionCard.innerHTML = `
            <div class="promotion-image">
                <img src="${promotion.image}" alt="${promotion.title}">
                <div class="promotion-badge">-${promotion.discount}%</div>
            </div>
            <div class="promotion-content">
                <h3>${promotion.title}</h3>
                <p>${promotion.description}</p>
                <div class="promotion-dates">
                    <span>Du ${startDate}</span>
                    <span>Au ${endDate}</span>
                </div>
            </div>
        `;
        
        promotionsGrid.appendChild(promotionCard);
    });
    
    // Animer les promotions
    animatePromotions();
}

// Charger les projets
function loadProjects() {
    const { projects } = siteData;
    
    if (!projects || projects.length === 0) return;
    
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-category', project.category);
        projectCard.setAttribute('data-project', project.id);
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
                <div class="project-overlay">
                    <a href="#" class="btn btn-primary">Voir le projet</a>
                </div>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
            </div>
        `;
        
        projectCard.addEventListener('click', () => {
            openProjectModal(project);
        });
        
        projectsGrid.appendChild(projectCard);
    });
    
    // Animer les projets
    animateProjects();
}

// Filtrer les projets
function setupProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
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
    modalImage.src = project.image;
    modalCaption.textContent = project.title;
    projectDetailTitle.textContent = project.title;
    projectDetailDescription.textContent = project.description;
    
    projectModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

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

// Animer les services
function animateServices() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}

// Animer les promotions
function animatePromotions() {
    const promotionCards = document.querySelectorAll('.promotion-card');
    promotionCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.2}s`;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}

// Animer les projets
function animateProjects() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });
}

// Animer les éléments au défilement
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .project-card, .promotion-card, .stat');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
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
    
    try {
        const response = await fetch(`${API_BASE}/send-contact-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Merci pour votre message! Nous vous contacterons bientôt.');
            contactForm.reset();
        } else {
            alert('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        alert('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadSiteData();
    setupProjectFilters();
    
    window.addEventListener('scroll', animateOnScroll);
    // Déclencher une fois au chargement
    setTimeout(animateOnScroll, 500);
});
