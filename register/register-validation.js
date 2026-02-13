// register/register-validation.js
export class RegisterValidator {
    constructor() {
        this.errors = {};
        this.rules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            companyEmail: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                validate: this.validateCompanyDomain.bind(this),
                message: 'Please use your company email domain'
            },
            password: {
                required: true,
                minLength: 8,
                message: 'Password must be at least 8 characters'
            },
            phone: {
                required: true,
                pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                message: 'Please enter a valid phone number'
            },
            companyName: {
                required: true,
                minLength: 2,
                message: 'Company name is required'
            },
            registrationNumber: {
                required: true,
                minLength: 3,
                message: 'Registration number is required'
            },
            fullName: {
                required: true,
                minLength: 2,
                message: 'Full name is required'
            },
            idNumber: {
                required: true,
                minLength: 3,
                message: 'ID number is required'
            },
            age: {
                required: true,
                validate: this.validateAge.bind(this),
                message: 'You must be at least 18 years old'
            }
        };
    }
    
    // Validate form data
    validate(formData, rules) {
        this.errors = {};
        
        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const rule = rules[field];
            
            if (rule.required && !value) {
                this.addError(field, `${field} is required`);
                return;
            }
            
            if (value) {
                if (rule.minLength && value.length < rule.minLength) {
                    this.addError(field, rule.message || `Minimum ${rule.minLength} characters required`);
                }
                
                if (rule.pattern && !rule.pattern.test(value)) {
                    this.addError(field, rule.message);
                }
                
                if (rule.validate && !rule.validate(value, formData)) {
                    this.addError(field, rule.message);
                }
            }
        });
        
        return {
            isValid: Object.keys(this.errors).length === 0,
            errors: this.errors
        };
    }
    
    // Add error message
    addError(field, message) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push(message);
    }
    
    // Get error for field
    getError(field) {
        return this.errors[field] ? this.errors[field][0] : null;
    }
    
    // Validate company domain (no personal emails)
    validateCompanyDomain(email) {
        const personalDomains = [
            '@gmail.com', '@yahoo.com', '@hotmail.com', '@outlook.com',
            '@aol.com', '@icloud.com', '@mail.com', '@protonmail.com',
            '@yandex.com', '@live.com', '@msn.com', '@ymail.com'
        ];
        const lowerEmail = email.toLowerCase();
        return !personalDomains.some(domain => lowerEmail.includes(domain));
    }
    
    // Validate age (18+)
    validateAge(dob, formData) {
        if (!dob) return false;
        
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    }
    
    // Password strength meter
    checkPasswordStrength(password) {
        let score = 0;
        const feedback = [];
        
        if (password.length >= 8) {
            score += 1;
            feedback.push('✓ Length OK');
        } else {
            feedback.push('✗ Too short');
        }
        
        if (/[a-z]/.test(password)) {
            score += 1;
            feedback.push('✓ Has lowercase');
        } else {
            feedback.push('✗ Add lowercase');
        }
        
        if (/[A-Z]/.test(password)) {
            score += 1;
            feedback.push('✓ Has uppercase');
        } else {
            feedback.push('✗ Add uppercase');
        }
        
        if (/[0-9]/.test(password)) {
            score += 1;
            feedback.push('✓ Has number');
        } else {
            feedback.push('✗ Add number');
        }
        
        if (/[^a-zA-Z0-9]/.test(password)) {
            score += 1;
            feedback.push('✓ Has special character');
        } else {
            feedback.push('✗ Add special character');
        }
        
        let strength = 'weak';
        let color = 'var(--danger)';
        
        if (score <= 2) {
            strength = 'weak';
            color = 'var(--danger)';
        } else if (score <= 3) {
            strength = 'medium';
            color = 'var(--warning)';
        } else if (score <= 4) {
            strength = 'strong';
            color = '#4299e1';
        } else {
            strength = 'very-strong';
            color = 'var(--success)';
        }
        
        return {
            score,
            strength,
            color,
            feedback,
            percentage: (score / 5) * 100
        };
    }
    
    // Validate password match
    passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }
}

export const validator = new RegisterValidator();
