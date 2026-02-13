// staff/staff-sort.js
export class StaffSort {
    constructor() {
        this.currentSort = {
            field: 'rank',
            direction: 'asc'
        };
    }
    
    // Sort staff array
    sort(staff, sortBy) {
        this.parseSortString(sortBy);
        
        return [...staff].sort((a, b) => {
            let comparison = 0;
            
            switch (this.currentSort.field) {
                case 'rank':
                    comparison = a.rank - b.rank;
                    break;
                    
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                    
                case 'tier':
                    comparison = a.tier - b.tier;
                    break;
                    
                case 'since':
                    comparison = (a.since || 0) - (b.since || 0);
                    break;
                    
                case 'category':
                    comparison = a.category.localeCompare(b.category);
                    break;
                    
                default:
                    comparison = 0;
            }
            
            return this.currentSort.direction === 'asc' ? comparison : -comparison;
        });
    }
    
    // Parse sort string from dropdown
    parseSortString(sortBy) {
        const [field, direction] = sortBy.split('-');
        this.currentSort = {
            field,
            direction: direction || 'asc'
        };
    }
    
    // Get next sort for cycling
    getNextSort(currentField) {
        const sortOptions = {
            rank: { next: 'name', label: 'Name' },
            name: { next: 'tier', label: 'Tier' },
            tier: { next: 'rank', label: 'Rank' }
        };
        
        return sortOptions[currentField] || sortOptions.rank;
    }
    
    // Sort by field with direction toggle
    toggleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        return `${this.currentSort.field}-${this.currentSort.direction}`;
    }
    
    // Get sort indicator icon
    getSortIcon(field) {
        if (this.currentSort.field !== field) {
            return 'fa-sort';
        }
        return this.currentSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    }
}
