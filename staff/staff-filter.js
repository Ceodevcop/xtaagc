// staff/staff-filter.js
export class StaffFilter {
    constructor(staffData) {
        this.staff = staffData;
        this.activeFilters = {
            category: 'all',
            tier: null,
            hiring: null,
            featured: null,
            search: '',
            tags: []
        };
    }
    
    // Apply all active filters
    applyFilters() {
        let filtered = [...this.staff];
        
        // Category filter
        if (this.activeFilters.category !== 'all') {
            filtered = filtered.filter(s => s.category === this.activeFilters.category);
        }
        
        // Tier filter
        if (this.activeFilters.tier) {
            filtered = filtered.filter(s => s.tier === this.activeFilters.tier);
        }
        
        // Hiring filter
        if (this.activeFilters.hiring !== null) {
            filtered = filtered.filter(s => s.hiring === this.activeFilters.hiring);
        }
        
        // Featured filter
        if (this.activeFilters.featured !== null) {
            filtered = filtered.filter(s => s.featured === this.activeFilters.featured);
        }
        
        // Search filter
        if (this.activeFilters.search) {
            const searchLower = this.activeFilters.search.toLowerCase();
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(searchLower) ||
                s.role.toLowerCase().includes(searchLower) ||
                s.bio.toLowerCase().includes(searchLower) ||
                s.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }
        
        // Tags filter
        if (this.activeFilters.tags.length > 0) {
            filtered = filtered.filter(s => 
                this.activeFilters.tags.every(tag => 
                    s.tags?.includes(tag)
                )
            );
        }
        
        return filtered;
    }
    
    // Set category filter
    setCategory(category) {
        this.activeFilters.category = category;
        this.updateActiveFiltersDisplay();
        return this.applyFilters();
    }
    
    // Set tier filter
    setTier(tier) {
        this.activeFilters.tier = this.activeFilters.tier === tier ? null : tier;
        this.updateActiveFiltersDisplay();
        return this.applyFilters();
    }
    
    // Toggle hiring filter
    toggleHiring() {
        this.activeFilters.hiring = this.activeFilters.hiring === null ? true : null;
        this.updateActiveFiltersDisplay();
        return this.applyFilters();
    }
    
    // Toggle featured filter
    toggleFeatured() {
        this.activeFilters.featured = this.activeFilters.featured === null ? true : null;
        this.updateActiveFiltersDisplay();
        return this.applyFilters();
    }
    
    // Set search term
    setSearch(term) {
        this.activeFilters.search = term;
        this.updateActiveFiltersDisplay();
        return this.applyFilters();
    }
    
    // Add tag filter
    addTag(tag) {
        if (!this.activeFilters.tags.includes(tag)) {
            this.activeFilters.tags.push(tag);
            this.updateActiveFiltersDisplay();
        }
        return this.applyFilters();
    }
    
    // Remove tag filter
    removeTag(tag) {
        this.activeFilters.tags = this.activeFilters.tags.filter(t => t !== tag);
        this.updateActiveFiltersDisplay();
        return this.applyFilters();
    }
    
    // Reset all filters
    resetFilters() {
        this.activeFilters = {
            category: 'all',
            tier: null,
            hiring: null,
            featured: null,
            search: '',
            tags: []
        };
        
        // Reset UI elements
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('staffSearch').value = '';
        this.updateActiveFiltersDisplay();
        
        return this.applyFilters();
    }
    
    // Update active filters display
    updateActiveFiltersDisplay() {
        const container = document.getElementById('activeFilters');
        const filters = [];
        
        if (this.activeFilters.category !== 'all') {
            filters.push(`Category: ${this.activeFilters.category}`);
        }
        
        if (this.activeFilters.tier) {
            filters.push(`Tier ${this.activeFilters.tier}`);
        }
        
        if (this.activeFilters.hiring) {
            filters.push('Hiring');
        }
        
        if (this.activeFilters.featured) {
            filters.push('Featured');
        }
        
        if (this.activeFilters.search) {
            filters.push(`Search: "${this.activeFilters.search}"`);
        }
        
        this.activeFilters.tags.forEach(tag => {
            filters.push(`#${tag}`);
        });
        
        if (filters.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = filters.map(filter => `
            <span class="filter-tag">
                ${filter}
                <i class="fas fa-times" onclick="staffManager.removeFilter('${filter}')"></i>
            </span>
        `).join('');
    }
    
    // Get filter stats
    getStats() {
        return {
            total: this.staff.length,
            filtered: this.applyFilters().length,
            activeFilters: Object.values(this.activeFilters).filter(v => v !== null && v !== 'all' && v !== '' && v.length > 0).length
        };
    }
    }
