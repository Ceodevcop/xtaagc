// staff/staff-search.js
export class StaffSearch {
    constructor(staffData) {
        this.staff = staffData;
        this.searchIndex = this.buildSearchIndex();
    }
    
    // Build search index for faster searching
    buildSearchIndex() {
        const index = {};
        this.staff.forEach(s => {
            index[s.id] = {
                name: s.name.toLowerCase(),
                role: s.role.toLowerCase(),
                bio: s.bio.toLowerCase(),
                tags: s.tags?.map(t => t.toLowerCase()) || [],
                location: s.location?.toLowerCase() || '',
                email: s.email?.toLowerCase() || ''
            };
        });
        return index;
    }
    
    // Search with relevance scoring
    search(query) {
        const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);
        if (terms.length === 0) return this.staff;
        
        const results = this.staff.map(staff => {
            const index = this.searchIndex[staff.id];
            let score = 0;
            
            terms.forEach(term => {
                // Exact matches get higher score
                if (index.name.includes(term)) score += 10;
                if (index.role.includes(term)) score += 8;
                if (index.bio.includes(term)) score += 5;
                if (index.tags.some(t => t.includes(term))) score += 7;
                if (index.location.includes(term)) score += 4;
                if (index.email.includes(term)) score += 3;
                
                // Partial matches
                if (index.name.split(' ').some(word => word.startsWith(term))) score += 5;
                if (index.role.split(' ').some(word => word.startsWith(term))) score += 4;
            });
            
            return { staff, score };
        });
        
        return results
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(r => r.staff);
    }
    
    // Highlight search terms in text
    highlight(text, query) {
        if (!query) return text;
        
        const terms = query.split(' ').filter(t => t.length > 0);
        let highlighted = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        
        return highlighted;
    }
    
    // Get search suggestions
    getSuggestions(query) {
        const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);
        if (terms.length === 0) return [];
        
        const suggestions = new Set();
        
        this.staff.forEach(staff => {
            terms.forEach(term => {
                if (staff.name.toLowerCase().includes(term)) {
                    suggestions.add(staff.name);
                }
                if (staff.role.toLowerCase().includes(term)) {
                    suggestions.add(staff.role);
                }
                staff.tags?.forEach(tag => {
                    if (tag.toLowerCase().includes(term)) {
                        suggestions.add(tag);
                    }
                });
            });
        });
        
        return Array.from(suggestions).slice(0, 5);
    }
}
