// Configuration
const API_BASE = '/api';

// Éléments DOM
const tabs = document.querySelectorAll('.admin-tab');
const tabContents = document.querySelectorAll('.admin-tab-content');
const alertsContainer = document.getElementById('alerts-container');

// Données globales
let promotions = [];
let services = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    loadSiteData();
    setupEventListeners();
    setupTabs();
});

// Configuration des onglets
function setupTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Désactiver tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Activer l'onglet sélectionné
            tab.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Formulaire informations du site
    document.getElementById('site-info-form').addEventListener('submit', handleSiteInfoSubmit);
    
    // Services
    document.getElementById('add-service-btn').addEventListener('click', showServiceForm);
    document.getElementById('cancel-service-btn').addEventListener('click', hideServiceForm);
    document.getElementById('service-form').addEventListener('submit', handleServiceSubmit);
    
    // Projets
    document.getElementById('add-project-btn').addEventListener('click', showProjectForm);
    document.getElementById('cancel-project-btn').addEventListener('click', hideProjectForm);
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);
    
    // Promotions
    document.getElementById('add-promotion-btn').addEventListener('click', showPromotionForm);
    document.getElementById('cancel-promotion-btn').addEventListener('click', hidePromotionForm);
    document.getElementById('promotion-form').addEventListener('submit', handlePromotionSubmit);
    
    // Réseaux sociaux
    document.getElementById('add-social-btn').addEventListener('click', showSocialForm);
    document.getElementById('cancel-social-btn').addEventListener('click', hideSocialForm);
    document.getElementById('social-form').addEventListener('submit', handleSocialSubmit);
}

// Charger les données du site
async function loadSiteData() {
    try {
        const response = await fetch(`${API_BASE}/site-data`);
        const data = await response.json();
        
        populateSiteInfoForm(data.siteInfo);
        loadServicesList(data.services);
        loadProjectsList(data.projects);
        loadPromotionsList(data.promotions);
        loadSocialList(data.socialLinks);
        
        promotions = data.promotions || [];
        services = data.services || [];
        
        populatePromotionSelect();
        
    } catch (error) {
        showAlert('Erreur lors du chargement des données: ' + error.message, 'error');
    }
}

// Remplir le formulaire d'informations du site
function populateSiteInfoForm(siteInfo) {
    if (!siteInfo) return;
    
    const fields = [
        'company_name', 'email', 'phone', 'whatsapp_number', 'address',
        'hero_title', 'hero_description', 'about_description', 'footer_description',
        'logo_url', 'hero_image_url', 'about_image_url', 'maintenance_message'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && siteInfo[field]) {
            element.value = siteInfo[field];
        }
    });
    
    // Checkbox maintenance
    const maintenanceCheckbox = document.getElementById('maintenance_mode');
    if (maintenanceCheckbox) {
        maintenanceCheckbox.checked = siteInfo.maintenance_mode || false;
    }
}

