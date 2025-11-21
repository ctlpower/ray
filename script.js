// Configuration
const API_BASE = '/api';

// Éléments DOM
const maintenanceBanner = document.getElementById('maintenance-banner');
const maintenanceMessage = document.getElementById('maintenance-message');
const projectsGrid = document.getElementById('projects-grid');
const servicesGrid = document.getElementById('services-grid');
const contactForm = document.getElementById('contactForm');
const projectModal = document.getElementById('projectModal');
const modalClose = document.getElementById('modalClose');

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

// Hero Carousel
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

// Project Modal
modalClose.addEventListener('click', function() {
    projectModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === projectModal) {
        projectModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Charger les données du site
async function loadSiteData() {
    try {
        const response = await fetch(`${API_BASE}/site-info`);
        const siteInfo = await response.json();
        
        if (siteInfo.maintenance_mode) {
            maintenanceBanner.style.display = 'block';
            maintenanceMessage.textContent = siteInfo.maintenance_message || 'Le site est en maintenance. Veuillez revenir plus tard.';
        }
        
        // Mettre à jour les informations du site
        document.getElementById('site-name').textContent = siteInfo.company_name || 'Rayz.com';
        document.getElementById('hero-description').textContent = siteInfo.description || 'Rayz.com est votre partenaire de confiance pour l\'installation de systèmes de surveillance modernes, Starlink, alarmes et bien plus encore.';
        document.getElementById('about-company-name').textContent = siteInfo.company_name || 'Rayz.com';
        document.getElementById('about-description').textContent = siteInfo.description || 'Fondée en 2018, Rayz.com est devenue un leader dans le domaine des solutions de sécurité et de connectivité innovantes. Notre équipe d\'experts est passionnée par la création d\'environnements plus sûrs et mieux connectés.';
        document.getElementById('contact-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, 75000 Paris';
        document.getElementById('contact-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
        document.getElementById('contact-email').textContent = siteInfo.email || 'contact@rayz.com';
        document.getElementById('footer-company-name').textContent = siteInfo.company_name || 'Rayz.com';
        document.getElementById('footer-description').textContent = siteInfo.description || 'Votre partenaire de confiance pour des solutions de sécurité innovantes et performantes.';
        document.getElementById('footer-address').textContent = siteInfo.address || '123 Avenue de la Sécurité, Paris';
        document.getElementById('footer-phone').textContent = siteInfo.phone || '+33 1 23 45 67 89';
        document.getElementById('footer-email').textContent = siteInfo.email || 'contact@rayz.com';
        document.getElementById('copyright-company-name').textContent = siteInfo.company_name || 'Rayz.com';
        
        // Mettre à jour les liens sociaux
        if (siteInfo.facebook) {
            document.getElementById('social-facebook').href = siteInfo.facebook;
            document.getElementById('footer-facebook').href = siteInfo.facebook;
        }
        if (siteInfo.twitter) {
            document.getElementById('social-twitter').href = siteInfo.twitter;
            document.getElementById('footer-twitter').href = siteInfo.twitter;
        }
        if (siteInfo.instagram) {
            document.getElementById('social-instagram').href = siteInfo.instagram;
            document.getElementById('footer-instagram').href = siteInfo.instagram;
        }
        if (siteInfo.linkedin) {
            document.getElementById('social-linkedin').href = siteInfo.linkedin;
            document.getElementById('footer-linkedin').href = siteInfo.linkedin;
        }
        if (siteInfo.whatsapp) {
            document.getElementById('social-whatsapp').href = siteInfo.whatsapp;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données du site:', error);
    }
}

// Charger les services
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE}/services`);
        const services = await response.json();
        
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
            `;
            servicesGrid.appendChild(serviceCard);
        });
        
        // Animer les services après chargement
        animateServices();
    } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
    }
}

// Charger les projets
async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects`);
        const projects = await response.json();
        
        projectsGrid.innerHTML = '';
        
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.setAttribute('data-category', project.category);
            projectCard.setAttribute('data-project', project.id);
            
            const imageSrc = project.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDM1MCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNTAiIGhlaWdodD0iMjIwIiByeD0iMTAiIGZpbGw9IiNGNEY2RjgiLz4KPHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjIwMCIgcng9IjUiIGZpbGw9IiNFOUU3RUYiLz4KPGNpcmNsZSBjeD0iMTc1IiBjeT0iMTEwIiByPSI0MCIgZmlsbD0iIzAwOTZENiIvPgo8Y2lyY2xlIGN4PSIxNzUiIGN5PSIxMTAiIHI9IjE1IiBmaWxsPSIjRjhGQUZDIi8+CjxjaXJjbGUgY3g9IjE3NSIgY3k9IjExMCIgcj0iOCIgZmlsbD0iIzAwOTZENiIvPgo8cmVjdCB4PSIxMCIgeT0iMTUwIiB3aWR0aD0iMzMwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGQUZDIi8+CjxyZWN0IHg9IjMwIiB5PSIxNjAiIHdpZHRoPSIyOTAiIGhlaWdodD0iNDAiIHJ4PSI1IiBmaWxsPSIjRTlFN0VGIi8+Cjwvc3ZnPgo=';
            
            projectCard.innerHTML = `
                <div class="project-image">
                    <img src="${imageSrc}" alt="${project.title}">
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
        
        // Animer les projets après chargement
        animateProjects();
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
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
        // Envoyer l'email via EmailJS
        await emailjs.send('service_4ab2q68', 'template_m8zvkj9', {
            from_name: formData.name,
            from_email: formData.email,
            phone: formData.phone,
            service: formData.service,
            message: formData.message
        });
        
        alert('Merci pour votre message! Nous vous contacterons bientôt.');
        contactForm.reset();
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
    loadServices();
    loadProjects();
    
    window.addEventListener('scroll', animateOnScroll);
    // Déclencher une fois au chargement
    animateOnScroll();
});