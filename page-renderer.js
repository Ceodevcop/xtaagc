// page-renderer.js
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class PageRenderer {
    constructor() {
        this.currentPage = null;
    }

    async renderPage(slug) {
        try {
            // Get page from Firestore
            const pageRef = doc(db, "pages", slug);
            const pageSnap = await getDoc(pageRef);
            
            if (pageSnap.exists()) {
                const page = pageSnap.data();
                this.currentPage = page;
                
                // Render the page
                document.title = `${page.title} | TAAGC Global`;
                this.renderContent(page);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error rendering page:', error);
            return false;
        }
    }

    renderContent(page) {
        const container = document.getElementById('main-content') || document.body;
        
        let html = `
            <div class="dynamic-page page-${page.slug}">
                <div class="container">
        `;
        
        // Sort sections by order
        const sections = page.sections.sort((a, b) => a.order - b.order);
        
        sections.forEach(section => {
            html += this.renderSection(section);
        });
        
        html += `
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    renderSection(section) {
        switch(section.type) {
            case 'hero':
                return `
                    <section class="hero-section">
                        <div class="hero-content">
                            <h1>${section.data.title}</h1>
                            <p>${section.data.subtitle}</p>
                            ${section.data.ctaText ? `
                                <a href="${section.data.ctaLink}" class="btn btn-primary">
                                    ${section.data.ctaText}
                                </a>
                            ` : ''}
                        </div>
                    </section>
                `;
            
            case 'content':
                return `
                    <section class="content-section">
                        <div class="content-wrapper">
                            <h2>${section.data.title}</h2>
                            <div class="rich-content">
                                ${section.data.content}
                            </div>
                        </div>
                    </section>
                `;
            
            case 'services':
                return `
                    <section class="services-section">
                        <h2>${section.data.title}</h2>
                        <div class="services-grid">
                            ${section.data.services.map(service => `
                                <div class="service-card">
                                    <div class="service-icon"><i class="fas ${service.icon}"></i></div>
                                    <h3>${service.title}</h3>
                                    <p>${service.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                `;
            
            case 'cta':
                return `
                    <section class="cta-section">
                        <div class="cta-card">
                            <h2>${section.data.title}</h2>
                            <p>${section.data.subtitle}</p>
                            <a href="${section.data.buttonLink}" class="btn btn-primary">
                                ${section.data.buttonText}
                            </a>
                        </div>
                    </section>
                `;
            
            default:
                return `
                    <section class="unknown-section">
                        <p>Section type "${section.type}" not recognized</p>
                    </section>
                `;
        }
    }
}

export const pageRenderer = new PageRenderer();
