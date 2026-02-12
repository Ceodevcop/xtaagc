// admin-page-creator.js
import { db } from '../firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class AdminPageCreator {
    constructor() {
        this.templates = this.loadTemplates();
    }

    loadTemplates() {
        return {
            landing: {
                title: 'New Landing Page',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Welcome', subtitle: 'Your subtitle here', ctaText: 'Get Started', ctaLink: '/register' } },
                    { type: 'content', order: 2, data: { title: 'About', content: '<p>Your content here</p>' } },
                    { type: 'cta', order: 3, data: { title: 'Ready?', subtitle: 'Join us today', buttonText: 'Register', buttonLink: '/register' } }
                ],
                meta: { description: '', keywords: '' },
                settings: { showInNav: false, template: 'landing' }
            },
            
            product: {
                title: 'New Product',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Product Name', subtitle: 'Product description', ctaText: 'Buy Now', ctaLink: '/shop' } },
                    { type: 'content', order: 2, data: { title: 'Features', content: '<ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>' } },
                    { type: 'cta', order: 3, data: { title: 'Get Yours Today', subtitle: 'Limited stock', buttonText: 'Shop Now', buttonLink: '/shop' } }
                ]
            },
            
            service: {
                title: 'New Service',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Service Name', subtitle: 'Service description', ctaText: 'Learn More', ctaLink: '/contact' } },
                    { type: 'services', order: 2, data: { title: 'Our Approach', services: [] } },
                    { type: 'cta', order: 3, data: { title: 'Ready to Start?', subtitle: 'Contact us today', buttonText: 'Get in Touch', buttonLink: '/contact' } }
                ]
            },
            
            event: {
                title: 'New Event',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Event Name', subtitle: 'Date & Location', ctaText: 'Register Now', ctaLink: '/register' } },
                    { type: 'content', order: 2, data: { title: 'About the Event', content: '<p>Event details here</p>' } },
                    { type: 'cta', order: 3, data: { title: 'Don\'t Miss Out', subtitle: 'Limited seats available', buttonText: 'Register', buttonLink: '/register' } }
                ]
            },
            
            blog: {
                title: 'New Blog Post',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Blog Post Title', subtitle: 'By Author • Date', ctaText: 'Read More', ctaLink: '#' } },
                    { type: 'content', order: 2, data: { title: '', content: '<p>Blog content here...</p>' } }
                ]
            }
        };
    }

    async createPage(slug, title, template = 'landing') {
        try {
            const templateData = this.templates[template] || this.templates.landing;
            
            const pageData = {
                ...templateData,
                title: title || templateData.title,
                slug: slug,
                sections: templateData.sections.map((section, index) => ({
                    ...section,
                    order: index + 1
                })),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: 'admin',
                status: 'draft'
            };
            
            const docRef = await addDoc(collection(db, "pages"), pageData);
            return { success: true, id: docRef.id, slug };
            
        } catch (error) {
            console.error('Error creating page:', error);
            return { success: false, error: error.message };
        }
    }

    async duplicatePage(pageId, newSlug) {
        try {
            const { doc, getDoc, addDoc } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
            
            const pageRef = doc(db, "pages", pageId);
            const pageSnap = await getDoc(pageRef);
            
            if (!pageSnap.exists()) {
                throw new Error('Page not found');
            }
            
            const pageData = pageSnap.data();
            const newPageData = {
                ...pageData,
                slug: newSlug,
                title: `${pageData.title} (Copy)`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: 'admin',
                status: 'draft'
            };
            
            delete newPageData.id;
            
            const docRef = await addDoc(collection(db, "pages"), newPageData);
            return { success: true, id: docRef.id, slug: newSlug };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const adminPageCreator = new AdminPageCreator();
