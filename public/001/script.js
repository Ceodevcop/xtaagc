// ===== GOD MODE SCRIPT =====

// GOD CODE - Only these credentials work
const GOD_CREDENTIALS = {
    ADMIN_ID: 'GOD-ADMIN-001',
    GOD_CODE: '7777-9999-8888'
};

// ===== LOGIN FUNCTIONALITY =====
document.getElementById('godLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const adminId = document.getElementById('adminId').value.trim();
    const godCode = document.getElementById('godCode').value.trim();
    const alertDiv = document.getElementById('loginAlert');
    const loginBtn = document.getElementById('loginBtn');
    
    // Validate inputs
    if (!adminId || !godCode) {
        showAlert('❌ ALL FIELDS REQUIRED', 'error');
        return;
    }
    
    // Check credentials
    if (adminId === GOD_CREDENTIALS.ADMIN_ID && godCode === GOD_CREDENTIALS.GOD_CODE) {
        // Success - Enter God Mode
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ACCESSING GOD MODE...';
        
        setTimeout(() => {
            // Hide login, show dashboard
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('dashboardPage').style.display = 'block';
            
            // Set admin info
            document.getElementById('displayAdminId').textContent = adminId;
            
            // Initialize dashboard
            initializeDashboard();
            
            // Log access
            addActivityLog('🔐 GOD MODE ACCESSED', adminId);
            
        }, 1500);
        
    } else {
        // Failed attempt
        showAlert('❌ ACCESS DENIED - INVALID CREDENTIALS', 'error');
        
        // Shake animation
        document.querySelector('.login-box').style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.querySelector('.login-box').style.animation = '';
        }, 500);
    }
});

// Shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

function showAlert(message, type) {
    const alert = document.getElementById('loginAlert');
    alert.className = `login-alert ${type}`;
    alert.innerHTML = message;
}

// ===== DASHBOARD FUNCTIONS =====
function initializeDashboard() {
    loadUsers();
    loadInvestors();
    loadTransactions();
    initCharts();
    updateStats();
}

// Show different sections
window.showSection = function(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').classList.add('active');
    
    // Update active state on buttons (optional)
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.style.background = '';
    });
};

// ===== LOAD MOCK DATA =====
function loadUsers() {
    const users = [
        { id: 'U001', name: 'John Doe', email: 'john@example.com', role: 'investor', status: 'active', joined: '2025-03-15' },
        { id: 'U002', name: 'Jane Smith', email: 'jane@example.com', role: 'client', status: 'active', joined: '2025-03-14' },
        { id: 'U003', name: 'Robert Johnson', email: 'robert@example.com', role: 'investor', status: 'pending', joined: '2025-03-13' },
        { id: 'U004', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'admin', status: 'active', joined: '2025-03-12' },
        { id: 'U005', name: 'Michael Brown', email: 'michael@example.com', role: 'client', status: 'suspended', joined: '2025-03-11' }
    ];
    
    let html = '';
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge" style="background: ${getRoleColor(user.role)}20; color: ${getRoleColor(user.role)}">${user.role}</span></td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${user.joined}</td>
                <td>
                    <button class="action-icon" onclick="editUser('${user.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-icon" onclick="viewUser('${user.id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-icon" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('usersTableBody').innerHTML = html;
}

function getRoleColor(role) {
    const colors = {
        'investor': '#00ff88',
        'client': '#3399ff',
        'admin': '#ffd700'
    };
    return colors[role] || '#ffffff';
}

function loadInvestors() {
    const investors = [
        { id: 'Ti001', name: 'John Doe', invested: '$250,000', profit: '$37,500', roi: '15%', status: 'active' },
        { id: 'Ti002', name: 'Robert Johnson', invested: '$500,000', profit: '$87,500', roi: '17.5%', status: 'active' },
        { id: 'Ti003', name: 'Michael Brown', invested: '$125,000', profit: '$15,625', roi: '12.5%', status: 'pending' }
    ];
    
    let html = '';
    investors.forEach(inv => {
        html += `
            <tr>
                <td>${inv.id}</td>
                <td>${inv.name}</td>
                <td>${inv.invested}</td>
                <td style="color: #00ff88">${inv.profit}</td>
                <td style="color: #ffd700">${inv.roi}</td>
                <td><span class="status-badge ${inv.status}">${inv.status}</span></td>
            </tr>
        `;
    });
    
    document.getElementById('investorsTableBody').innerHTML = html;
}

