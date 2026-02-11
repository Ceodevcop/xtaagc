// components/back-to-top.js
export const BackToTop = {
    render() {
        return `
            <button id="backToTop" class="back-to-top" aria-label="Back to top">
                <i class="fas fa-arrow-up"></i>
            </button>
        `;
    },
    
    init() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

// Render back to top button on load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('back-to-top-container');
    if (container) {
        container.innerHTML = BackToTop.render();
        BackToTop.init();
    }
});
