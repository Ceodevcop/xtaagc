// staff/staff-card.js
export class StaffCard {
    constructor(staff) {
        this.staff = staff;
    }
    
    render() {
        const cardClass = [
            'staff-card',
            this.staff.featured ? 'featured' : '',
            this.staff.hiring ? 'hiring' : ''
        ].filter(Boolean).join(' ');
        
        return `
            <div class="${cardClass}" data-id="${this.staff.id}" data-rank="${this.staff.rank}" data-category="${this.staff.category}" data-tier="${this.staff.tier}">
                <div class="staff-img">
                    <img src="${this.staff.image}" alt="${this.staff.name}" loading="lazy">
                    <span class="staff-rank-badge">
                        <i class="fas fa-${this.staff.rank === 1 ? 'crown' : this.staff.tier === 1 ? 'crown' : this.staff.tier === 2 ? 'star' : this.staff.tier === 3 ? 'medal' : 'shield'}"></i>
                        Rank ${this.staff.rank.toString().padStart(2, '0')}
                    </span>
                    <div class="staff-overlay">
                        <div class="staff-social">
                            ${this.staff.social?.linkedin ? `<a href="${this.staff.social.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ''}
                            ${this.staff.social?.twitter ? `<a href="${this.staff.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                            ${this.staff.social?.github ? `<a href="${this.staff.social.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                            ${this.staff.email ? `<a href="mailto:${this.staff.email}"><i class="fas fa-envelope"></i></a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="staff-info">
                    <div class="staff-name">
                        <span>${this.staff.name}</span>
                        ${this.staff.hiring ? '<span class="badge badge-warning" style="font-size:10px;">HIRING</span>' : ''}
                    </div>
                    <div class="staff-role">${this.staff.role}</div>
                    <p class="staff-bio">${this.staff.bio}</p>
                    
                    <div class="staff-meta">
                        ${this.staff.location ? `
                            <div class="staff-meta-item">
                                <i class="fas fa-map-marker-alt"></i> ${this.staff.location}
                            </div>
                        ` : ''}
                        ${this.staff.since ? `
                            <div class="staff-meta-item">
                                <i class="fas fa-calendar"></i> Since ${this.staff.since}
                            </div>
                        ` : ''}
                        ${this.staff.experience ? `
                            <div class="staff-meta-item">
                                <i class="fas fa-briefcase"></i> ${this.staff.experience}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="staff-footer">
                        <div class="staff-tags">
                            <span class="staff-tag"><i class="fas fa-tag"></i> ${this.staff.tierName}</span>
                            ${this.staff.tags?.slice(0, 2).map(tag => 
                                `<span class="staff-tag"><i class="fas fa-hashtag"></i> ${tag}</span>`
                            ).join('')}
                        </div>
                        <div class="staff-actions">
                            <button class="btn btn-sm btn-outline" onclick="staffManager.showProfile('${this.staff.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderProfile() {
        // Full profile view for modal
        return `
            <div style="display: grid; grid-template-columns: 200px 1fr; gap: 30px;">
                <div>
                    <img src="${this.staff.image}" alt="${this.staff.name}" style="width: 100%; border-radius: 16px; box-shadow: var(--shadow);">
                </div>
                <div>
                    <h2 style="color: var(--primary); margin-bottom: 5px;">${this.staff.name}</h2>
                    <p style="color: var(--accent); font-weight: 600; margin-bottom: 15px;">${this.staff.role}</p>
                    <p style="margin-bottom: 20px;">${this.staff.bio}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div><strong>Rank:</strong> ${this.staff.rank}</div>
                        <div><strong>Tier:</strong> ${this.staff.tierName}</div>
                        <div><strong>Location:</strong> ${this.staff.location || 'Global'}</div>
                        <div><strong>Since:</strong> ${this.staff.since || 'N/A'}</div>
                        ${this.staff.email ? `<div><strong>Email:</strong> <a href="mailto:${this.staff.email}">${this.staff.email}</a></div>` : ''}
                    </div>
                    
                    <div class="staff-tags" style="margin-bottom: 20px;">
                        ${this.staff.tags?.map(tag => 
                            `<span class="staff-tag">#${tag}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="staff-social" style="display: flex; gap: 10px;">
                        ${this.staff.social?.linkedin ? `<a href="${this.staff.social.linkedin}" class="btn btn-sm btn-outline" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                        ${this.staff.email ? `<a href="mailto:${this.staff.email}" class="btn btn-sm btn-outline"><i class="fas fa-envelope"></i> Email</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

// Card grid renderer
export function renderStaffGrid(staffArray) {
    if (!staffArray || staffArray.length === 0) {
        document.getElementById('staffGrid').innerHTML = '';
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    
    const grid = document.getElementById('staffGrid');
    grid.innerHTML = staffArray.map(staff => new StaffCard(staff).render()).join('');
    document.getElementById('emptyState').style.display = 'none';
}
