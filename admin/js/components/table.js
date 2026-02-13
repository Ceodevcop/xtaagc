// admin/js/components/table.js
export class DataTable {
    constructor(options = {}) {
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.onRowClick = options.onRowClick || null;
        this.actions = options.actions || [];
    }
    
    render() {
        let html = '<div class="table-responsive"><table><thead><tr>';
        
        // Headers
        this.columns.forEach(col => {
            html += `<th>${col.label || col.field}</th>`;
        });
        
        if (this.actions.length > 0) {
            html += '<th>Actions</th>';
        }
        
        html += '</tr></thead><tbody>';
        
        // Rows
        this.data.forEach((row, index) => {
            html += '<tr' + (this.onRowClick ? ` onclick="this.onRowClick('${row.id}', ${index})"` : '') + '>';
            
            this.columns.forEach(col => {
                let value = row[col.field] || '-';
                if (col.formatter) value = col.formatter(value, row);
                if (col.badge) {
                    const badgeClass = typeof col.badge === 'function' 
                        ? col.badge(value, row) 
                        : col.badge;
                    value = `<span class="badge badge-${badgeClass}">${value}</span>`;
                }
                html += `<td>${value}</td>`;
            });
            
            if (this.actions.length > 0) {
                html += '<td><div style="display:flex; gap:5px;">';
                this.actions.forEach(action => {
                    html += `<button class="btn btn-sm ${action.class || ''}" onclick="event.stopPropagation(); ${action.handler}('${row.id}')">
                        <i class="fas fa-${action.icon}"></i> ${action.label}
                    </button>`;
                });
                html += '</div></td>';
            }
            
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        
        if (this.data.length === 0) {
            html = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No data found</h3>
                    <p>There are no items to display at this time.</p>
                </div>
            `;
        }
        
        return html;
    }
}

window.DataTable = DataTable;
