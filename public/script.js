// Configuration
const API_BASE = '/api';

// Éléments DOM
const promotionBanner = document.getElementById('promotion-banner');
const promotionText = document.getElementById('promotion-text');
const promotionBadge = document.getElementById('promotion-badge');
const promotionClose = document.getElementById('promotion-close');
const specialPromotion = document.getElementById('special-promotion');
const promotionTitle = document.getElementById('promotion-title');
const promotionDesc = document.getElementById('promotion-desc');
const promotionTimer = document.getElementById('promotion-timer');
const promotionBannerImg = document.getElementById('promotion-banner-img');
const maintenanceBanner = document.getElementById('maintenance-banner');
const maintenanceMessage = document.getElementById('maintenance-message');
const projectsGrid = document.getElementById('projects-grid');
const servicesGrid = document.getElementById('services-grid');
const contactForm = document.getElementById('contactForm');
const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');
const whatsappBtn = document.getElementById('whatsapp-btn');

// Variables globales
let siteData = {};
let activePromotion = null;
let promotionInterval = null;

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
    localStorage.setItem('promotionClosed', 'true');
});

// Charger les données du site
async function loadSiteData() {
    try {
        const response = await fetch(`${API_BASE}/site-data`);
        siteData = await response.json();
        
        updateSiteContent();
        setupPromotions();
        loadServices();
        loadProjects();
        setupSocialLinks();
        setupWhatsApp();
        
        // Animer les éléments après chargement
        setTimeout(() => {
            animateOnScroll();
        }, 500);
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

// Mettre à jour le contenu du site
function updateSiteContent() {
    const { siteInfo, promotions, socialLinks } = siteData;
    
    // Maintenance mode
    if (siteInfo.maintenance_mode) {
        maintenanceBanner.style.display = 'block';
        maintenanceMessage.textContent = siteInfo.maintenance_message || 'Le site est en maintenance. Veuillez revenir plus tard.';
    }
    
    // Informations générales
    document.getElementById('site-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('hero-title').textContent = siteInfo.hero_title || 'Solutions de Sécurité Innovantes';
    document.getElementById('hero-description').textContent = siteInfo.hero_description || 'Rayz.com est votre partenaire de confiance pour l\'installation de systèmes de surveillance modernes, Starlink, alarmes et bien plus encore.';
    document.getElementById('about-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('about-description').textContent = siteInfo.about_description || 'Fondée en 2018, Rayz.com est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes. Notre équipe d'experts est passionnée par la création d'environnements plus sûrs et mieux connectés.';
    document.getElementById('contact-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, 75000 Paris';
    document.getElementById('contact-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
    document.getElementById('contact-email').textContent = siteInfo.email || 'contact@rayz.com';
    document.getElementById('footer-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    document.getElementById('footer-description').textContent = siteInfo.footer_description || 'Votre partenaire de confiance pour des solutions de sécurité innovantes et performantes.';
    document.getElementById('footer-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, Paris';
    document.getElementById('footer-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
    document.getElementById('footer-email').textContent = siteInfo.email || 'contact@rayz.com';
    document.getElementById('copyright-company-name').textContent = siteInfo.company_name || 'Rayz.com';
    
    // Logo
    if (siteInfo.logo_url) {
        const logo = document.getElementById('site-logo');
        logo.src = siteInfo.logo_url;
        logo.style.display = 'block';
    }
    
    // Image hero
    if (siteInfo.hero_image) {
        const heroImage = document.getElementById('hero-image');
        heroImage.src = siteInfo.hero_image;
        heroImage.style.display = 'block';
    }
    
    // Image about
    if (siteInfo.about_image) {
        const aboutImage = document.getElementById('about-image');
        aboutImage.src = siteInfo.about_image;
        aboutImage.style.display = 'block';
    }
}

// Configurer les promotions
function setupPromotions() {
    const { promotions } = siteData;
    
    if (!promotions || promotions.length === 0) return;
    
    // Trouver la promotion active la plus récente
    const now = new Date();
    activePromotion = promotions.find(promo => {
        const startDate = new Date(promo.start_date);
        const endDate = new Date(promo.end_date);
        return promo.active && now >= startDate && now <= endDate;
    });
    
    if (activePromotion) {
        setupPromotionBanner();
        setupSpecialPromotion();
        
        // Vérifier si l'utilisateur a déjà fermé la bannière
        const promotionClosed = localStorage.getItem('promotionClosed');
        if (!promotionClosed) {
            promotionBanner.style.display = 'block';
        }
    }
}

// Configurer la bannière de promotion
function setupPromotionBanner() {
    if (!activePromotion) return;
    
    promotionText.textContent = activePromotion.description;
    promotionBadge.textContent = activePromotion.name;
    
    // Appliquer la classe d'animation si spécifiée
    if (activePromotion.animation_class) {
        promotionBanner.classList.add(activePromotion.animation_class);
    }
}

// Configurer la promotion spéciale
function setupSpecialPromotion() {
    if (!activePromotion || !activePromotion.banner_image) return;
    
    specialPromotion.style.display = 'block';
    promotionTitle.textContent = activePromotion.name;
    promotionDesc.textContent = activePromotion.description;
    promotionBannerImg.src = activePromotion.banner_image;
    
    // Appliquer la classe d'animation
    if (activePromotion.animation_class) {
        specialPromotion.classList.add(activePromotion.animation_class);
    }
    
    // Configurer le compte à rebours
    setupPromotionTimer();
}

// Configurer le compte à rebours de la promotion
function setupPromotionTimer() {
    if (!activePromotion) return;
    
    const endDate = new Date(activePromotion.end_date);
    
    function updateTimer() {
        const now = new Date();
        const timeLeft = endDate - now;
        
        if (timeLeft <= 0) {
            promotionTimer.innerHTML = '<div class="timer-item"><span class="timer-number">00</span><span class="timer-label">Jours</span></div>';
            clearInterval(promotionInterval);
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        promotionTimer.innerHTML = `
            <div class="timer-item">
                <span class="timer-number">${days.toString().padStart(2, '0')}</span>
                <span class="timer-label">Jours</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${hours.toString().padStart(2, '0')}</span>
                <span class="timer-label">Heures</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${minutes.toString().padStart(2, '0')}</span>
                <span class="timer-label">Minutes</span>
            </div>
            <div class="timer-item">
                <span class="timer-number">${seconds.toString().padStart(2, '0')}</span>
                <span class="timer-label">Secondes</span>
            </div>
        `;
    }
    
    updateTimer();
    promotionInterval = setInterval(updateTimer, 1000);
}

// Charger les services
function loadServices() {
    const { services } = siteData;
    const servicesGrid = document.getElementById('services-grid');
    const serviceSelect = document.getElementById('service');
    const footerServices = document.getElementById('footer-services');
    
    servicesGrid.innerHTML = '';
    footerServices.innerHTML = '';
    
    if (serviceSelect) {
        // Garder l'option par défaut et vider le reste
        while (serviceSelect.children.length > 1) {
            serviceSelect.removeChild(serviceSelect.lastChild);
        }
    }
    
    services.forEach(service => {
        // Carte de service
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <div class="service-icon">
                <i class="${service.icon || 'fas fa-cog'}"></i>
            </div>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            ${service.discount ? `<div class="service-discount">${service.discount}</div>` : ''}
        `;
        servicesGrid.appendChild(serviceCard);
        
        // Option du select
        if (serviceSelect) {
            const option = document.createElement('option');
            option.value = service.title;
            option.textContent = service.title;
            serviceSelect.appendChild(option);
        }
        
        // Liens du footer
        const serviceLink = document.createElement('li');
        serviceLink.innerHTML = `<a href="#services">${service.title}</a>`;
        footerServices.appendChild(serviceLink);
    });
    
    animateServices();
}

// Charger les projets
function loadProjects() {
    const { projects } = siteData;
    const projectsGrid = document.getElementById('projects-grid');
    
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.setAttribute('data-category', project.category);
        projectCard.setAttribute('data-project', project.id);
        
        const imageSrc = project.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDM1MCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjIwIiByeD0iMTAiIGZpbGw9IiNGNEY2RjgiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjIwMCIgcng9IjUiIGZpbGw9IiNFOUU3RUYiLz4KPGNpcmNsZSBjeD0iMTc1IiBjeT0iMTEwIiByPSI0MCIgZmlsbD0iIzAwOTZENiIvPgo8Y2lyY2xlIGN4PSIxNzUiIGN5PSIxMTAiIHI9IjE1IiBmaWxsPSIjRjhGQUZDIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjExMCIgcj0iOCIgZmlsbD0iIzAwOTZENiIvPgo8cmVjdCB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjMwIiB5PSIxNjAiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjRTlFN0VGIi8+Cjwvc3ZnPgo=';
        
        projectCard.innerHTML = `
            <div class="project-image">
                <img src="${imageSrc}" alt="${project.title}" loading="lazy">
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
    
    animateProjects();
}

// Configurer les liens sociaux
function setupSocialLinks() {
    const { socialLinks } = siteData;
    const socialLinksContainer = document.getElementById('social-links');
    const footerSocialLinks = document.getElementById('footer-social-links');
    
    socialLinksContainer.innerHTML = '';
    footerSocialLinks.innerHTML = '';
    
    const socialIcons = {
        'facebook': 'fab fa-facebook-f',
        'twitter': 'fab fa-twitter',
        'instagram': 'fab fa-instagram',
        'linkedin': 'fab fa-linkedin-in',
        'youtube': 'fab fa-youtube',
        'whatsapp': 'fab fa-whatsapp'
    };
    
    socialLinks.forEach(link => {
        const iconClass = socialIcons[link.platform] || 'fas fa-link';
        
        const socialLink = document.createElement('a');
        socialLink.href = link.url;
        socialLink.target = '_blank';
        socialLink.className = 'social-link';
        socialLink.innerHTML = `<i class="${iconClass}"></i>`;
        
        socialLinksContainer.appendChild(socialLink.cloneNode(true));
        footerSocialLinks.appendChild(socialLink);
    });
}

// Configurer WhatsApp
function setupWhatsApp() {
    const { siteInfo } = siteData;
    
    if (siteInfo.whatsapp_number) {
        whatsappBtn.style.display = 'flex';
        whatsappBtn.href = `https://wa.me/${siteInfo.whatsapp_number}?text=Bonjour, je suis intéressé par vos services de sécurité.`;
    }
}

// Ouvrir la modal du projet
function openProjectModal(project) {
    const modalTitle = document.getElementById('modalTitle');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const projectDetailTitle = document.getElementById('projectDetailTitle');
    const projectDetailDescription = document.getElementById('projectDetailDescription');
    
    modalTitle.textContent = project.title;
    modalImage.src = project.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjcwMCIgaGVpZ2h0PSIzMDAiIHJ4PSIxMCIgZmlsbD0iI0U1RTdFRiIvPgo8Y2lyY2xlIGN4PSI0MDAiIGN5PSIyMDAiIHI9IjYwIiBmaWxsPSIjMDA5NkQ2Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIwMCIgcj0iMjUiIGZpbGw9IiNGNUY3RkEiLz4KPHJlY3QgeD0iMjUwIiB5PSIyNzAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAiIHJ4PSI1IiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjI3MCIgeT0iMjgwIiB3aWR0aD0iMjYwIiBoZWlnaHQ9IjEwIiByeD0iNSIgZmlsbD0iI0U1RTdFRiIvPgo8L3N2Zz4K';
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

// Filter projects
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

// Animer les services
function animateServices() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
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
        const response = await fetch(`${API_BASE}/send-email`, {
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
            throw new Error(result.error || 'Erreur lors de l\'envoi du message');
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

// Hero Carousel simple
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadSiteData();
    
    window.addEventListener('scroll', animateOnScroll);
    
    // Déclencher une fois au chargement
    setTimeout(() => {
        animateOnScroll();
    }, 1000);
});

// Nettoyer l'intervalle de promotion quand la page se ferme
window.addEventListener('beforeunload', function() {
    if (promotionInterval) {
        clearInterval(promotionInterval);
    }
});
