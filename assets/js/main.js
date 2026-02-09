// Main JavaScript for TAAGC Website
import { 
    auth, 
    db, 
    DB_COLLECTIONS,
    onAuthStateChanged,
    signOut,
    getFirebaseErrorMessage
} from '../config/firebase-config.js';

import { initializeNavigation } from './navigation.js';
import { initializeTestimonials } from './testimonials.js';
import { initializeContactForm } from './contact.js';
import { initializeAuth } from './auth.js';

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('TAAGC Website Initializing...');
    
    // Initialize all modules
    initializeNavigation();
    initializeTestimonials();
    initializeContactForm();
    initializeAuth();
    
    // Initialize current year in footer
    initializeCurrentYear();
    
    // Initialize back to top button
    initializeBackToTop();
    
    // Initialize smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Initialize form validation styles
    initializeFormValidation();
    
    // Initialize lazy loading for images
    initializeLazyLoading();
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    console.log('TAAGC Website Initialized Successfully');
});

// Initialize current year in footer
function initializeCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize back to top button
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Initialize smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - headerHeight,
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Initialize form validation styles
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add validation styling on blur
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            // Remove error styling on input
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    const errorElement = this.parentElement.querySelector('.form-error');
                    if (errorElement) {
                        errorElement.style.display = 'none';
                    }
                }
            });
        });
        
        // Custom validation for email fields
        const emailInputs = form.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    showInputError(this, 'Please enter a valid email address.');
                }
            });
        });
    });
}

// Validate individual input
function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
        showInputError(input, 'This field is required.');
        return false;
    }
    
    if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
        showInputError(input, 'Please enter a valid email address.');
        return false;
    }
    
    if (input.type === 'tel' && input.value && !isValidPhone(input.value)) {
        showInputError(input, 'Please enter a valid phone number.');
        return false;
    }
    
    // Clear any existing error
    clearInputError(input);
    return true;
}

// Show input error
function showInputError(input, message) {
    input.classList.add('error');
    
    let errorElement = input.parentElement.querySelector('.form-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        input.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Clear input error
function clearInputError(input) {
    input.classList.remove('error');
    
    const errorElement = input.parentElement.querySelector('.form-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation (basic)
function isValidPhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)\.]/g, ''));
}

// Initialize lazy loading for images
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Toast notification system
class Toast {
    static show(message, type = 'info', duration = 5000) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <p>${message}</p>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }
    
    static success(message, duration = 5000) {
        this.show(message, 'success', duration);
    }
    
    static error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }
    
    static info(message, duration = 5000) {
        this.show(message, 'info', duration);
    }
}

// Export Toast for use in other modules
window.TAAGC = window.TAAGC || {};
window.TAAGC.Toast = Toast;

// Performance monitoring
window.addEventListener('load', () => {
    // Log page load performance
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page loaded in ${pageLoadTime}ms`);
    }
    
    // Service Worker registration (if using PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
});

// Error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Send error to analytics if configured
    if (window.gtag) {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Export for use in other modules
export { 
    validateInput, 
    showInputError, 
    clearInputError,
    isValidEmail,
    isValidPhone
};
