// /assets/js/staff.js
const STAFF = {
    version: '1.0.0',
    
    // Generate Service Number Format: DEPT001/MM/YYYY
    generateServiceNumber: function(department, employeeId = '001') {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return `${department}${employeeId}/${month}/${year}`;
    },
    
    // Parse Service Number
    parseServiceNumber: function(serviceNumber) {
        const parts = serviceNumber.split('/');
        if (parts.length === 3) {
            const deptPart = parts[0];
            const month = parts[1];
            const year = parts[2];
            
            // Extract department code and employee ID
            const deptCode = deptPart.replace(/[0-9]/g, '');
            const empId = deptPart.replace(/[^0-9]/g, '');
            
            return {
                departmentCode: deptCode,
                employeeId: empId,
                month: month,
                year: year,
                full: serviceNumber
            };
        }
        return null;
    },
    
    // Get Department Name from Code
    getDepartmentName: function(code) {
        const departments = {
            'ADM': 'Administration',
            'HR': 'Human Resources',
            'FIN': 'Finance',
            'IT': 'Information Technology',
            'MKT': 'Marketing',
            'OPS': 'Operations',
            'SAL': 'Sales',
            'SUP': 'Support',
            'DEV': 'Development',
            'ACC': 'Accounting',
            'LEG': 'Legal',
            'CS': 'Customer Service'
        };
        return departments[code] || 'Unknown Department';
    },
    
    // Get Next Employee ID for Department
    getNextEmployeeId: async function(departmentCode) {
        const db = firebase.firestore();
        const snapshot = await db.collection('staff')
            .where('departmentCode', '==', departmentCode)
            .get();
        
        const count = snapshot.size + 1;
        return String(count).padStart(3, '0');
    },
    
    // Login with Service Number
    login: async function(serviceNumber, password) {
        try {
            // Find staff by service number
            const db = firebase.firestore();
            const snapshot = await db.collection('staff')
                .where('serviceNumber', '==', serviceNumber)
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                return { success: false, error: 'Invalid service number' };
            }
            
            const staffData = snapshot.docs[0].data();
            const email = staffData.email;
            
            // Login with email and password
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            
            // Update last login
            await db.collection('staff').doc(snapshot.docs[0].id).update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { 
                success: true, 
                user: userCredential.user,
                staffData: staffData
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },
    
    // Get Staff by Service Number
    getStaffByServiceNumber: async function(serviceNumber) {
        const db = firebase.firestore();
        const snapshot = await db.collection('staff')
            .where('serviceNumber', '==', serviceNumber)
            .limit(1)
            .get();
        
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    
    // Check if user is Head of Department
    isHeadOfDepartment: function(staffData) {
        return staffData.role === 'hod' || staffData.isHeadOfDepartment === true;
    },
    
    // Format Date
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Show Toast
    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderLeft: `4px solid ${type === 'success' ? '#10b981' : '#c19a6b'}`,
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        });
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};
