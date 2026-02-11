// admin/js/utils.js
export class Utils {
    static formatDate(date) {
        if (!date) return 'N/A';
        
        const d = date.toDate ? date.toDate() : new Date(date);
        
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatDateShort(date) {
        if (!date) return 'N/A';
        
        const d = date.toDate ? date.toDate() : new Date(date);
        
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#4299e1'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    static confirmAction(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'confirm-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <p>${message}</p>
                    <div class="modal-buttons">
                        <button class="btn-cancel">Cancel</button>
                        <button class="btn-confirm">Confirm</button>
                    </div>
                </div>
            `;
            
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            
            modal.querySelector('.modal-content').style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 400px;
                width: 90%;
            `;
            
            modal.querySelector('.modal-buttons').style.cssText = `
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            `;
            
            modal.querySelector('.btn-cancel').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(false);
            });
            
            modal.querySelector('.btn-confirm').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(true);
            });
            
            document.body.appendChild(modal);
        });
    }
}