// Gérer la soumission des informations du site
async function handleSiteInfoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const siteInfo = {};
    
    // Récupérer les données du formulaire
    formData.forEach((value, key) => {
        if (key === 'maintenance_mode') {
            siteInfo[key] = document.getElementById('maintenance_mode').checked;
        } else {
            siteInfo[key] = value;
        }
    });
    
    // Gérer l'upload des images
    const logoFile = document.getElementById('logo').files[0];
    const heroFile = document.getElementById('hero_image').files[0];
    const aboutFile = document.getElementById('about_image').files[0];
    
    try {
        if (logoFile) {
            const logoUrl = await uploadImage(logoFile);
            siteInfo.logo_url = logoUrl;
        }
        
        if (heroFile) {
            const heroUrl = await uploadImage(heroFile);
            siteInfo.hero_image = heroUrl;
        }
        
        if (aboutFile) {
            const aboutUrl = await uploadImage(aboutFile);
            siteInfo.about_image = aboutUrl;
        }
        
        const response = await fetch(`${API_BASE}/update-site-info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ siteInfo })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('Informations du site mises à jour avec succès!', 'success');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showAlert('Erreur lors de la mise à jour: ' + error.message, 'error');
    }
}

// Upload d'image
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    // Déterminer l'endpoint en fonction du contexte
    let endpoint = `${API_BASE}/upload-image`;
    
    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    
    if (!response.ok) {
        throw new Error(result.error);
    }
    
    return result.imageUrl;
}

// SERVICES
function showServiceForm(service = null) {
    const form = document.getElementById('service-form');
    const title = document.getElementById('service-form-title');
    
    if (service) {
        title.textContent = 'Modifier le Service';
        populateServiceForm(service);
    } else {
        title.textContent = 'Nouveau Service';
        document.getElementById('service-form').reset();
        document.getElementById('service_id').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideServiceForm() {
    document.getElementById('service-form').style.display = 'none';
    document.getElementById('service-form').reset();
}

function populateServiceForm(service) {
    document.getElementById('service_id').value = service.id;
    document.getElementById('service_title').value = service.title;
    document.getElementById('service_description').value = service.description;
    document.getElementById('service_icon').value = service.icon;
    document.getElementById('service_discount').value = service.discount || '';
    document.getElementById('service_promotion').value = service.promotion_id || '';
}

async function handleServiceSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const serviceId = document.getElementById('service_id').value;
    
    try {
        const imageFile = document.getElementById('service_image').files[0];
        let imageUrl = '';
        
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
        }
        
        const serviceData = {
            title: formData.get('title'),
            description: formData.get('description'),
            icon: formData.get('icon'),
            discount: formData.get('discount'),
            promotion_id: formData.get('promotion_id') || null
        };
        
        if (imageUrl) {
            serviceData.image = imageUrl;
        }
        
        const url = serviceId ? `${API_BASE}/services/${serviceId}` : `${API_BASE}/services`;
        const method = serviceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(serviceId ? 'Service modifié avec succès!' : 'Service ajouté avec succès!', 'success');
            hideServiceForm();
            loadSiteData(); // Recharger les données
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showAlert('Erreur: ' + error.message, 'error');
    }
}

function loadServicesList(services) {
    const container = document.getElementById('services-list');
    container.innerHTML = '';
    
    services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'admin-item';
        serviceElement.innerHTML = `
            <div class="item-info">
                <div class="item-icon">
                    <i class="${service.icon || 'fas fa-cog'}"></i>
                </div>
                <div class="item-details">
                    <h4>${service.title}</h4>
                    <p>${service.description}</p>
                    ${service.discount ? `<span class="item-badge">${service.discount}</span>` : ''}
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editService(${service.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-delete" onclick="deleteService(${service.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        container.appendChild(serviceElement);
    });
}

async function editService(id) {
    const service = services.find(s => s.id === id);
    if (service) {
        showServiceForm(service);
    }
}

async function deleteService(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce service?')) {
        try {
            const response = await fetch(`${API_BASE}/services/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Service supprimé avec succès!', 'success');
                loadSiteData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showAlert('Erreur: ' + error.message, 'error');
        }
    }
}

// PROJETS
function showProjectForm(project = null) {
    const form = document.getElementById('project-form');
    const title = document.getElementById('project-form-title');
    
    if (project) {
        title.textContent = 'Modifier le Projet';
        populateProjectForm(project);
    } else {
        title.textContent = 'Nouveau Projet';
        document.getElementById('project-form').reset();
        document.getElementById('project_id').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideProjectForm() {
    document.getElementById('project-form').style.display = 'none';
    document.getElementById('project-form').reset();
}

function populateProjectForm(project) {
    document.getElementById('project_id').value = project.id;
    document.getElementById('project_title').value = project.title;
    document.getElementById('project_description').value = project.description;
    document.getElementById('project_category').value = project.category;
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const projectId = document.getElementById('project_id').value;
    
    try {
        const imageFile = document.getElementById('project_image').files[0];
        
        if (!imageFile && !projectId) {
            throw new Error('Veuillez sélectionner une image');
        }
        
        const projectData = new FormData();
        projectData.append('title', formData.get('title'));
        projectData.append('description', formData.get('description'));
        projectData.append('category', formData.get('category'));
        
        if (imageFile) {
            projectData.append('image', imageFile);
        }
        
        const url = projectId ? `${API_BASE}/projects/${projectId}` : `${API_BASE}/projects`;
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            body: projectData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(projectId ? 'Projet modifié avec succès!' : 'Projet ajouté avec succès!', 'success');
            hideProjectForm();
            loadSiteData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showAlert('Erreur: ' + error.message, 'error');
    }
}

function loadProjectsList(projects) {
    const container = document.getElementById('projects-list');
    container.innerHTML = '';
    
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'admin-item';
        projectElement.innerHTML = `
            <div class="item-info">
                <div class="item-image">
                    <img src="${project.image}" alt="${project.title}">
                </div>
                <div class="item-details">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <span class="item-badge">${project.category}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editProject(${project.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-delete" onclick="deleteProject(${project.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        container.appendChild(projectElement);
    });
}

async function editProject(id) {
    const projects = await fetch(`${API_BASE}/projects`).then(r => r.json());
    const project = projects.find(p => p.id === id);
    if (project) {
        showProjectForm(project);
    }
}

async function deleteProject(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
        try {
            const response = await fetch(`${API_BASE}/projects/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Projet supprimé avec succès!', 'success');
                loadSiteData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showAlert('Erreur: ' + error.message, 'error');
        }
    }
}

// PROMOTIONS
function populatePromotionSelect() {
    const select = document.getElementById('service_promotion');
    select.innerHTML = '<option value="">Aucune promotion</option>';
    
    promotions.forEach(promo => {
        const option = document.createElement('option');
        option.value = promo.id;
        option.textContent = promo.name;
        select.appendChild(option);
    });
}

function showPromotionForm(promotion = null) {
    const form = document.getElementById('promotion-form');
    const title = document.getElementById('promotion-form-title');
    
    if (promotion) {
        title.textContent = 'Modifier la Promotion';
        populatePromotionForm(promotion);
    } else {
        title.textContent = 'Nouvelle Promotion';
        document.getElementById('promotion-form').reset();
        document.getElementById('promotion_id').value = '';
        
        // Définir les dates par défaut
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('promotion_start').value = formatDateTime(now);
        document.getElementById('promotion_end').value = formatDateTime(tomorrow);
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hidePromotionForm() {
    document.getElementById('promotion-form').style.display = 'none';
    document.getElementById('promotion-form').reset();
}

function populatePromotionForm(promotion) {
    document.getElementById('promotion_id').value = promotion.id;
    document.getElementById('promotion_name').value = promotion.name;
    document.getElementById('promotion_description').value = promotion.description;
    document.getElementById('promotion_animation').value = promotion.animation_class || '';
    document.getElementById('promotion_discount').value = promotion.discount_text || '';
    document.getElementById('promotion_active').checked = promotion.active;
    
    // Formater les dates pour l'input datetime-local
    document.getElementById('promotion_start').value = formatDateTime(new Date(promotion.start_date));
    document.getElementById('promotion_end').value = formatDateTime(new Date(promotion.end_date));
}

function formatDateTime(date) {
    return date.toISOString().slice(0, 16);
}

async function handlePromotionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const promotionId = document.getElementById('promotion_id').value;
    
    try {
        const bannerFile = document.getElementById('promotion_banner').files[0];
        
        const promotionData = {
            name: formData.get('name'),
            description: formData.get('description'),
            animation_class: formData.get('animation_class'),
            discount_text: formData.get('discount_text'),
            start_date: formData.get('start_date'),
            end_date: formData.get('end_date'),
            active: document.getElementById('promotion_active').checked
        };
        
        if (bannerFile) {
            const bannerUrl = await uploadImage(bannerFile);
            promotionData.banner_image = bannerUrl;
        }
        
        const url = promotionId ? `${API_BASE}/promotions/${promotionId}` : `${API_BASE}/promotions`;
        const method = promotionId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(promotionData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(promotionId ? 'Promotion modifiée avec succès!' : 'Promotion ajoutée avec succès!', 'success');
            hidePromotionForm();
            loadSiteData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showAlert('Erreur: ' + error.message, 'error');
    }
}

function loadPromotionsList(promotions) {
    const container = document.getElementById('promotions-list');
    container.innerHTML = '';
    
    promotions.forEach(promotion => {
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        const now = new Date();
        const isActive = promotion.active && now >= startDate && now <= endDate;
        
        const promotionElement = document.createElement('div');
        promotionElement.className = 'admin-item';
        promotionElement.innerHTML = `
            <div class="item-info">
                <div class="item-details">
                    <h4>${promotion.name}</h4>
                    <p>${promotion.description}</p>
                    <div class="item-meta">
                        <span class="item-badge ${isActive ? 'active' : 'inactive'}">
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span class="item-date">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editPromotion(${promotion.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-delete" onclick="deletePromotion(${promotion.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        container.appendChild(promotionElement);
    });
}

async function editPromotion(id) {
    const promotions = await fetch(`${API_BASE}/promotions`).then(r => r.json());
    const promotion = promotions.find(p => p.id === id);
    if (promotion) {
        showPromotionForm(promotion);
    }
}

async function deletePromotion(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion?')) {
        try {
            const response = await fetch(`${API_BASE}/promotions/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Promotion supprimée avec succès!', 'success');
                loadSiteData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showAlert('Erreur: ' + error.message, 'error');
        }
    }
}

// RÉSEAUX SOCIAUX
function showSocialForm(social = null) {
    const form = document.getElementById('social-form');
    const title = document.getElementById('social-form-title');
    
    if (social) {
        title.textContent = 'Modifier le Réseau Social';
        populateSocialForm(social);
    } else {
        title.textContent = 'Nouveau Réseau Social';
        document.getElementById('social-form').reset();
        document.getElementById('social_id').value = '';
    }
    
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

function hideSocialForm() {
    document.getElementById('social-form').style.display = 'none';
    document.getElementById('social-form').reset();
}

function populateSocialForm(social) {
    document.getElementById('social_id').value = social.id;
    document.getElementById('social_platform').value = social.platform;
    document.getElementById('social_url').value = social.url;
}

async function handleSocialSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const socialId = document.getElementById('social_id').value;
    
    try {
        const socialData = {
            platform: formData.get('platform'),
            url: formData.get('url')
        };
        
        const url = socialId ? `${API_BASE}/social-links/${socialId}` : `${API_BASE}/social-links`;
        const method = socialId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(socialData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert(socialId ? 'Réseau social modifié avec succès!' : 'Réseau social ajouté avec succès!', 'success');
            hideSocialForm();
            loadSiteData();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showAlert('Erreur: ' + error.message, 'error');
    }
}

function loadSocialList(socialLinks) {
    const container = document.getElementById('social-list');
    container.innerHTML = '';
    
    const platformIcons = {
        'facebook': 'fab fa-facebook-f',
        'twitter': 'fab fa-twitter',
        'instagram': 'fab fa-instagram',
        'linkedin': 'fab fa-linkedin-in',
        'youtube': 'fab fa-youtube',
        'whatsapp': 'fab fa-whatsapp'
    };
    
    socialLinks.forEach(social => {
        const socialElement = document.createElement('div');
        socialElement.className = 'admin-item';
        socialElement.innerHTML = `
            <div class="item-info">
                <div class="item-icon">
                    <i class="${platformIcons[social.platform] || 'fas fa-share-alt'}"></i>
                </div>
                <div class="item-details">
                    <h4>${social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}</h4>
                    <p>${social.url}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editSocial(${social.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="btn-delete" onclick="deleteSocial(${social.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        container.appendChild(socialElement);
    });
}

async function editSocial(id) {
    const socialLinks = await fetch(`${API_BASE}/site-data`).then(r => r.json()).then(data => data.socialLinks);
    const social = socialLinks.find(s => s.id === id);
    if (social) {
        showSocialForm(social);
    }
}

async function deleteSocial(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce réseau social?')) {
        try {
            const response = await fetch(`${API_BASE}/social-links/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showAlert('Réseau social supprimé avec succès!', 'success');
                loadSiteData();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showAlert('Erreur: ' + error.message, 'error');
        }
    }
}

// Fonction utilitaire pour afficher les alertes
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Styles CSS supplémentaires pour l'administration
const adminStyles = `
    .admin-body {
        background: #f5f7fa;
        min-height: 100vh;
    }
    
    .admin-panel {
        padding: 20px 0;
    }
    
    .admin-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    .admin-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    
    .admin-header h1 {
        color: #0096D6;
        margin-bottom: 10px;
    }
    
    .admin-header p {
        color: #6B7280;
        font-size: 1.1rem;
    }
    
    .admin-tabs {
        display: flex;
        background: white;
        border-radius: 15px;
        padding: 10px;
        margin-bottom: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        flex-wrap: wrap;
    }
    
    .admin-tab {
        flex: 1;
        min-width: 200px;
        padding: 15px 25px;
        background: none;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #6B7280;
    }
    
    .admin-tab.active {
        background: #0096D6;
        color: white;
    }
    
    .admin-tab-content {
        display: none;
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        margin-bottom: 30px;
    }
    
    .admin-tab-content.active {
        display: block;
    }
    
    .admin-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        flex-wrap: wrap;
        gap: 20px;
    }
    
    .admin-section-header h2 {
        color: #0096D6;
        margin-bottom: 0;
    }
    
    .admin-form {
        max-width: 100%;
    }
    
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }
    
    @media (max-width: 768px) {
        .form-row {
            grid-template-columns: 1fr;
        }
    }
    
    .form-group {
        margin-bottom: 25px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #1A1F36;
    }
    
    .form-control {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        font-family: 'Open Sans', sans-serif;
        transition: all 0.3s ease;
    }
    
    .form-control:focus {
        border-color: #0096D6;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 150, 214, 0.2);
    }
    
    textarea.form-control {
        min-height: 120px;
        resize: vertical;
    }
    
    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .checkbox-group input {
        width: auto;
    }
    
    .form-actions {
        display: flex;
        gap: 15px;
        margin-top: 30px;
    }
    
    .admin-item {
        display: flex;
        align-items: center;
        padding: 20px;
        border: 1px solid #E5E7EB;
        border-radius: 10px;
        margin-bottom: 15px;
        transition: all 0.3s ease;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;
    }
    
    .admin-item:hover {
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    }
    
    .item-info {
        display: flex;
        align-items: center;
        gap: 15px;
        flex: 1;
    }
    
    .item-icon {
        width: 50px;
        height: 50px;
        background: #0096D6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
    }
    
    .item-image {
        width: 80px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .item-details {
        flex: 1;
    }
    
    .item-details h4 {
        margin-bottom: 5px;
        color: #1A1F36;
    }
    
    .item-details p {
        color: #6B7280;
        margin-bottom: 8px;
        font-size: 0.9rem;
    }
    
    .item-meta {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
    }
    
    .item-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    .item-badge.active {
        background: #D1FAE5;
        color: #065F46;
    }
    
    .item-badge.inactive {
        background: #FEE2E2;
        color: #991B1B;
    }
    
    .item-date {
        font-size: 0.8rem;
        color: #6B7280;
    }
    
    .item-actions {
        display: flex;
        gap: 10px;
    }
    
    .btn-edit, .btn-delete {
        padding: 8px 15px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        font-size: 0.9rem;
    }
    
    .btn-edit {
        background: #0096D6;
        color: white;
    }
    
    .btn-edit:hover {
        background: #0077B3;
    }
    
    .btn-delete {
        background: #FF6B35;
        color: white;
    }
    
    .btn-delete:hover {
        background: #E55A20;
    }
    
    .alert {
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .alert-success {
        background: #D1FAE5;
        color: #065F46;
        border: 1px solid #A7F3D0;
    }
    
    .alert-error {
        background: #FEE2E2;
        color: #991B1B;
        border: 1px solid #FECACA;
    }
    
    .alert-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }
`;

// Injecter les
