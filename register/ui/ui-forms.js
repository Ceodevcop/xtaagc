// register/ui/ui-forms.js
export class UIForms {
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
                            <div class="password-strength" id="companyPasswordStrength"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-check-circle"></i> Confirm Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-check input-icon"></i>
                                <input type="password" class="form-control" id="companyConfirmPassword" required>
                            </div>
                            <div class="form-text" id="companyConfirmError"></div>
                        </div>
                    </div>
                    
                    <div class="terms-checkbox">
                        <input type="checkbox" id="companyTerms">
                        <label for="companyTerms">
                            I confirm that this is a <strong>registered company</strong> and I am an authorized representative. 
                            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                        </label>
                    </div>
                    
                    <button type="submit" class="btn-register" id="companyRegisterBtn">
                        <i class="fas fa-building"></i> Register Company
                    </button>
                </form>
                
                <div class="login-link">
                    Already have an account? <a href="#login" onclick="document.getElementById('loginTab')?.click()">Login here</a>
                </div>
            </div>
        `;
    }
    
    // Get individual form HTML
    getIndividualFormHTML() {
        return `
            <div class="register-form">
                <div class="identity-verification">
                    <div class="identity-icon"><i class="fas fa-id-card"></i></div>
                    <div class="domain-text">
                        <strong>Identity Verification Required</strong>
                        <span>Valid ID required for investments over $10,000</span>
                    </div>
                </div>
                
                <div class="account-type-grid" id="individualTypeGrid">
                    <div class="account-type-card active" data-individual-type="shopper">
                        <div class="account-type-icon"><i class="fas fa-shopping-cart"></i></div>
                        <div class="account-type-title">Shopper</div>
                        <div class="account-type-desc">Personal Shopping</div>
                    </div>
                    <div class="account-type-card" data-individual-type="investor">
                        <div class="account-type-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="account-type-title">Investor</div>
                        <div class="account-type-desc">$1K - $1M</div>
                    </div>
                    <div class="account-type-card" data-individual-type="professional">
                        <div class="account-type-icon"><i class="fas fa-briefcase"></i></div>
                        <div class="account-type-title">Professional</div>
                        <div class="account-type-desc">Consultant / Contractor</div>
                    </div>
                </div>
                
                <form id="individualRegisterForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Full Name</label>
                            <div class="input-wrapper">
                                <i class="fas fa-user input-icon"></i>
                                <input type="text" class="form-control" id="fullName" placeholder="John Doe" required>
                            </div>
                            <div class="form-text" id="fullNameError"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-id-card"></i> ID Type</label>
                            <div class="input-wrapper">
                                <i class="fas fa-id-card input-icon"></i>
                                <select class="form-control" id="idType" required>
                                    <option value="">Select ID type</option>
                                    <option value="passport">Passport</option>
                                    <option value="national">National ID</option>
                                    <option value="drivers">Driver's License</option>
                                    <option value="voters">Voter's Card</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-id-number"></i> ID Number</label>
                            <div class="input-wrapper">
                                <i class="fas fa-hashtag input-icon"></i>
                                <input type="text" class="form-control" id="idNumber" placeholder="ID document number" required>
                            </div>
                            <div class="form-text" id="idNumberError"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Date of Birth</label>
                            <div class="input-wrapper">
                                <i class="fas fa-calendar input-icon"></i>
                                <input type="date" class="form-control" id="dob" required>
                            </div>
                            <div class="form-text" id="dobError"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-envelope"></i> Email Address</label>
                            <div class="input-wrapper">
                                <i class="fas fa-envelope input-icon"></i>
                                <input type="email" class="form-control" id="individualEmail" placeholder="your@email.com" required>
                            </div>
                            <div class="form-text" id="individualEmailError"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-phone"></i> Phone Number</label>
                            <div class="input-wrapper">
                                <i class="fas fa-phone input-icon"></i>
                                <input type="tel" class="form-control" id="individualPhone" placeholder="+234 800 000 0000" required>
                            </div>
                            <div class="form-text" id="individualPhoneError"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-map-marker-alt"></i> Country</label>
                            <div class="input-wrapper">
                                <i class="fas fa-globe input-icon"></i>
                                <select class="form-control" id="individualCountry" required>
                                    <option value="">Select country</option>
                                    <option value="Nigeria">Nigeria</option>
                                    <option value="Ghana">Ghana</option>
                                    <option value="Kenya">Kenya</option>
                                    <option value="South Africa">South Africa</option>
                                    <option value="UAE">UAE</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="USA">United States</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-city"></i> City</label>
                            <div class="input-wrapper">
                                <i class="fas fa-city input-icon"></i>
                                <input type="text" class="form-control" id="city" placeholder="Lagos" required>
                            </div>
                            <div class="form-text" id="cityError"></div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label><i class="fas fa-lock"></i> Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-lock input-icon"></i>
                                <input type="password" class="form-control" id="individualPassword" minlength="8" required>
                            </div>
                            <div class="password-strength" id="individualPasswordStrength"></div>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-check-circle"></i> Confirm Password</label>
                            <div class="input-wrapper">
                                <i class="fas fa-check input-icon"></i>
                                <input type="password" class="form-control" id="individualConfirmPassword" required>
                            </div>
                            <div class="form-text" id="individualConfirmError"></div>
                        </div>
                    </div>
                    
                    <div class="terms-checkbox">
                        <input type="checkbox" id="individualTerms">
                        <label for="individualTerms">
                            I confirm that my information is accurate. I agree to the 
                            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                        </label>
                    </div>
                    
                    <button type="submit" class="btn-register" id="individualRegisterBtn">
                        <i class="fas fa-user"></i> Create Account
                    </button>
                </form>
                
                <div class="login-link">
                    Already have an account? <a href="#login" onclick="document.getElementById('loginTab')?.click()">Login here</a>
                </div>
            </div>
        `;
    }
}

export const uiForms = new UIForms();
