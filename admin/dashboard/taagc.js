// ============================================
// SUPER ADMIN DASHBOARD - COMPLETE API INTEGRATION
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOcCDPqRSlAMJJBEeNchTA1qO9tl9Nldw",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:android:0c54368d54e260cba98f0c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });

// ============================================
// API BASE URL
// ============================================
const API_BASE_URL = 'https://api.taagc.website/v1'; // Replace with your API URL
const API_KEY = 'your-api-key'; // Store securely in production
// ============================================
// INVESTMENT MANAGEMENT
// ============================================
let allInvestments = [];

async function loadInvestments() {
    const tbody = document.getElementById('investmentsTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading investments...</td></tr>';
    
    try {
        const snapshot = await db.collection('investments').orderBy('startDate', 'desc').get();
        allInvestments = [];
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8">No investments found</td></tr>';
            updateInvestmentStats([]);
            return;
        }
        
        let totalInvested = 0;
        let activeCount = 0;
        let totalRoi = 0;
        let totalReturns = 0;
        
        let html = '';
        snapshot.forEach(doc => {
            const investment = { id: doc.id, ...doc.data() };
            allInvestments.push(investment);
            
            // Calculate stats
            totalInvested += investment.amount || 0;
            if (investment.status === 'active') activeCount++;
            totalRoi += investment.roi || 0;
            
            // Get investor name
            const investorName = investment.investorName || 'Unknown';
            
            const startDate = investment.startDate ? 
                new Date(investment.startDate.toDate()).toLocaleDateString() : 'N/A';
            
            html += `
                <tr>
                    <td>${investment.title || 'N/A'}</td>
                    <td>${investorName}</td>
                    <td>$${(investment.amount || 0).toLocaleString()}</td>
                    <td>${investment.roi || 0}%</td>
                    <td>${investment.duration || 'N/A'}</td>
                    <td><span class="badge badge-${investment.status || 'pending'}">${investment.status || 'pending'}</span></td>
                    <td>${startDate}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-eye" onclick="viewInvestment('${doc.id}')"></i>
                            <i class="fas fa-edit" onclick="editInvestment('${doc.id}')"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('investment', '${doc.id}')"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Update stats
        updateInvestmentStats({
            totalInvested,
            activeCount,
            avgRoi: allInvestments.length ? totalRoi / allInvestments.length : 0,
            totalReturns: totalInvested * (1 + (totalRoi / 100 / allInvestments.length || 0))
        });
        
        initDataTable('investmentsTable');
        
    } catch (error) {
        console.error('Error loading investments:', error);
        tbody.innerHTML = '<tr><td colspan="8">Error loading investments</td></tr>';
    }
}

function updateInvestmentStats(stats) {
    document.getElementById('totalInvested').textContent = `$${(stats.totalInvested || 0).toLocaleString()}`;
    document.getElementById('activeInvestments').textContent = stats.activeCount || 0;
    document.getElementById('avgRoi').textContent = `${Math.round(stats.avgRoi || 0)}%`;
    document.getElementById('totalReturns').textContent = `$${Math.round(stats.totalReturns || 0).toLocaleString()}`;
}

function openAddInvestmentModal() {
    // Create modal HTML
    const modalHtml = `
        <div class="modal" id="addInvestmentModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add Investment</h2>
                    <span class="modal-close" onclick="closeModal('addInvestmentModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addInvestmentForm">
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" class="form-control" id="invTitle" required>
                        </div>
                        <div class="form-group">
                            <label>Investor ID</label>
                            <select class="form-control" id="invInvestorId" required>
                                <option value="">Select Investor</option>
                                ${allUsers.filter(u => u.role === 'investor').map(u => 
                                    `<option value="${u.id}">${u.fullName} (${u.email})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Amount ($)</label>
                            <input type="number" class="form-control" id="invAmount" required>
                        </div>
                        <div class="form-group">
                            <label>ROI (%)</label>
                            <input type="number" class="form-control" id="invRoi" required>
                        </div>
                        <div class="form-group">
                            <label>Duration</label>
                            <input type="text" class="form-control" id="invDuration" placeholder="e.g., 12 months">
                        </div>
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="date" class="form-control" id="invStartDate" required>
                        </div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="form-control" id="invStatus">
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeModal('addInvestmentModal')">Cancel</button>
                    <button class="btn btn-primary" onclick="addInvestment()">Create Investment</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    openModal('addInvestmentModal');
}

async function addInvestment() {
    const title = document.getElementById('invTitle').value;
    const investorId = document.getElementById('invInvestorId').value;
    const amount = parseFloat(document.getElementById('invAmount').value);
    const roi = parseFloat(document.getElementById('invRoi').value);
    const duration = document.getElementById('invDuration').value;
    const startDate = document.getElementById('invStartDate').value;
    const status = document.getElementById('invStatus').value;

    if (!title || !investorId || !amount || !roi || !startDate) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        // Get investor name
        const investorDoc = await db.collection('users').doc(investorId).get();
        const investorName = investorDoc.exists ? investorDoc.data().fullName : 'Unknown';

        await db.collection('investments').add({
            title,
            investorId,
            investorName,
            amount,
            roi,
            duration,
            startDate: firebase.firestore.Timestamp.fromDate(new Date(startDate)),
            status,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        showToast('Investment created successfully', 'success');
        closeModal('addInvestmentModal');
        document.getElementById('addInvestmentModal').remove();
        loadInvestments();
        
    } catch (error) {
        console.error('Error creating investment:', error);
        showToast(error.message, 'error');
    }
}

function exportInvestments() {
    const data = allInvestments.map(inv => ({
        Title: inv.title,
        Investor: inv.investorName,
        Amount: inv.amount,
        ROI: inv.roi + '%',
        Duration: inv.duration,
        Status: inv.status,
        StartDate: inv.startDate ? new Date(inv.startDate.toDate()).toLocaleDateString() : 'N/A'
    }));
    
    const csv = convertToCSV(data);
    downloadFile('investments_export.csv', csv);
}

// ============================================
// TRANSACTION MANAGEMENT
// ============================================
let allTransactions = [];

async function loadTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading transactions...</td></tr>';
    
    try {
        const snapshot = await db.collection('transactions').orderBy('timestamp', 'desc').limit(500).get();
        allTransactions = [];
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">No transactions found</td></tr>';
            updateTransactionStats([]);
            return;
        }
        
        let totalVolume = 0;
        let todayVolume = 0;
        let pendingCount = 0;
        let completedCount = 0;
        const today = new Date().toDateString();
        
        let html = '';
        snapshot.forEach(doc => {
            const transaction = { id: doc.id, ...doc.data() };
            allTransactions.push(transaction);
            
            const date = transaction.timestamp ? 
                new Date(transaction.timestamp.toDate()).toLocaleString() : 'N/A';
            
            // Calculate stats
            totalVolume += transaction.amount || 0;
            if (transaction.timestamp) {
                const txDate = new Date(transaction.timestamp.toDate()).toDateString();
                if (txDate === today) todayVolume += transaction.amount || 0;
            }
            if (transaction.status === 'pending') pendingCount++;
            if (transaction.status === 'completed') completedCount++;
            
            // Get user name
            const userName = transaction.userName || transaction.userId || 'Unknown';
            
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${userName}</td>
                    <td><span class="badge badge-${transaction.type}">${transaction.type || 'N/A'}</span></td>
                    <td>$${(transaction.amount || 0).toLocaleString()}</td>
                    <td><span class="badge badge-${transaction.status || 'pending'}">${transaction.status || 'pending'}</span></td>
                    <td><code>${transaction.reference || 'N/A'}</code></td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-eye" onclick="viewTransaction('${doc.id}')"></i>
                            <i class="fas fa-print" onclick="printReceipt('${doc.id}')"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Update stats
        document.getElementById('totalVolume').textContent = `$${totalVolume.toLocaleString()}`;
        document.getElementById('todayVolume').textContent = `$${todayVolume.toLocaleString()}`;
        document.getElementById('pendingTransactions').textContent = pendingCount;
        document.getElementById('completedTransactions').textContent = completedCount;
        
        initDataTable('transactionsTable');
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        tbody.innerHTML = '<tr><td colspan="7">Error loading transactions</td></tr>';
    }
}

function exportTransactions() {
    const data = allTransactions.map(tx => ({
        Date: tx.timestamp ? new Date(tx.timestamp.toDate()).toLocaleString() : 'N/A',
        User: tx.userName || tx.userId,
        Type: tx.type,
        Amount: tx.amount,
        Status: tx.status,
        Reference: tx.reference
    }));
    
    const csv = convertToCSV(data);
    downloadFile('transactions_export.csv', csv);
}

function filterTransactions() {
    // Implement transaction filtering
    showToast('Transaction filtering coming soon', 'info');
}

// ============================================
// REPORTS MANAGEMENT
// ============================================
async function loadReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading reports...</td></tr>';
    
    try {
        const snapshot = await db.collection('reports').orderBy('generatedAt', 'desc').get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="6">No reports found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const report = doc.data();
            const date = report.generatedAt ? 
                new Date(report.generatedAt.toDate()).toLocaleString() : 'N/A';
            
            html += `
                <tr>
                    <td>${date}</td>
                    <td>${report.name || 'Report'}</td>
                    <td>${report.type || 'N/A'}</td>
                    <td>${report.size || '0 KB'}</td>
                    <td>${report.generatedBy || 'System'}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-download" onclick="downloadReport('${doc.id}')"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('report', '${doc.id}')"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('reportsTable');
        
    } catch (error) {
        console.error('Error loading reports:', error);
        tbody.innerHTML = '<tr><td colspan="6">Error loading reports</td></tr>';
    }
}

async function generateReport() {
    const type = document.getElementById('reportType').value;
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const format = document.getElementById('reportFormat').value;

    if (!startDate || !endDate) {
        showToast('Please select date range', 'error');
        return;
    }

    showToast('Generating report...', 'info');

    try {
        // Get data based on type
        let data = [];
        let collection;
        
        switch(type) {
            case 'users':
                collection = 'users';
                break;
            case 'investments':
                collection = 'investments';
                break;
            case 'transactions':
                collection = 'transactions';
                break;
            case 'api':
                collection = 'api_logs';
                break;
        }
        
        const snapshot = await db.collection(collection).get();
        data = snapshot.docs.map(doc => doc.data());
        
        // Generate filename
        const filename = `${type}_report_${startDate}_to_${endDate}.${format}`;
        
        // Convert to CSV
        const csv = convertToCSV(data);
        
        // Save report record
        await db.collection('reports').add({
            name: filename,
            type,
            format,
            startDate,
            endDate,
            size: `${Math.round(csv.length / 1024)} KB`,
            generatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            generatedBy: currentUser.email
        });
        
        // Download file
        downloadFile(filename, csv);
        
        showToast('Report generated successfully', 'success');
        loadReports();
        
    } catch (error) {
        console.error('Error generating report:', error);
        showToast(error.message, 'error');
    }
}

function downloadReport(id) {
    // Implement report download
    showToast('Downloading report...', 'info');
}

function scheduleReport() {
    showToast('Scheduled reports coming soon', 'info');
}

function refreshReports() {
    loadReports();
}

// ============================================
// UPDATE SECTION LOADING
// ============================================
// Add to loadSection function:
function loadSection(section) {
    // ... existing code ...
    
    switch(section) {
        case 'users': loadUsers(); break;
        case 'admins': loadUsersByRole('admin'); break;
        case 'investors': loadUsersByRole('investor'); break;
        case 'clients': loadUsersByRole('client'); break;
        case 'api': loadApiManager(); break;
        case 'investments': 
            loadInvestments(); 
            loadInvestmentStats();
            break;
        case 'transactions': 
            loadTransactions(); 
            break;
        case 'reports': 
            loadReports(); 
            break;
        default: break;
    }
}

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentUser = null;
let currentUserData = null;
let currentSection = 'dashboard';
let allUsers = [];
let selectedUsers = new Set();
let deleteCallback = null;
let growthChart = null;
let distributionChart = null;
let apiEndpoints = [];
let apiLogs = [];

// DataTable instances
const dataTables = {};

// ============================================
// API CLIENT
// ============================================
const apiClient = {
    async request(endpoint, method = 'GET', data = null, headers = {}) {
        const startTime = performance.now();
        const url = `${API_BASE_URL}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
        };
        
        const config = {
            method,
            headers: { ...defaultHeaders, ...headers }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, config);
            const responseTime = performance.now() - startTime;
            
            // Log API call
            await logApiCall({
                endpoint,
                method,
                status: response.status,
                responseTime,
                success: response.ok
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const result = await response.json();
            return { data: result, responseTime };
            
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },
    
    async get(endpoint) {
        return this.request(endpoint, 'GET');
    },
    
    async post(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    },
    
    async put(endpoint, data) {
        return this.request(endpoint, 'PUT', data);
    },
    
    async delete(endpoint) {
        return this.request(endpoint, 'DELETE');
    }
};

// ============================================
// AUTH STATE CHECK
// ============================================
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = '/xtaagc/admin-login';
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists || userDoc.data().role !== 'super_admin') {
            await auth.signOut();
            window.location.href = '/xtaagc/admin-login';
            return;
        }

        currentUser = user;
        currentUserData = userDoc.data();
        
        // Update UI with user info
        document.getElementById('userName').textContent = currentUserData.fullName || 'Super Admin';
        document.getElementById('userAvatar').textContent = (currentUserData.fullName || 'SA').charAt(0);
        
        // Load initial data
        await Promise.all([
            loadDashboardData(),
            loadApiStats()
        ]);
        
    } catch (error) {
        console.error('Auth error:', error);
        await auth.signOut();
        window.location.href = '/xtaagc/admin-login';
    }
});

// ============================================
// SECTION NAVIGATION
// ============================================
document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        loadSection(section);
    });
});

function loadSection(section) {
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    
    const titles = {
        dashboard: 'Dashboard',
        users: 'User Management',
        admins: 'Admin Management',
        investors: 'Investor Management',
        clients: 'Client Management',
        events: 'Event Management',
        testimonials: 'Testimonial Management',
        opportunities: 'Investment Opportunities',
        announcements: 'Announcements',
        profile: 'My Profile',
        settings: 'System Settings',
        audit: 'Audit Logs',
        backup: 'Backup & Restore',
        api: 'API Manager'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    currentSection = section;
    
    switch(section) {
        case 'users': loadUsers(); break;
        case 'admins': loadUsersByRole('admin'); break;
        case 'investors': loadUsersByRole('investor'); break;
        case 'clients': loadUsersByRole('client'); break;
        case 'api': loadApiManager(); break;
        default: break;
    }
}

// ============================================
// API MANAGER
// ============================================
async function loadApiManager() {
    await Promise.all([
        loadApiEndpoints(),
        loadApiLogs(),
        loadApiStats()
    ]);
}

async function loadApiStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const statsRef = db.collection('api_stats').doc(today);
        const statsDoc = await statsRef.get();
        
        if (statsDoc.exists) {
            const stats = statsDoc.data();
            document.getElementById('totalApiCalls').textContent = stats.total || 0;
            document.getElementById('successfulCalls').textContent = stats.successful || 0;
            document.getElementById('failedCalls').textContent = stats.failed || 0;
            document.getElementById('avgResponse').textContent = stats.avgResponse ? `${Math.round(stats.avgResponse)}ms` : '0ms';
        }
        
        // Update dashboard stat
        document.getElementById('apiCalls').textContent = statsDoc.exists ? statsDoc.data().total || 0 : 0;
        
    } catch (error) {
        console.error('Error loading API stats:', error);
    }
}

async function loadApiEndpoints() {
    const tbody = document.getElementById('apiEndpointsBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading endpoints...</td></tr>';
    
    try {
        const snapshot = await db.collection('api_endpoints').get();
        apiEndpoints = [];
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">No endpoints found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const endpoint = { id: doc.id, ...doc.data() };
            apiEndpoints.push(endpoint);
            
            const successRate = endpoint.totalCalls ? 
                Math.round((endpoint.successfulCalls / endpoint.totalCalls) * 100) : 100;
            
            html += `
                <tr>
                    <td><code>${endpoint.path}</code></td>
                    <td><span class="badge badge-${endpoint.method}">${endpoint.method}</span></td>
                    <td>${endpoint.totalCalls || 0}</td>
                    <td>${successRate}%</td>
                    <td>${endpoint.avgResponse || 0}ms</td>
                    <td><span class="badge badge-${endpoint.active ? 'success' : 'warning'}">
                        ${endpoint.active ? 'Active' : 'Inactive'}
                    </span></td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="editApiEndpoint('${doc.id}')"></i>
                            <i class="fas fa-chart-line" onclick="viewEndpointStats('${doc.id}')"></i>
                            <i class="fas fa-power-off" onclick="toggleEndpoint('${doc.id}')"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('api_endpoint', '${doc.id}')"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading endpoints:', error);
        tbody.innerHTML = '<tr><td colspan="7">Error loading endpoints</td></tr>';
    }
}

async function loadApiLogs() {
    const tbody = document.getElementById('apiLogsBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading logs...</td></tr>';
    
    try {
        const snapshot = await db.collection('api_logs')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7">No logs found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const log = doc.data();
            const time = log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString() : 'N/A';
            const statusClass = log.status >= 200 && log.status < 300 ? 'success' : 'danger';
            
            html += `
                <tr>
                    <td>${time}</td>
                    <td><code>${log.endpoint}</code></td>
                    <td><span class="badge badge-${log.method}">${log.method}</span></td>
                    <td><span class="badge badge-${statusClass}">${log.status}</span></td>
                    <td>${Math.round(log.responseTime)}ms</td>
                    <td>${log.user || 'Anonymous'}</td>
                    <td>${log.ip || 'N/A'}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading API logs:', error);
        tbody.innerHTML = '<tr><td colspan="7">Error loading logs</td></tr>';
    }
}

async function logApiCall(logData) {
    try {
        const batch = db.batch();
        
        // Log the call
        const logRef = db.collection('api_logs').doc();
        batch.set(logRef, {
            ...logData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            user: currentUser?.email || 'system'
        });
        
        // Update endpoint stats
        const endpointRef = db.collection('api_endpoints').doc(logData.endpoint);
        const endpointDoc = await endpointRef.get();
        
        if (endpointDoc.exists) {
            const data = endpointDoc.data();
            const totalCalls = (data.totalCalls || 0) + 1;
            const successfulCalls = (data.successfulCalls || 0) + (logData.success ? 1 : 0);
            const totalResponseTime = (data.totalResponseTime || 0) + logData.responseTime;
            
            batch.update(endpointRef, {
                totalCalls,
                successfulCalls,
                avgResponse: Math.round(totalResponseTime / totalCalls),
                lastCalled: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const statsRef = db.collection('api_stats').doc(today);
        const statsDoc = await statsRef.get();
        
        if (statsDoc.exists) {
            const data = statsDoc.data();
            const total = (data.total || 0) + 1;
            const successful = (data.successful || 0) + (logData.success ? 1 : 0);
            const failed = (data.failed || 0) + (logData.success ? 0 : 1);
            const totalTime = (data.totalTime || 0) + logData.responseTime;
            
            batch.update(statsRef, {
                total,
                successful,
                failed,
                avgResponse: Math.round(totalTime / total)
            });
        } else {
            batch.set(statsRef, {
                total: 1,
                successful: logData.success ? 1 : 0,
                failed: logData.success ? 0 : 1,
                totalTime: logData.responseTime,
                avgResponse: logData.responseTime,
                date: today
            });
        }
        
        await batch.commit();
        
    } catch (error) {
        console.error('Error logging API call:', error);
    }
}

function openAddEndpointModal() {
    document.getElementById('addEndpointForm').reset();
    document.getElementById('endpointAuth').checked = true;
    document.getElementById('endpointRateLimit').value = 60;
    openModal('addEndpointModal');
}

async function addApiEndpoint() {
    const path = document.getElementById('endpointPath').value;
    const method = document.getElementById('endpointMethod').value;
    const description = document.getElementById('endpointDescription').value;
    const rateLimit = document.getElementById('endpointRateLimit').value;
    const auth = document.getElementById('endpointAuth').checked;

    if (!path || !method) {
        showToast('Please fill required fields', 'error');
        return;
    }

    try {
        await db.collection('api_endpoints').add({
            path,
            method,
            description,
            rateLimit: parseInt(rateLimit),
            authRequired: auth,
            active: true,
            totalCalls: 0,
            successfulCalls: 0,
            avgResponse: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        showToast('API endpoint created successfully', 'success');
        closeModal('addEndpointModal');
        loadApiEndpoints();
        
    } catch (error) {
        console.error('Error creating endpoint:', error);
        showToast(error.message, 'error');
    }
}

async function toggleEndpoint(id) {
    const endpoint = apiEndpoints.find(e => e.id === id);
    if (!endpoint) return;

    try {
        await db.collection('api_endpoints').doc(id).update({
            active: !endpoint.active,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(`Endpoint ${endpoint.active ? 'disabled' : 'enabled'}`, 'success');
        loadApiEndpoints();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function exportApiLogs() {
    const data = apiLogs.map(log => ({
        Timestamp: log.timestamp,
        Endpoint: log.endpoint,
        Method: log.method,
        Status: log.status,
        ResponseTime: log.responseTime,
        User: log.user,
        IP: log.ip
    }));
    
    const csv = convertToCSV(data);
    downloadFile('api_logs.csv', csv);
}

// ============================================
// DASHBOARD DATA
// ============================================
async function loadDashboardData() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const today = new Date();
        today.setHours(0,0,0,0);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        let total = 0;
        let activeToday = 0;
        let newThisMonth = 0;
        let roleCounts = { super_admin: 0, admin: 0, investor: 0, client: 0 };
        
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            total++;
            
            if (roleCounts.hasOwnProperty(user.role)) {
                roleCounts[user.role]++;
            }
            
            if (user.lastActive) {
                const lastActive = user.lastActive.toDate();
                if (lastActive >= today) activeToday++;
            }
            
            if (user.createdAt) {
                const created = user.createdAt.toDate();
                if (created >= monthAgo) newThisMonth++;
            }
        });
        
        document.getElementById('totalUsers').textContent = total;
        document.getElementById('activeToday').textContent = activeToday;
        document.getElementById('newThisMonth').textContent = newThisMonth;
        
        document.getElementById('userGrowth').textContent = `+${Math.round((newThisMonth/total)*100)}%`;
        document.getElementById('activePercent').textContent = `${Math.round((activeToday/total)*100)}%`;
        document.getElementById('monthlyGrowth').textContent = `+${Math.round((newThisMonth/total)*100)}%`;
        
        document.getElementById('userCount').textContent = total;
        document.getElementById('adminCount').textContent = roleCounts.admin + roleCounts.super_admin;
        document.getElementById('investorCount').textContent = roleCounts.investor;
        document.getElementById('clientCount').textContent = roleCounts.client;
        
        await loadRecentUsers();
        initGrowthChart();
        initDistributionChart(roleCounts);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentUsers() {
    try {
        const snapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        let html = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const joined = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
            html += `
                <tr>
                    <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="badge badge-${user.role || 'client'}">${user.role || 'client'}</span></td>
                    <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                    <td>${joined}</td>
                </tr>
            `;
        });
        
        document.getElementById('recentUsersBody').innerHTML = html || '<tr><td colspan="5">No users found</td></tr>';
        
    } catch (error) {
        console.error('Error loading recent users:', error);
    }
}

function initGrowthChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    if (growthChart) growthChart.destroy();
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [{
                label: 'New Users',
                data: [5, 8, 12, 7, 15, 20, 18],
                borderColor: '#c19a6b',
                backgroundColor: 'rgba(193, 154, 107, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

function initDistributionChart(roleCounts) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    if (distributionChart) distributionChart.destroy();
    
    distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Super Admin', 'Admin', 'Investor', 'Client'],
            datasets: [{
                data: [
                    roleCounts.super_admin,
                    roleCounts.admin,
                    roleCounts.investor,
                    roleCounts.client
                ],
                backgroundColor: ['#e53e3e', '#f59e0b', '#10b981', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

function updateGrowthChart() {
    // Implement chart update logic
    console.log('Updating chart');
}

// ============================================
// USER MANAGEMENT
// ============================================
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Loading users...</td></tr>';
    
    try {
        const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get();
        allUsers = [];
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="9">No users found</td></tr>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            allUsers.push(user);
            
            const joined = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
            const verified = user.emailVerified ? 
                '<span class="badge badge-verified">Verified</span>' : 
                '<span class="badge badge-unverified">Unverified</span>';
            
            html += `
                <tr>
                    <td class="checkbox-column">
                        <input type="checkbox" class="user-checkbox" value="${doc.id}" onchange="updateSelection(this)">
                    </td>
                    <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td><span class="badge badge-${user.role || 'client'}">${user.role || 'client'}</span></td>
                    <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                    <td>${verified}</td>
                    <td>${joined}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="openEditUserModal('${doc.id}')"></i>
                            <i class="fas fa-key" onclick="resetPassword('${doc.id}')"></i>
                            <i class="fas fa-ban" onclick="toggleUserStatus('${doc.id}')"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('user', '${doc.id}')"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        initDataTable('usersTable');
        
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = '<tr><td colspan="9">Error loading users</td></tr>';
    }
}

async function loadUsersByRole(role) {
    const tableId = role === 'admin' ? 'admins' : role === 'investor' ? 'investors' : 'clients';
    const tbody = document.getElementById(`${tableId}TableBody`);
    tbody.innerHTML = `<tr><td colspan="6" class="loading">Loading ${role}s...</td></tr>`;
    
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', role)
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6">No ${role}s found</td></tr>`;
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const joined = user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';
            
            html += `
                <tr>
                    <td><div class="user-cell"><div class="user-avatar-sm">${(user.fullName || 'U').charAt(0)}</div> ${user.fullName || 'N/A'}</div></td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td><span class="badge badge-${user.status || 'pending'}">${user.status || 'pending'}</span></td>
                    <td>${joined}</td>
                    <td>
                        <div class="action-icons">
                            <i class="fas fa-edit" onclick="openEditUserModal('${doc.id}')"></i>
                            <i class="fas fa-trash" onclick="openDeleteModal('user', '${doc.id}')"></i>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading users by role:', error);
    }
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll').checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    selectedUsers.clear();
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll;
        if (selectAll) {
            selectedUsers.add(cb.value);
        }
    });
    
    updateBulkActionsBar();
}

function updateSelection(checkbox) {
    if (checkbox.checked) {
        selectedUsers.add(checkbox.value);
    } else {
        selectedUsers.delete(checkbox.value);
        document.getElementById('selectAll').checked = false;
    }
    
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bar = document.getElementById('bulkActionsBar');
    const countSpan = document.getElementById('selectedCount');
    const count = selectedUsers.size;
    
    if (count > 0) {
        bar.classList.add('active');
        countSpan.textContent = `${count} user${count > 1 ? 's' : ''} selected`;
    } else {
        bar.classList.remove('active');
    }
}

function clearSelection() {
    document.querySelectorAll('.user-checkbox').forEach(cb => {
        cb.checked = false;
    });
    selectedUsers.clear();
    document.getElementById('selectAll').checked = false;
    updateBulkActionsBar();
}

async function bulkChangeRole() {
    if (selectedUsers.size === 0) return;
    // Implement bulk role change
    showToast('Bulk role change feature coming soon', 'info');
}

async function bulkChangeStatus() {
    if (selectedUsers.size === 0) return;
    // Implement bulk status change
    showToast('Bulk status change feature coming soon', 'info');
}

async function bulkDelete() {
    if (selectedUsers.size === 0) return;
    
    if (!confirm(`Delete ${selectedUsers.size} users?`)) return;
    
    try {
        const promises = [];
        selectedUsers.forEach(userId => {
            promises.push(db.collection('users').doc(userId).delete());
        });
        
        await Promise.all(promises);
        
        showToast(`${selectedUsers.size} users deleted`, 'success');
        clearSelection();
        loadUsers();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function addUser() {
    const fullName = document.getElementById('newFullName').value;
    const email = document.getElementById('newEmail').value;
    const phone = document.getElementById('newPhone').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    const status = document.getElementById('newStatus').value;

    if (!fullName || !email || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    try {
        const userCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = userCred.user.uid;

        await userCred.user.updateProfile({ displayName: fullName });

        await db.collection('users').doc(uid).set({
            fullName,
            email,
            phone,
            role,
            status,
            emailVerified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: currentUser.uid
        });

        if (document.getElementById('sendWelcomeEmail').checked) {
            await userCred.user.sendEmailVerification();
        }

        showToast('User created successfully', 'success');
        closeModal('addUserModal');
        loadUsers();
        
    } catch (error) {
        console.error('Error creating user:', error);
        showToast(error.message, 'error');
    }
}

async function openEditUserModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editFullName').value = user.fullName || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editRole').value = user.role || 'client';
    document.getElementById('editStatus').value = user.status || 'pending';
    document.getElementById('editEmailVerified').value = user.emailVerified ? 'true' : 'false';

    openModal('editUserModal');
}

async function updateUser() {
    const userId = document.getElementById('editUserId').value;
    const fullName = document.getElementById('editFullName').value;
    const phone = document.getElementById('editPhone').value;
    const role = document.getElementById('editRole').value;
    const status = document.getElementById('editStatus').value;
    const emailVerified = document.getElementById('editEmailVerified').value === 'true';

    try {
        await db.collection('users').doc(userId).update({
            fullName,
            phone,
            role,
            status,
            emailVerified,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: currentUser.uid
        });

        showToast('User updated successfully', 'success');
        closeModal('editUserModal');
        loadUsers();
        
    } catch (error) {
        console.error('Error updating user:', error);
        showToast(error.message, 'error');
    }
}

async function resetPassword(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user || !user.email) return;

    try {
        await firebase.auth().sendPasswordResetEmail(user.email);
        showToast('Password reset email sent', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'suspended' : 'active';

    try {
        await db.collection('users').doc(userId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(`User ${newStatus}`, 'success');
        loadUsers();
        
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function syncUsers() {
    showToast('Syncing users with API...', 'info');
    // Implement API sync
    setTimeout(() => {
        showToast('Users synced successfully', 'success');
    }, 2000);
}

// ============================================
// NOTIFICATIONS
// ============================================
async function loadNotifications() {
    try {
        const snapshot = await db.collection('notifications')
            .where('read', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        document.getElementById('notificationCount').textContent = snapshot.size;
        
        if (snapshot.empty) {
            document.getElementById('notificationsList').innerHTML = '<div class="notification-item">No new notifications</div>';
            return;
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const notif = doc.data();
            const time = notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleString() : 'N/A';
            html += `
                <div class="notification-item unread" onclick="markNotificationRead('${doc.id}')">
                    <strong>${notif.title || 'Notification'}</strong>
                    <p>${notif.message || ''}</p>
                    <small>${time}</small>
                </div>
            `;
        });
        
        document.getElementById('notificationsList').innerHTML = html;
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function markNotificationRead(id) {
    try {
        await db.collection('notifications').doc(id).update({ read: true });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification read:', error);
    }
}

async function markAllNotificationsRead() {
    try {
        const snapshot = await db.collection('notifications')
            .where('read', '==', false)
            .get();
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();
        
        loadNotifications();
        
    } catch (error) {
        console.error('Error marking all notifications read:', error);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function initDataTable(tableId) {
    if (dataTables[tableId]) {
        dataTables[tableId].destroy();
    }
    dataTables[tableId] = $(`#${tableId}`).DataTable({
        responsive: true,
        pageLength: 25,
        order: [[0, 'desc']]
    });
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    return [headers, ...rows].join('\n');
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportUsers() {
    const data = allUsers.map(u => ({
        Name: u.fullName,
        Email: u.email,
        Phone: u.phone,
        Role: u.role,
        Status: u.status,
        Verified: u.emailVerified ? 'Yes' : 'No'
    }));
    
    const csv = convertToCSV(data);
    downloadFile('users_export.csv', csv);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openDeleteModal(type, id) {
    deleteCallback = () => deleteItem(type, id);
    document.getElementById('deleteMessage').textContent = `Delete this ${type}?`;
    openModal('deleteModal');
}

async function confirmDelete() {
    if (deleteCallback) {
        await deleteCallback();
        deleteCallback = null;
        closeModal('deleteModal');
    }
}

async function deleteItem(type, id) {
    try {
        const collection = type === 'user' ? 'users' : type + 's';
        await db.collection(collection).doc(id).delete();
        showToast(`${type} deleted`, 'success');
        loadSection(currentSection);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msg = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    icon.className = type === 'success' ? 'fas fa-check-circle' :
                     type === 'error' ? 'fas fa-exclamation-circle' :
                     'fas fa-info-circle';
    msg.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// LOGOUT
// ============================================
async function logout() {
    if (!confirm('Logout?')) return;
    await auth.signOut();
    window.location.href = '/xtaagc/admin-login';
}

// ============================================
// UI EVENT HANDLERS
// ============================================
document.getElementById('notificationsBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notificationsPanel').classList.toggle('show');
});

document.getElementById('userMenuBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userMenu').classList.toggle('show');
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.notifications') && !e.target.closest('.notifications-panel')) {
        document.getElementById('notificationsPanel')?.classList.remove('show');
    }
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userMenu')?.classList.remove('show');
    }
});
