// register/ui/ui-benefits.js
export class UIBenefits {
    // Setup benefits section
    setupBenefits() {
        const benefits = [
            {
                icon: 'fa-globe',
                title: 'Global Access',
                desc: 'Access international markets and opportunities'
            },
            {
                icon: 'fa-shield-alt',
                title: 'Secure Platform',
                desc: 'Enterprise-grade security for your data and transactions'
            },
            {
                icon: 'fa-handshake',
                title: 'Partnership Network',
                desc: 'Connect with global partners and investors'
            }
        ];
        
        const grid = document.getElementById('benefitsGrid');
        if (grid) {
            grid.innerHTML = benefits.map(b => this.getBenefitCardHTML(b)).join('');
        }
    }
    
    // Get benefit card HTML
    getBenefitCardHTML(benefit) {
        return `
            <div class="benefit-card">
                <div class="benefit-icon"><i class="fas ${benefit.icon}"></i></div>
                <h3>${benefit.title}</h3>
                <p>${benefit.desc}</p>
            </div>
        `;
    }
    
    // Update benefits based on registration type
    updateBenefitsForType(type) {
        const benefits = type === 'company' ? [
            {
                icon: 'fa-building',
                title: 'Company Dashboard',
                desc: 'Manage your business profile and partnerships'
            },
            {
                icon: 'fa-chart-line',
                title: 'Investment Opportunities',
                desc: 'Access vetted investment projects'
            },
            {
                icon: 'fa-file-contract',
                title: 'Contract Management',
                desc: 'Streamlined procurement and contracts'
            }
        ] : [
            {
                icon: 'fa-shopping-cart',
                title: 'Personal Shopping',
                desc: 'Shop from global retailers with ease'
            },
            {
                icon: 'fa-chart-pie',
                title: 'Investment Portfolio',
                desc: 'Track your investments and ROI'
            },
            {
                icon: 'fa-briefcase',
                title: 'Professional Projects',
                desc: 'Find consulting opportunities'
            }
        ];
        
        const grid = document.getElementById('benefitsGrid');
        if (grid) {
            grid.innerHTML = benefits.map(b => this.getBenefitCardHTML(b)).join('');
        }
    }
    
    // Setup FAQ section
    setupFAQ() {
        const faqs = [
            {
                question: 'What documents do I need to register?',
                answer: 'Companies need registration certificates. Individuals need valid ID (passport, national ID, or driver\'s license).'
            },
            {
                question: 'How long does verification take?',
                answer: 'Companies are verified within 24-48 hours. Individuals are verified instantly for most account types.'
            },
            {
                question: 'Can I change my account type later?',
                answer: 'Yes, you can upgrade your account type by contacting support.'
            },
            {
                question: 'Is my information secure?',
                answer: 'Yes, all data is encrypted and stored securely following industry standards.'
            }
        ];
        
        const grid = document.getElementById('faqGrid');
        if (grid) {
            grid.innerHTML = faqs.map(faq => this.getFAQItemHTML(faq)).join('');
        }
    }
    
    // Get FAQ item HTML
    getFAQItemHTML(faq) {
        return `
            <div class="faq-item">
                <div class="faq-question">
                    <i class="fas fa-question-circle"></i>
                    <h4>${faq.question}</h4>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `;
    }
}

export const uiBenefits = new UIBenefits();
