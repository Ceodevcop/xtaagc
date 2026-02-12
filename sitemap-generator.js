// sitemap-generator.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function generateSitemap() {
    try {
        // Get all published pages
        const pagesRef = collection(db, "pages");
        const pagesSnap = await getDocs(pagesRef);
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://taagc.website/</loc>
        <priority>1.0</priority>
    </url>
`;
        
        pagesSnap.forEach(doc => {
            const page = doc.data();
            if (page.status === 'published' && page.slug !== 'home') {
                sitemap += `    <url>
        <loc>https://taagc.website/${page.slug}</loc>
        <priority>0.8</priority>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    </url>
`;
            }
        });
        
        sitemap += `</urlset>`;
        
        return sitemap;
        
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return null;
    }
}

// Auto-update sitemap when new page is created
export async function updateSitemap() {
    const sitemap = await generateSitemap();
    if (sitemap) {
        console.log('✅ Sitemap generated');
        // In production, write this to sitemap.xml
        // For now, log to console
    }
}
