// register/ui/ui-main.js
import { uiForms } from './ui-forms.js';
import { uiEvents } from './ui-events.js';
import { uiBenefits } from './ui-benefits.js';
import { Notifications } from '../../components/notifications.js';

export class UIMain {
    constructor() {
        this.currentType = 'company';
        this.formData = {};
    }
    
    // Initialize UI
    init() {
        this.setupTypeSelector();
        uiBenefits.setupBenefits();
        uiBenefits.setupFAQ();
        this.loadInitialForm();
    }
    
    // Setup type selector
    setupTypeSelector() {
        document.querySelectorAll('.type-selector-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchFormType(type);
            });
        });
    }
    
    // Switch between company and individual forms
    switchFormType(type) {
        this.currentType = type;
        
        // Update active button
        document.querySelectorAll('.type-selector-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Load appropriate form
        this.loadForm(type);
        
        // Update benefits
        uiBenefits.updateBenefitsForType(type);
    }
    
    // Load initial form
    loadInitialForm() {
        this.loadForm('company');
    }
    
    // Load form by type
    loadForm(type) {
        const container = document.getElementById('formContainer');
        
        if (type === 'company') {
            container.innerHTML = uiForms.getCompanyFormHTML();
            uiEvents.setupCompanyFormListeners();
        } else {
            container.innerHTML = uiForms.getIndividualFormHTML();
            uiEvents.setupIndividualFormListeners();
        }
    }
    
    // Show error on field
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (field && errorDiv) {
            field.classList.add('error');
            field.classList.remove('valid');
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            errorDiv.className = 'form-text error';
        }
    }
    
    // Clear field error
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (field && errorDiv) {
            field.classList.remove('error');
            errorDiv.innerHTML = '';
        }
    }
    
    // Show global error
    showError(message) {
        Notifications.error(message);
    }
    
    // Show success message
    showSuccess(message) {
        Notifications.success(message);
    }
}

export const uiMain = new UIMain();
