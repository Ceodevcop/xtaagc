// admin-page-creator.js
import { db } from '../firebase-config.js';
import { adminAuth } from './admin-auth.js';
import { collection, doc, setDoc, addDoc, getDocs, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class AdminPageCreator {
    constructor() {
        this.templates = this.loadTemplates();
        this.init();
    }

    init() {
        // Check admin status on load
        adminAuth.requireAdmin();
    }

    loadTemplates() {
        return {
            landing: {
                name: 'Landing Page',
                icon: 'fa-rocket',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Welcome', subtitle: 'Your subtitle here', ctaText: 'Get Started', ctaLink: '/register' } },
                    { type: 'content', order: 2, data: { title: 'About', content: '<p>Your content here</p>' } },
                    { type: 'cta', order: 3, data: { title: 'Ready?', subtitle: 'Join us today', buttonText: 'Register', buttonLink: '/register' } }
                ]
            },
            sector: {
                name: 'Sector Page',
                icon: 'fa-cubes',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Sector Name', subtitle: 'Industry-leading solutions', ctaText: 'Explore', ctaLink: '/contact' } },
                    { type: 'services', order: 2, data: { title: 'Our Capabilities', services: [] } },
                    { type: 'cta', order: 3, data: { title: 'Partner With Us', subtitle: 'Contact our team', buttonText: 'Inquire', buttonLink: '/contact' } }
                ]
            },
            service: {
                name: 'Service Page',
                icon: 'fa-cog',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Service Name', subtitle: 'Professional service delivery', ctaText: 'Learn More', ctaLink: '/contact' } },
                    { type: 'content', order: 2, data: { title: 'How It Works', content: '<p>Service description here</p>' } },
                    { type: 'cta', order: 3, data: { title: 'Get Started', subtitle: 'Contact us today', buttonText: 'Contact', buttonLink: '/contact' } }
                ]
            },
            product: {
                name: 'Product Page',
                icon: 'fa-box',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Product Name', subtitle: 'Premium quality', ctaText: 'Shop Now', ctaLink: '/shop' } },
                    { type: 'content', order: 2, data: { title: 'Features', content: '<ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>' } },
                    { type: 'cta', order: 3, data: { title: 'Buy Now', subtitle: 'In stock', buttonText: 'Add to Cart', buttonLink: '/shop' } }
                ]
            },
            event: {
                name: 'Event Page',
                icon: 'fa-calendar',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Event Name', subtitle: 'Date & Location', ctaText: 'Register', ctaLink: '/register' } },
                    { type: 'content', order: 2, data: { title: 'Event Details', content: '<p>Schedule, speakers, venue</p>' } },
                    { type: 'cta', order: 3, data: { title: 'Save Your Seat', subtitle: 'Limited availability', buttonText: 'Register Now', buttonLink: '/register' } }
                ]
            },
            blog: {
                name: 'Blog Post',
                icon: 'fa-pen',
                sections: [
                    { type: 'hero', order: 1, data: { title: 'Post Title', subtitle: 'By Author • Date', ctaText: 'Read', ctaLink: '#' } },
                    { type: 'content', order: 2, data: { title: '', content: '<p>Blog content...</p>' } }
                ]
            },
            blank: {
                name: 'Blank Page',
                icon: 'fa-file',
                sections: []
            }
        };
    }

    async createPage(slug, title, template = 'landing', publishNow = true) {
        // Verify admin access
        const isAdmin = await adminAuth.requireAdmin();
        if (!isAdmin) return { success: false, error: 'Admin privileges required' };
        
        try {
            const admin = await adminAuth.getCurrentAdmin();
            const templateData = this.templates[template] || this.templates.landing;
            
            const pageData = {
                ...templateData,
                title: title || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                slug: slug,
                sections: templateData.sections.map((section, index) => ({
                    ...section,
                    order: index + 1,
                    id: `section_${Date.now()}_${index}`
                })),
                meta: {
                    description: `${title || slug} - TAAGC Global`,
                    keywords: `${slug}, TAAGC, global trade`
                },
                settings: {
                    showInNav: false,
                    template: template,
                    isPublished: publishNow
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: admin?.uid || 'admin',
                createdByEmail: admin?.email || 'admin@taagc.com',
                status: publishNow ? 'published' : 'draft'
            };
            
            // Save to Firestore
            await setDoc(doc(db, "pages", slug), pageData);
            
            return { 
                success: true, 
                slug, 
                url: `/${slug}`,
                message: `Page "${title}" created successfully!` 
            };
            
        } catch (error) {
            console.error('Error creating page:', error);
            return { success: false, error: error.message };
        }
    }

    async updatePage(slug, pageData) {
        // Verify admin access
        const isAdmin = await adminAuth.requireAdmin();
        if (!isAdmin) return { success: false, error: 'Admin privileges required' };
        
        try {
            await setDoc(doc(db, "pages", slug), {
                ...pageData,
                updatedAt: serverTimestamp(),
                updatedBy: (await adminAuth.getCurrentAdmin())?.uid
            }, { merge: true });
            
            return { success: true, message: 'Page updated successfully!' };
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deletePage(slug) {
        // Verify admin access
        const isAdmin = await adminAuth.requireAdmin();
        if (!isAdmin) return { success: false, error: 'Admin privileges required' };
        
        try {
            await deleteDoc(doc(db, "pages", slug));
            return { success: true, message: 'Page deleted successfully!' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllPages() {
        // Verify admin access
        const isAdmin = await adminAuth.requireAdmin();
        if (!isAdmin) return { success: false, error: 'Admin privileges required' };
        
        try {
            const pagesRef = collection(db, "pages");
            const pagesSnap = await getDocs(pagesRef);
            const pages = [];
            pagesSnap.forEach(doc => {
                pages.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, pages };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const adminPageCreator = new AdminPageCreator();
