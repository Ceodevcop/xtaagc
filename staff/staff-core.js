// staff/staff-core.js
import { STAFF_DATA, getStaffStats } from './staff-data.js';
import { StaffFilter } from './staff-filter.js';
import { StaffSearch } from './staff-search.js';
import { StaffSort } from './staff-sort.js';
import { renderStaffGrid } from './staff-card.js';
import { Notifications } from '../components/notifications.js';
import { Modal } from '../components/modal.js';

class StaffManager {
    constructor() {
        this.staff = STAFF_DATA;
        this.filteredStaff = STAFF_DATA;
        this.filter = null;
        this.search = null;
        this.sort = new StaffSort();
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.init();
    }
    
    async init() {
        // Show loading
        document.getElementById('staffLoading').style.display = 'block';
        
        try {
            // Initialize filter and search
            this.filter = new StaffFilter(this.staff);
            this.search = new StaffSearch(this.staff);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render
            await this.render();
            
            // Hide loading
            document.getElementById('staffLoading').style.display = 'none';
            
            // Update stats
            this.updateStats();
            
            Notifications.success('Leadership team loaded successfully');
            
        } catch (error) {
            console.error('Error initializing staff page:', error);
            Notifications.error('Error loading staff data');
            document.getElementById('staffLoading').style.display = 'none';
        }
    }
    
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.filterByCategory(filter);
            });
        });
        
        // Search input with debounce
        const searchInput = document.getElementById('staffSearch');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchStaff(e.target.value);
            }, 300);
        });
        
        // Sort select
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortStaff(e.target.value);
        });
        
        // Back to top
        this.initBackToTop();
    }
    
    async render() {
        // Apply filters
        this.filteredStaff = this.filter.applyFilters();
        
        // Apply search
        if (this.filter.activeFilters.search) {
            this.filteredStaff = this.search.search(this.filter.activeFilters.search);
        }
        
        // Apply sort
        const sortValue = document.getElementById('sortSelect').value;
        this.filteredStaff = this.sort.sort(this.filteredStaff, sortValue);
        
        // Apply pagination
        const paginatedStaff = this.filteredStaff.slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
        );
        
        // Render grid
        renderStaffGrid(paginatedStaff);
        
        // Update pagination
        this.renderPagination();
        
        // Update stats
        this.updateStats();
        
        // Update active filter tabs
        this.updateActiveFilterTabs();
    }
    
    filterByCategory(category) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === category);
        });
        
        // Apply filter
        this.filteredStaff = this.filter.setCategory(category);
        
        // Reset to first page
        this.currentPage = 1;
        
        // Re-render with sort
        const sortValue = document.getElementById('sortSelect').value;
        this.filteredStaff = this.sort.sort(this.filteredStaff, sortValue);
        this.render();
    }
    
    searchStaff(term) {
        this.filteredStaff = this.filter.setSearch(term);
        
        // Apply search
        if (term) {
            this.filteredStaff = this.search.search(term);
        }
        
        // Reset to first page
        this.currentPage = 1;
        
        // Re-render with sort
        const sortValue = document.getElementById('sortSelect').value;
        this.filteredStaff = this.sort.sort(this.filteredStaff, sortValue);
        this.render();
        
        // Show suggestions if available
        if (term.length > 1) {
            const suggestions = this.search.getSuggestions(term);
            if (suggestions.length > 0) {
                this.showSuggestions(suggestions);
            }
        }
    }
    
    sortStaff(sortBy) {
        this.filteredStaff = this.sort.sort(this.filteredStaff, sortBy);
        this.render();
    }
    
    showProfile(staffId) {
        const staff = this.staff.find(s => s.id === staffId);
        if (!staff) return;
        
        const modal = new Modal({
            title: 'Staff Profile',
            size: 'lg'
        });
        
        const card = new StaffCard(staff);
        modal.setContent(card.renderProfile());
        modal.open();
    }
    
    showSuggestions(suggestions) {
        // Could implement suggestion dropdown
        console.log('Search suggestions:', suggestions);
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredStaff.length / this.itemsPerPage);
        const container = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <button class="pagination-btn" onclick="staffManager.goToPage(${this.currentPage - 1})" 
                ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= this.currentPage - 2 && i <= this.currentPage + 2)
            ) {
                paginationHtml += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="staffManager.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHtml += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // Next button
        paginationHtml += `
            <button class="pagination-btn" onclick="staffManager.goToPage(${this.currentPage + 1})"
                ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        container.innerHTML = paginationHtml;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.render();
    }
    
    updateStats() {
        const stats = getStaffStats(this.staff);
        
        document.getElementById('totalStaff').textContent = stats.total;
        document.getElementById('executiveCount').textContent = stats.executive;
        document.getElementById('operationsCount').textContent = stats.operations;
        document.getElementById('supportCount').textContent = stats.support;
    }
    
    updateActiveFilterTabs() {
        // Could add visual indicator for active filters
    }
    
    resetFilters() {
        this.filteredStaff = this.filter.resetFilters();
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        document.getElementById('staffSearch').value = '';
        this.currentPage = 1;
        this.render();
    }
    
    initBackToTop() {
        const btn = document.getElementById('backToTop');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    removeFilter(filter) {
        // Parse filter string and remove appropriate filter
        if (filter.startsWith('Category:')) {
            this.filterByCategory('all');
        } else if (filter.startsWith('Search:')) {
            document.getElementById('staffSearch').value = '';
            this.searchStaff('');
        } else if (filter.startsWith('#')) {
            const tag = filter.substring(1);
            this.filter.removeTag(tag);
            this.render();
        }
    }
}

// Initialize staff manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.staffManager = new StaffManager();
});
