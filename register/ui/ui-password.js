// register/ui/ui-password.js
import { validator } from '../register-validation.js';

export class UIPassword {
    // Update password strength display
    updatePasswordStrength(passwordId, strengthId) {
        const password = document.getElementById(passwordId)?.value;
        if (!password) return;
        
        const strength = validator.checkPasswordStrength(password);
        const container = document.getElementById(strengthId);
        if (!container) return;
        
        container.innerHTML = this.getStrengthHTML(strength);
    }
    
    // Get strength HTML
    getStrengthHTML(strength) {
        return `
            <div class="strength-bar">
                <div class="strength-bar-fill ${strength.strength}" style="width: ${strength.percentage}%;"></div>
            </div>
            <div class="strength-text ${strength.strength}">
                <i class="fas fa-${strength.score >= 3 ? 'check-circle' : 'exclamation-circle'}"></i>
                Password strength: ${strength.strength.replace('-', ' ')}
            </div>
            <div style="font-size: 11px; margin-top: 8px; color: #64748b;">
                ${strength.feedback.join(' • ')}
            </div>
        `;
    }
    
    // Check if passwords match
    checkPasswordMatch(passwordInput, confirmInput, errorId) {
        const errorDiv = document.getElementById(errorId);
        if (!errorDiv || !passwordInput || !confirmInput) return;
        
        if (confirmInput.value && passwordInput.value !== confirmInput.value) {
            this.showPasswordMismatch(confirmInput, errorDiv);
        } else if (confirmInput.value) {
            this.showPasswordMatch(confirmInput, errorDiv);
        } else {
            this.clearPasswordError(confirmInput, errorDiv);
        }
    }
    
    // Show password mismatch
    showPasswordMismatch(input, errorDiv) {
        errorDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Passwords do not match';
        errorDiv.className = 'form-text error';
        input.classList.add('error');
        input.classList.remove('valid');
    }
    
    // Show password match
    showPasswordMatch(input, errorDiv) {
        errorDiv.innerHTML = '<i class="fas fa-check-circle"></i> Passwords match';
        errorDiv.className = 'form-text success';
        input.classList.add('valid');
        input.classList.remove('error');
    }
    
    // Clear password error
    clearPasswordError(input, errorDiv) {
        errorDiv.innerHTML = '';
        input.classList.remove('error', 'valid');
    }
}

export const uiPassword = new UIPassword();
