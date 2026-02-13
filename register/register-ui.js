// register/register-ui.js
import { validator } from './register-validation.js';
import { Notifications } from '../components/notifications.js';

export class RegisterUI {
    constructor() {
        this.currentType = 'company';
        this.formData = {};
        this.passwordStrengthInterval = null;
    }
    
    // Initialize UI
    init() {
        this.setupTypeSelector();
        this.setupBenefits();
        this.setupFAQ();
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
        if (type === 'company') {
            this.loadCompanyForm();
        } else {
            this.loadIndividualForm();
        }
        
        // Update benefits
        this.updateBenefitsForType(type);
    }
    
    // Load company registration form
    loadCompanyForm() {
        const container = document.getElementById('formContainer');
        container.innerHTML = this.getCompanyFormHTML();
        this.setupCompanyFormListeners();
    }
    
    // Load individual registration form
    loadIndividualForm() {
        const container = document.getElementById('formContainer');
        container.innerHTML = this.getIndividualFormHTML();
        this.setupIndividualFormListeners();
    }
    
    // Get company form HTML
    getCompanyFormHTML() {
        return `
            <div class="register-form">
                <div class="domain-verification">
                    <div class="domain-icon"><i class="fas fa-globe"></i></div>
                    <div class="domain-text">
                        <strong>Company Email Required</strong>
                        <span>Personal emails (@gmail, @yahoo, @hotmail) are NOT accepted</span>
                    </div>
                    <div class="domain-badge">
                        <i class="fas fa-check-circle"></i> Verified Only
                    </div>
                </div>
                
                <div class="account-type-grid" id="companyTypeGrid">
                    <div class="account-type-card active" data-company-type="client">
                        <div class="account-type-icon"><i class="fas fa-shopping-cart"></i></div>
                        <div class="account-type-title">Client</div>
                        <div class="account-type-desc">Procurement & Services</div>
                    </div>
                    <div class="account-type-card" data-company-type="investor">
                        <div class="account-type-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="account-type-title">Investor</div>
                        <div class="account-type-desc">$1M+ Investment</div>
                    </div>
                    <div class="account-type-card" data-company-type="partner">
                        <div class="account-type-icon"><i class="fas fa-handshake"></i></div>
                        <div class="account-type-title">Partner</div>
                        <div class="account-type-desc">Strategic Alliance</div>
                    </div>
                </div>
                
                <form id="companyRegisterForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-building"></i> Company Name</label>
                            <div class="input-wrapper">
                                <i class="fas fa-building input-icon"></i>
                                <input type="text" class="form-control" id="companyName" placeholder="Legal entity name" required>
                            </div>
                            <div class="form-text" id="companyNameError"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-file-certificate"></i> Registration Number</label>
                            <div class="input-wrapper">
                                <i class="fas fa-qrcode input-icon"></i>
                                <input type="text" class="form-control" id="registrationNumber" placeholder="CAC / RC / DUNS" required>
                            </div>
                            <div class="form-text" id="registrationNumberError"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-envelope"></i> Business Email</label>
                            <div class="input-wrapper">
                                <i class="fas fa-envelope input-icon"></i>
                                <input type="email" class="form-control" id="companyEmail" placeholder="contact@company.com" required>
                            </div>
                            <div class="form-text" id="companyEmailError"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-phone"></i> Phone Number</label>
                            <div class="input-wrapper">
                                <i class="fas fa-phone input-icon"></i>
                                <input type="tel" class="form-control" id="companyPhone" placeholder="+234 800 000 0000" required>
                            </div>
                            <div class="form-text" id="companyPhoneError"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-map-marker-alt"></i> Country</label>
                            <div class="input-wrapper">
                                <i class="fas fa-globe input-icon"></i>
                                <select class="form-control" id="companyCountry" required>
                                    <option value="">Select country</option>
                                    <option value="Nigeria">Nigeria</option>
                                    <option value="Ghana">Ghana</option>
                                    <option value="Kenya">Kenya</option>
                                    <option value="South Africa">South Africa</option>
                                    <option value="UAE">UAE</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="USA">United States</option>
                                    <option value="Canada">Canada</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-cubes"></i> Primary Sector</label>
                            <div class="input-wrapper">
                                <i class="fas fa-industry input-icon"></i>
                                <select class="form-control" id="companySector" required>
                                    <option value="">Select sector</option>
                                    <option value="agriculture">Agriculture</option>
                                    <option value="grain">Grain Processing</option>
                                    <option value="ict">ICT / Technology</option>
                                    <option value="contracts">Infrastructure</option>
                                    <option value="merchandise">Trade / Merchandise</option>
                                    <option value="finance">Finance / Investment</option>
                                    <option value="energy">Energy</option>
                                    <option value="logistics">Logistics</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-user-tie"></i> Contact Person</label>
                            <div class="input-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input type="text" class="form-control" id="contactPerson" placeholder="Full name" required>
                            </div>
                            <div class="form-text" id="contactPersonError"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-briefcase"></i> Job Title</label>
                            <div class="input-wrapper">
                                <i class="fas fa-id-card input-icon"></i>
                                <input type="text" class="form-control" id="jobTitle" placeholder="CEO / Director" required>
                            </div>
                            <div class="form-text" id="jobTitleError"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-lock"></i> Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" class="form-control" id="companyPassword" minlength="8" required>
                            </div>
                            <div class="password-strength" id="companyPasswordStrength"></div
