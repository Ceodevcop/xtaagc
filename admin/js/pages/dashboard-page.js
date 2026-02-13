// admin/js/pages/dashboard-page.js
import { db } from '../firebase-init.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { AdminCore } from '../admin-core.js';
import { Notifications } from '../components/notifications.js';

export async function render(admin) {
    const stats = await AdminCore.getStats();
    
    return `
        <div class="content-header">
            <h1 class="page-title"><i class="fas fa-tachometer-alt" style="color: var(--accent);"></i> Super Admin Dashboard</h1>
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="background: var(--light); padding:8px 16px; border-radius:40px; font-size:14px;">
                    <i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span class="badge badge-success"><i class="fas fa-check-circle"></i> System Online</span>
            </div>
        </div>
        
        <!-- Welcome Banner -->
        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color:white; padding:30px; border-radius:16px; margin-bottom:30px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px;">
            <div>
                <h2 style="color:white; margin-bottom:8px; font-size:28px;">Welcome, <span style="color:var(--accent);">${admin.name || 'Super Admin'}</span>!</h2>
                <p style="opacity:0.9; font-size:16px;">You have full system access. All super admin tasks are available below.</p>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn btn-outline" onclick="window.adminCore.loadPage('pages')" style="border-color:white; color:white;">
                    <i class="fas fa-plus"></i> Create Page
                </button>
                <button class="btn btn-outline" onclick="window.location.href='/setup-admin.html'" style="border-color:white; color:white;">
                    <i class="fas fa-user-plus"></i> Add Admin
                </button>
            </div>
        </div>
        
        <!-- Stats Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                <div class="stat-number">${stats.pages}</div>
                <div class="stat-label">Total Pages</div>
                <div class="stat-trend trend-up"><i class="fas fa-arrow-up"></i> +2 this week</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div class="stat-number">${stats.users + stats.companies}</div>
                <div class="stat-label">Total Users</div>
                <div class="stat-trend trend-up"><i class="fas fa-arrow-up"></i> ${stats.users + stats.companies} registered</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-building"></i></div>
                <div class="stat-number">${stats.companies}</div>
                <div class="stat-label">Companies</div>
                <div class="stat-trend"><i class="fas fa-clock"></i> ${stats.companies} pending approval</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-shield"></i></div>
                <div class="stat-number">${stats.admins}</div>
                <div class="stat-label">Administrators</div>
                <div class="stat-trend"><i class="fas fa-shield-alt"></i> ${stats.admins} active</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                <div class="stat-number">${stats.orders}</div>
                <div class="stat-label">Total Orders</div>
                <div class="stat-trend trend-up"><i class="fas fa-arrow-up"></i> +${Math.round(stats.orders * 0.15)} this month</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-number">$${Math.round(stats.orders * 350).toLocaleString()}</div>
                <div class="stat-label">Revenue</div>
                <div class="stat-trend trend-up"><i class="fas fa-arrow-up"></i> +12.4%</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
                <div class="stat-number">${stats.investments}</div>
                <div class="stat-label">Investments</div>
                <div class="stat-trend trend-up"><i class="fas fa-arrow-up"></i> +3 new</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-headset"></i></div>
                <div class="stat-number">12</div>
                <div class="stat-label">Support Tickets</div>
                <div class="stat-trend trend-down"><i class="fas fa-arrow-down"></i> 5 open</div>
            </div>
        </div>
        
        <!-- Super Admin Tasks Grid -->
        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-bottom:30px;">
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('pages')">
                <div style="width:60px; height:60px; background:var(--accent)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--accent); font-size:24px;">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h3 style="margin-bottom:8px;">Page Creator</h3>
                <p style="color:#64748b; font-size:13px;">Create, edit, delete pages</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('users')">
                <div style="width:60px; height:60px; background:var(--success)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--success); font-size:24px;">
                    <i class="fas fa-users"></i>
                </div>
                <h3 style="margin-bottom:8px;">User Management</h3>
                <p style="color:#64748b; font-size:13px;">Manage all users, approve companies</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('admins')">
                <div style="width:60px; height:60px; background:var(--danger)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--danger); font-size:24px;">
                    <i class="fas fa-user-shield"></i>
                </div>
                <h3 style="margin-bottom:8px;">Admin Management</h3>
                <p style="color:#64748b; font-size:13px;">Add/remove administrators</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('companies')">
                <div style="width:60px; height:60px; background:var(--info)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--info); font-size:24px;">
                    <i class="fas fa-building"></i>
                </div>
                <h3 style="margin-bottom:8px;">Company Approvals</h3>
                <p style="color:#64748b; font-size:13px;">Verify company registrations</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('orders')">
                <div style="width:60px; height:60px; background:var(--warning)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--warning); font-size:24px;">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3 style="margin-bottom:8px;">All Orders</h3>
                <p style="color:#64748b; font-size:13px;">Monitor shopper orders</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('investments')">
                <div style="width:60px; height:60px; background:var(--success)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--success); font-size:24px;">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3 style="margin-bottom:8px;">Investments</h3>
                <p style="color:#64748b; font-size:13px;">Track all investor portfolios</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('support')">
                <div style="width:60px; height:60px; background:var(--info)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--info); font-size:24px;">
                    <i class="fas fa-headset"></i>
                </div>
                <h3 style="margin-bottom:8px;">Support Tickets</h3>
                <p style="color:#64748b; font-size:13px;">Customer support management</p>
            </div>
            <div class="section-card" style="text-align:center; cursor:pointer;" onclick="window.adminCore.loadPage('analytics')">
                <div style="width:60px; height:60px; background:var(--accent)20; border-radius:16px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:var(--accent); font-size:24px;">
                    <i class="fas fa-chart-pie"></i>
                </div>
                <h3 style="margin-bottom:8px;">Analytics</h3>
                <p style="color:#64748b; font-size:13px;">System performance, reports</p>
            </div>
        </div>
        
        <!-- Recent Activity & Quick Actions -->
        <div style="display:grid; grid-template-columns:2fr 1fr; gap:20px;">
            <div class="section-card">
                <div class="section-header">
                    <h2><i class="fas fa-history"></i> Recent Activity</h2>
                    <button class="btn btn-sm btn-outline" onclick="window.adminCore.loadPage('analytics')">View All</button>
                </div>
                <div id="recentActivity">Loading...</div>
            </div>
            <div class="section-card">
                <div class="section-header">
                    <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="btn btn-block" onclick="window.adminCore.loadPage('pages')">
                        <i class="fas fa-plus"></i> Create New Page
                    </button>
                    <button class="btn btn-block btn-outline" onclick="window.location.href='/setup-admin.html'">
                        <i class="fas fa-user-plus"></i> Add Administrator
                    </button>
                    <button class="btn btn-block btn-outline" onclick="window.adminCore.loadPage('companies')">
                        <i class="fas fa-check-circle"></i> Approve Companies
                    </button>
                    <button class="btn btn-block btn-outline" onclick="window.adminCore.loadPage('settings')">
                        <i class="fas fa-cog"></i> System Settings
                    </button>
                </div>
            </div>
        </div>
    `;
}

export async function init(admin) {
    // Load recent activity
    const activityEl = document.getElementById('recentActivity');
    if (activityEl) {
        activityEl.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border);">
                    <div style="width:32px; height:32px; background:var(--success)20; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--success);">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">New user registered</div>
                        <div style="font-size:12px; color:#64748b;">2 minutes ago</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border);">
                    <div style="width:32px; height:32px; background:var(--accent)20; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--accent);">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">Page created: About Us</div>
                        <div style="font-size:12px; color:#64748b;">15 minutes ago</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border);">
                    <div style="width:32px; height:32px; background:var(--info)20; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--info);">
                        <i class="fas fa-building"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">Company registration pending</div>
                        <div style="font-size:12px; color:#64748b;">1 hour ago</div>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:12px; padding:8px 0;">
                    <div style="width:32px; height:32px; background:var(--warning)20; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--warning);">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:600;">New order #TAAGC-8742</div>
                        <div style="font-size:12px; color:#64748b;">3 hours ago</div>
                    </div>
                </div>
            </div>
        `;
    }
}
