// admin/js/editor.js
import { db } from '../../firebase-config.js';
import { authManager } from './auth.js';
import { Utils } from './utils.js';
import { 
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

class PageEditor {
    constructor() {
        this.pageId = this.getPageId();
        this.currentPage = null;
        this.sections = [];
        this.sortable = null;
        
        if (!this.pageId) {
            Utils.showToast('No page ID provided', 'error');
            window.location.href = 'dashboard.html';
            return;
        }
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPage();
        this.initializeDragAndDrop();
    }

    getPageId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    bindEvents() {
        // Page title
        document.getElementById('pageTitle').addEventListener('input', (e) => {
            if (this.currentPage) {
                this.currentPage.title = e.target.value;
                this.savePage({ title: e.target.value });
            }
        });

        // Buttons
        document.getElementById('previewBtn').addEventListener('click', () => this.previewPage());
        document.getElementById('saveDraftBtn').addEventListener('click', () => this.saveAsDraft());
        document.getElementById('publishBtn').addEventListener('click', () => this.publishPage());
    }

    async loadPage() {
        try {
            const pageDoc = await getDoc(doc(db, 'pages', this.pageId));
            if (pageDoc.exists()) {
                this.currentPage = { id: pageDoc.id, ...pageDoc.data() };
                this.sections = this.currentPage.sections || [];
                
                // Update UI
                document.getElementById('pageTitle').value = this.currentPage.title || '';
                this.renderSections();
            } else {
                Utils.showToast('Page not found', 'error');
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Error loading page:', error);
            Utils.showToast('Error loading page: ' + error.message, 'error');
        }
    }

    initializeDragAndDrop() {
        // Make sidebar items draggable
        const sectionTypes = document.querySelectorAll('.section-type');
        sectionTypes.forEach(type => {
            type.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('type', type.dataset.type);
            });
            
            // Click to add
            type.addEventListener('click', (e) => {
                if (!e.target.closest('.section-type')) return;
                this.addSection(type.dataset.type);
            });
        });

        // Handle drop in container
        const container = document.getElementById('sectionsContainer');
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', async (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            const type = e.dataTransfer.getData('type');
            if (type) {
                await this.addSection(type);
            }
        });

        // Initialize Sortable
        this.sortable = new Sortable(container, {
            animation: 150,
            handle: '.btn-move',
            onEnd: async (evt) => {
                const movedSection = this.sections[evt.oldIndex];
                this.sections.splice(evt.oldIndex, 1);
                this.sections.splice(evt.newIndex, 0, movedSection);
                
                // Update order property
                this.sections.forEach((section, index) => {
                    section.order = index;
                });
                
                await this.saveSections();
                this.renderSections();
            }
        });
    }

    async addSection(type) {
        const section = this.createSection(type);
        this.sections.push(section);
        await this.saveSections();
        this.renderSections();
        Utils.showToast(`${type} section added`, 'success');
    }

    createSection(type) {
        const sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const templates = {
            hero: {
                id: sectionId,
                type: 'hero',
                order: this.sections.length,
                data: {
                    title: 'Welcome to TAAGC',
                    subtitle: 'Your Global Market Access Partner',
                    imageUrl: '',
                    ctaText: 'Get Started',
                    ctaLink: '/contact'
                }
            },
            process: {
                id: sectionId,
                type: 'process',
                order: this.sections.length,
                data: {
                    title: 'How It Works',
                    steps: [
                        { 
                            icon: '🔍', 
                            title: 'Find Item', 
                            description: 'Send us the Amazon/Wish link' 
                        },
                        { 
                            icon: '💰', 
                            title: 'Get Quote', 
                            description: 'We provide all-inclusive price' 
                        },
                        { 
                            icon: '🚚', 
                            title: 'We Deliver', 
                            description: 'Doorstep delivery anywhere' 
                        }
                    ]
                }
            },
            services: {
                id: sectionId,
                type: 'services',
                order: this.sections.length,
                data: {
                    title: 'Our Services',
                    services: [
                        { 
                            title: 'Global Shopping', 
                            description: 'Buy from Amazon, Wish, etc.', 
                            icon: '🛒' 
                        },
                        { 
                            title: 'Investment', 
                            description: 'Vetted investment opportunities', 
                            icon: '📈' 
                        },
                        { 
                            title: 'Business Solutions', 
                            description: 'Consulting & procurement', 
                            icon: '💼' 
                        }
                    ]
                }
            },
            content: {
                id: sectionId,
                type: 'content',
                order: this.sections.length,
                data: {
                    title: 'Content Title',
                    content: '<p>Add your content here...</p>'
                }
            },
            cta: {
                id: sectionId,
                type: 'cta',
                order: this.sections.length,
                data: {
                    title: 'Ready to Get Started?',
                    subtitle: 'Contact us today for a free consultation',
                    buttonText: 'Contact Us',
                    buttonLink: '/contact'
                }
            },
            contact: {
                id: sectionId,
                type: 'contact',
                order: this.sections.length,
                data: {
                    title: 'Contact Us',
                    subtitle: 'Get in touch with our team',
                    email: 'priahmz@gmail.com',
                    phone: '+234 802 356 6143',
                    address: 'TAAGC Headquarters'
                }
            },
            testimonials: {
                id: sectionId,
                type: 'testimonials',
                order: this.sections.length,
                data: {
                    title: 'What Our Clients Say',
                    testimonials: [
                        {
                            name: 'Client Name',
                            role: 'Business Owner',
                            content: 'Excellent service! TAAGC made international shopping easy.',
                            avatar: ''
                        }
                    ]
                }
            },
            team: {
                id: sectionId,
                type: 'team',
                order: this.sections.length,
                data: {
                    title: 'Our Team',
                    members: [
                        {
                            name: 'Ahmad Hamza',
                            role: 'CEO',
                            bio: 'Founder and CEO of TAAGC',
                            avatar: ''
                        }
                    ]
                }
            }
        };
        
        return templates[type] || templates.content;
    }

    renderSections() {
        const container = document.getElementById('sectionsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (this.sections.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '<div class="empty-state" id="emptyState"><div class="icon">📄</div><p>Drag sections here or click a section type to add</p><p>Start building your page...</p></div>';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Sort sections by order
        this.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        let html = '';
        this.sections.forEach((section, index) => {
            html += this.renderSection(section, index);
        });
        
        container.innerHTML = html;
        
        // Reinitialize Sortable
        if (this.sortable) {
            this.sortable.destroy();
        }
        this.sortable = new Sortable(container, {
            animation: 150,
            handle: '.btn-move',
            onEnd: async (evt) => {
                const movedSection = this.sections[evt.oldIndex];
                this.sections.splice(evt.oldIndex, 1);
                this.sections.splice(evt.newIndex, 0, movedSection);
                
                this.sections.forEach((section, index) => {
                    section.order = index;
                });
                
                await this.saveSections();
                this.renderSections();
            }
        });
    }

    renderSection(section, index) {
        return `
            <div class="section-item" data-index="${index}">
                <div class="section-header">
                    <span class="section-type-label">${section.type.toUpperCase()}</span>
                    <div class="section-actions">
                        <button class="btn-small btn-move">↕ Move</button>
                        <button class="btn-small btn-remove" onclick="pageEditor.removeSection('${section.id}')">
                            Remove
                        </button>
                    </div>
                </div>
                <div class="section-content">
                    ${this.renderSectionForm(section)}
                </div>
            </div>
        `;
    }

    renderSectionForm(section) {
        switch(section.type) {
            case 'hero':
                return this.renderHeroForm(section);
            case 'process':
                return this.renderProcessForm(section);
            case 'services':
                return this.renderServicesForm(section);
            case 'content':
                return this.renderContentForm(section);
            case 'cta':
                return this.renderCtaForm(section);
            case 'contact':
                return this.renderContactForm(section);
            case 'testimonials':
                return this.renderTestimonialsForm(section);
            case 'team':
                return this.renderTeamForm(section);
            default:
                return `<p>Unknown section type: ${section.type}</p>`;
        }
    }

    renderHeroForm(section) {
        return `
            <div class="form-group">
                <label>Title</label>
                <input type="text" value="${section.data.title || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Subtitle</label>
                <input type="text" value="${section.data.subtitle || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'subtitle', this.value)">
            </div>
            <div class="form-group">
                <label>Button Text</label>
                <input type="text" value="${section.data.ctaText || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'ctaText', this.value)">
            </div>
            <div class="form-group">
                <label>Button Link</label>
                <input type="text" value="${section.data.ctaLink || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'ctaLink', this.value)">
            </div>
            <div class="form-group">
                <label>Background Image URL</label>
                <input type="text" value="${section.data.imageUrl || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'imageUrl', this.value)"
                       placeholder="https://example.com/image.jpg">
            </div>
        `;
    }

    renderProcessForm(section) {
        let stepsHtml = '';
        (section.data.steps || []).forEach((step, index) => {
            stepsHtml += `
                <div class="array-item">
                    <div class="array-header">
                        <strong>Step ${index + 1}</strong>
                        <button type="button" class="btn-remove-array" 
                                onclick="pageEditor.removeArrayItem('${section.id}', 'steps', ${index})">
                            Remove
                        </button>
                    </div>
                    <div class="form-group">
                        <label>Icon</label>
                        <input type="text" value="${step.icon || ''}" 
                               onchange="pageEditor.updateArrayItem('${section.id}', 'steps', ${index}, 'icon', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" value="${step.title || ''}" 
                               onchange="pageEditor.updateArrayItem('${section.id}', 'steps', ${index}, 'title', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea onchange="pageEditor.updateArrayItem('${section.id}', 'steps', ${index}, 'description', this.value)">${step.description || ''}</textarea>
                    </div>
                </div>
            `;
        });

        return `
            <div class="form-group">
                <label>Section Title</label>
                <input type="text" value="${section.data.title || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'title', this.value)">
            </div>
            ${stepsHtml}
            <button type="button" class="btn-add-array" 
                    onclick="pageEditor.addArrayItem('${section.id}', 'steps')">
                + Add Step
            </button>
        `;
    }

    renderServicesForm(section) {
        let servicesHtml = '';
        (section.data.services || []).forEach((service, index) => {
            servicesHtml += `
                <div class="array-item">
                    <div class="array-header">
                        <strong>Service ${index + 1}</strong>
                        <button type="button" class="btn-remove-array" 
                                onclick="pageEditor.removeArrayItem('${section.id}', 'services', ${index})">
                            Remove
                        </button>
                    </div>
                    <div class="form-group">
                        <label>Icon</label>
                        <input type="text" value="${service.icon || ''}" 
                               onchange="pageEditor.updateArrayItem('${section.id}', 'services', ${index}, 'icon', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" value="${service.title || ''}" 
                               onchange="pageEditor.updateArrayItem('${section.id}', 'services', ${index}, 'title', this.value)">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea onchange="pageEditor.updateArrayItem('${section.id}', 'services', ${index}, 'description', this.value)">${service.description || ''}</textarea>
                    </div>
                </div>
            `;
        });

        return `
            <div class="form-group">
                <label>Section Title</label>
                <input type="text" value="${section.data.title || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'title', this.value)">
            </div>
            ${servicesHtml}
            <button type="button" class="btn-add-array" 
                    onclick="pageEditor.addArrayItem('${section.id}', 'services')">
                + Add Service
            </button>
        `;
    }

    renderContentForm(section) {
        return `
            <div class="form-group">
                <label>Title</label>
                <input type="text" value="${section.data.title || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea style="height: 200px;" 
                          onchange="pageEditor.updateSectionData('${section.id}', 'content', this.value)">${section.data.content || ''}</textarea>
            </div>
        `;
    }

    renderCtaForm(section) {
        return `
            <div class="form-group">
                <label>Title</label>
                <input type="text" value="${section.data.title || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Subtitle</label>
                <input type="text" value="${section.data.subtitle || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'subtitle', this.value)">
            </div>
            <div class="form-group">
                <label>Button Text</label>
                <input type="text" value="${section.data.buttonText || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'buttonText', this.value)">
            </div>
            <div class="form-group">
                <label>Button Link</label>
                <input type="text" value="${section.data.buttonLink || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'buttonLink', this.value)">
            </div>
        `;
    }

    renderContactForm(section) {
        return `
            <div class="form-group">
                <label>Title</label>
                <input type="text" value="${section.data.title || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'title', this.value)">
            </div>
            <div class="form-group">
                <label>Subtitle</label>
                <input type="text" value="${section.data.subtitle || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'subtitle', this.value)">
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" value="${section.data.email || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'email', this.value)">
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" value="${section.data.phone || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'phone', this.value)">
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" value="${section.data.address || ''}" 
                       onchange="pageEditor.updateSectionData('${section.id}', 'address', this.value)">
            </div>
        `;
    }

    // Similar methods for testimonials and team...

    // Section management methods
    async updateSectionData(sectionId, field, value) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            section.data[field] = value;
            await this.saveSections();
        }
    }

    async addArrayItem(sectionId, arrayName) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            if (!section.data[arrayName]) {
                section.data[arrayName] = [];
            }
            
            const newItem = this.getDefaultArrayItem(arrayName);
            section.data[arrayName].push(newItem);
            await this.saveSections();
            this.renderSections();
        }
    }

    async removeArrayItem(sectionId, arrayName, index) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section && section.data[arrayName]) {
            section.data[arrayName].splice(index, 1);
            await this.saveSections();
            this.renderSections();
        }
    }

    async updateArrayItem(sectionId, arrayName, index, field, value) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section && section.data[arrayName] && section.data[arrayName][index]) {
            section.data[arrayName][index][field] = value;
            await this.saveSections();
        }
    }

    getDefaultArrayItem(arrayName) {
        const defaults = {
            steps: { icon: '📝', title: 'New Step', description: 'Step description' },
            services: { icon: '🛠️', title: 'New Service', description: 'Service description' },
            testimonials: { name: 'Client', role: 'Customer', content: 'Testimonial content', avatar: '' },
            members: { name: 'Team Member', role: 'Position', bio: 'Member bio', avatar: '' }
        };
        return defaults[arrayName] || {};
    }

    async removeSection(sectionId) {
        const confirmed = await Utils.confirmAction('Are you sure you want to remove this section?');
        if (confirmed) {
            this.sections = this.sections.filter(s => s.id !== sectionId);
            await this.saveSections();
            this.renderSections();
            Utils.showToast('Section removed', 'success');
        }
    }

    async saveSections() {
        if (!this.currentPage) return;
        
        try {
            await updateDoc(doc(db, 'pages', this.pageId), {
                sections: this.sections,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error saving sections:', error);
            Utils.showToast('Error saving sections: ' + error.message, 'error');
        }
    }

    async savePage(data) {
        if (!this.currentPage) return;
        
        try {
            await updateDoc(doc(db, 'pages', this.pageId), {
                ...data,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error saving page:', error);
            Utils.showToast('Error saving page: ' + error.message, 'error');
        }
    }

    async saveAsDraft() {
        await this.savePage({ status: 'draft' });
        Utils.showToast('Page saved as draft', 'success');
    }

    async publishPage() {
        await this.savePage({ status: 'published' });
        Utils.showToast('Page published successfully!', 'success');
    }

    previewPage() {
        if (this.currentPage && this.currentPage.slug) {
            window.open(`https://taagc.website/${this.currentPage.slug}`, '_blank');
        } else {
            Utils.showToast('Page needs a slug to preview', 'error');
        }
    }
}

// Initialize editor when DOM is loaded
let pageEditor;

document.addEventListener('DOMContentLoaded', () => {
    pageEditor = new PageEditor();
    window.pageEditor = pageEditor; // Make accessible for inline event handlers
});
