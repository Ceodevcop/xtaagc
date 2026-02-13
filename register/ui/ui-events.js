// register/ui/ui-events.js
import { uiPassword } from './ui-password.js';
import { uiValidation } from './ui-validation.js';
import { companyRegister } from '../register-company.js';
import { individualRegister } from '../register-individual.js';

export class UIEvents {
    // Setup company form listeners
    setupCompanyFormListeners() {
        this.setupCompanyTypeSelection();
        this.setupCompanyPasswordListeners();
        this.setupCompanyFormValidation();
        this.setupCompanyFormSubmission();
    }
    
    // Setup company type selection
    setupCompanyTypeSelection() {
        document.querySelectorAll('[data-company-type]').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('[data-company-type]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }
    
    // Setup company password listeners
    setupCompanyPasswordListeners() {
        const passwordInput = document.getElementById('companyPassword');
        const confirmInput = document.getElementById('companyConfirmPassword');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                uiPassword.updatePasswordStrength('companyPassword', 'companyPasswordStrength');
                uiPassword.checkPasswordMatch(passwordInput, confirmInput, 'companyConfirmError');
            });
        }
        
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                uiPassword.checkPasswordMatch(passwordInput, confirmInput, 'companyConfirmError');
            });
        }
    }
    
    // Setup company form validation
    setupCompanyFormValidation() {
        uiValidation.setupRealTimeValidation('companyRegisterForm');
    }
    
    // Setup company form submission
    setupCompanyFormSubmission() {
        const form = document.getElementById('companyRegisterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                companyRegister.submit();
            });
        }
    }
    
    // Setup individual form listeners
    setupIndividualFormListeners() {
        this.setupIndividualTypeSelection();
        this.setupIndividualPasswordListeners();
        this.setupIndividualFormValidation();
        this.setupIndividualFormSubmission();
        this.setupAgeValidation();
    }
    
    // Setup individual type selection
    setupIndividualTypeSelection() {
        document.querySelectorAll('[data-individual-type]').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('[data-individual-type]').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }
    
    // Setup individual password listeners
    setupIndividualPasswordListeners() {
        const passwordInput = document.getElementById('individualPassword');
        const confirmInput = document.getElementById('individualConfirmPassword');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                uiPassword.updatePasswordStrength('individualPassword', 'individualPasswordStrength');
                uiPassword.checkPasswordMatch(passwordInput, confirmInput, 'individualConfirmError');
            });
        }
        
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                uiPassword.checkPasswordMatch(passwordInput, confirmInput, 'individualConfirmError');
            });
        }
    }
    
    // Setup individual form validation
    setupIndividualFormValidation() {
        uiValidation.setupRealTimeValidation('individualRegisterForm');
    }
    
    // Setup individual form submission
    setupIndividualFormSubmission() {
        const form = document.getElementById('individualRegisterForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                individualRegister.submit();
            });
        }
    }
    
    // Setup age validation
    setupAgeValidation() {
        const dobInput = document.getElementById('dob');
        if (dobInput) {
            dobInput.addEventListener('change', () => {
                uiValidation.validateAge(dobInput);
            });
        }
    }
}

export const uiEvents = new UIEvents();