function loadTransactions() {
    const transactions = [
        { id: 'TX001', user: 'John Doe', type: 'DEPOSIT', amount: '+$50,000', status: 'completed', date: '2025-03-15' },
        { id: 'TX002', user: 'Jane Smith', type: 'WITHDRAWAL', amount: '-$12,500', status: 'pending', date: '2025-03-15' },
        { id: 'TX003', user: 'Robert Johnson', type: 'INVESTMENT', amount: '$25,000', status: 'completed', date: '2025-03-14' }
    ];
    
    let html = '';
    transactions.forEach(tx => {
        const amountColor = tx.amount.startsWith('+') ? '#00ff88' : tx.amount.startsWith('-') ? '#ff3333' : '#ffd700';
        html += `
            <tr>
                <td>${tx.id}</td>
                <td>${tx.user}</td>
                <td>${tx.type}</td>
                <td style="color: ${amountColor}">${tx.amount}</td>
                <td><span class="status-badge ${tx.status}">${tx.status}</span></td>
                <td>${tx.date}</td>
            </tr>
        `;
    });
    
    document.getElementById('transactionsTableBody').innerHTML = html;
}

// ===== CHARTS =====
function initCharts() {
    // User Growth Chart
    const userCtx = document.getElementById('userChart')?.getContext('2d');
    if (userCtx) {
        new Chart(userCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'New Users',
                    data: [65, 78, 92, 110, 98, 120, 145],
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffd700'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#888' }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#333' },
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    }

    // Profit Chart
    const profitCtx = document.getElementById('profitChart')?.getContext('2d');
    if (profitCtx) {
        new Chart(profitCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Profit ($)',
                    data: [12400, 18900, 22300, 18900],
                    backgroundColor: '#ffd700',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#888' }
                    }
                },
                scales: {
                    y: {
                        grid: { color: '#333' },
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    }
}

// ===== STATS UPDATE =====
function updateStats() {
    // Animate stats
    animateValue('totalUsers', 1337);
    animateValue('activeUsers', 42);
    animateValue('totalFunds', 2500000, true);
    animateValue('todayProfit', 12400, true);
}

function animateValue(elementId, target, isCurrency = false) {
    const element = document.getElementById(elementId);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = isCurrency ? `$${target.toLocaleString()}` : Math.floor(target).toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = isCurrency ? `$${Math.floor(current).toLocaleString()}` : Math.floor(current).toLocaleString();
        }
    }, 20);
}

// ===== ACTIVITY LOG =====
function addActivityLog(action, user) {
    const logList = document.getElementById('activityLog');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-action">${action}</span>
        <span class="log-user">@${user}</span>
    `;
    
    logList.insertBefore(logItem, logList.firstChild);
    
    // Keep only last 10 logs
    if (logList.children.length > 10) {
        logList.removeChild(logList.lastChild);
    }
}

// ===== USER ACTIONS =====
window.editUser = function(userId) {
    alert(`✏️ EDITING USER: ${userId}`);
    addActivityLog(`✏️ Editing user ${userId}`, 'GOD');
};

window.viewUser = function(userId) {
    alert(`👁️ VIEWING USER: ${userId}`);
};

window.deleteUser = function(userId) {
    if (confirm(`⚠️ DELETE USER ${userId}? THIS ACTION CANNOT BE UNDONE`)) {
        alert(`❌ USER ${userId} DELETED`);
        addActivityLog(`❌ Deleted user ${userId}`, 'GOD');
    }
};

window.addUser = function() {
    alert('➕ ADD NEW USER FORM WOULD OPEN HERE');
};

// ===== SEARCH FUNCTIONALITY =====
document.getElementById('userSearch')?.addEventListener('input', function(e) {
    const search = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
    });
});

// ===== LOGOUT =====
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('⚠️ EXIT GOD MODE?')) {
        document.getElementById('dashboardPage').style.display = 'none';
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('godLoginForm').reset();
        document.getElementById('loginBtn').disabled = false;
        document.getElementById('loginBtn').innerHTML = '<span>ACCESS GOD MODE</span><i class="fas fa-crown"></i>';
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + G = God Mode (from login)
    if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        document.getElementById('adminId').value = GOD_CREDENTIALS.ADMIN_ID;
        document.getElementById('godCode').value = GOD_CREDENTIALS.GOD_CODE;
    }
    
    // Esc = Emergency exit
    if (e.key === 'Escape' && document.getElementById('dashboardPage').style.display === 'block') {
        if (confirm('⚠️ EMERGENCY EXIT?')) {
            document.getElementById('logoutBtn').click();
        }
    }
});

// ===== INITIAL CHECK =====
// Check if already logged in (session storage)
if (sessionStorage.getItem('godMode')) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    initializeDashboard();
}

// Save session on login
const originalLogin = document.getElementById('godLoginForm').onsubmit;
document.getElementById('godLoginForm').onsubmit = function(e) {
    e.preventDefault();
    // ... existing login code ...
    sessionStorage.setItem('godMode', 'true');
};
