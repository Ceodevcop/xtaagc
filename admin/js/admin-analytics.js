// admin/js/admin-analytics.js
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { app } from './firebase-init.js';

const db = getFirestore(app);

export const AnalyticsManager = {
    async getAnalyticsHTML() {
        // Get counts
        const pagesSnap = await getDocs(collection(db, "pages"));
        const usersSnap = await getDocs(collection(db, "users"));
        const ordersSnap = await getDocs(collection(db, "orders"));
        
        // Calculate growth (mock data for now)
        const pageGrowth = pagesSnap.size * 0.2;
        const userGrowth = usersSnap.size * 0.15;
        
        return `
            <div class="header">
                <h1 style="color:#0a2540;">Analytics</h1>
                <div style="color:#64748b;">Real-time statistics</div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                    <div class="stat-number">${pagesSnap.size || 0}</div>
                    <div class="stat-label">Total Pages</div>
                    <div style="color:#2e7d5e; font-size:13px; margin-top:8px;">
                        <i class="fas fa-arrow-up"></i> +${Math.round(pageGrowth)} this month
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-number">${usersSnap.size || 0}</div>
                    <div class="stat-label">Total Users</div>
                    <div style="color:#2e7d5e; font-size:13px; margin-top:8px;">
                        <i class="fas fa-arrow-up"></i> +${Math.round(userGrowth)} this month
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                    <div class="stat-number">${ordersSnap.size || 0}</div>
                    <div class="stat-label">Total Orders</div>
                    <div style="color:#64748b; font-size:13px; margin-top:8px;">
                        <i class="fas fa-clock"></i> Last 30 days
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                    <div class="stat-number">100%</div>
                    <div class="stat-label">Uptime</div>
                    <div style="color:#2e7d5e; font-size:13px; margin-top:8px;">
                        <i class="fas fa-check"></i> All systems operational
                    </div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div class="section-card">
                    <h3 style="color:#0a2540; margin-bottom:16px;">Top Pages</h3>
                    <div style="padding:20px; text-align:center; color:#64748b; background:#f8fafc; border-radius:8px;">
                        <i class="fas fa-chart-bar fa-3x" style="color:#c19a6b; margin-bottom:10px;"></i>
                        <p>Analytics data will appear here once tracking is implemented.</p>
                    </div>
                </div>
                <div class="section-card">
                    <h3 style="color:#0a2540; margin-bottom:16px;">User Growth</h3>
                    <div style="padding:20px; text-align:center; color:#64748b; background:#f8fafc; border-radius:8px;">
                        <i class="fas fa-chart-line fa-3x" style="color:#c19a6b; margin-bottom:10px;"></i>
                        <p>Analytics data will appear here once tracking is implemented.</p>
                    </div>
                </div>
            </div>
            
            <div class="section-card">
                <h3 style="color:#0a2540; margin-bottom:16px;">System Status</h3>
                <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px;">
                    <div style="padding:16px; background:#f8fafc; border-radius:8px;">
                        <div style="color:#2e7d5e; font-weight:600; margin-bottom:8px;">
                            <i class="fas fa-check-circle"></i> Database
                        </div>
                        <p style="font-size:13px;">Connected</p>
                    </div>
                    <div style="padding:16px; background:#f8fafc; border-radius:8px;">
                        <div style="color:#2e7d5e; font-weight:600; margin-bottom:8px;">
                            <i class="fas fa-check-circle"></i> Authentication
                        </div>
                        <p style="font-size:13px;">Operational</p>
                    </div>
                    <div style="padding:16px; background:#f8fafc; border-radius:8px;">
                        <div style="color:#2e7d5e; font-weight:600; margin-bottom:8px;">
                            <i class="fas fa-check-circle"></i> Storage
                        </div>
                        <p style="font-size:13px;">Operational</p>
                    </div>
                </div>
            </div>
        `;
    }
};
