// register/ui/ui-validation.js
import { validator } from '../register-validation.js';

export class UIValidation {
    // Setup real-time validation for all fields
    setupRealTimeValidation(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }
    
    // Validate single field
    validateField(input) {
        const fieldId = input.id;
        const value = input.value;
        const errorDiv = document.getElementById(fieldId + 'Error');
        
        if (!errorDiv) return true;
        
        if (input.required && !value) {
            this.showFieldError(input, errorDiv, 'This field is required');
            return false;
        }
        
        if (value) {
            this.showFieldValid(input, errorDiv);
            return true;
        }
        
        return true;
    }
    
    // Validate age
    validateAge(dobInput) {
        const dob = dobInput.value;
        const errorDiv = document.getElementById('dobError');
        
        if (!dob) return false;
        
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 18) {
            this.showFieldError(dobInput, errorDiv, 'You must be at least 18 years old');
            return false;
        } else {
            this.showFieldValid(dobInput, errorDiv, 'Age verified');
            return true;
        }
    }
    
    // Show field error
    showFieldError(field, errorDiv, message) {
        field.classList.add('error');
        field.classList.remove('valid');
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.className = 'form-text error';
    }
    
    // Show field valid
    showFieldValid(field, errorDiv, message = 'Valid') {
        field.classList.remove('error');
        field.classList.add('valid');
        errorDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        errorDiv.className = 'form-text success';
    }
}

export const uiValidation = new UIValidation();
