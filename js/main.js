// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const toggler = document.getElementById('navbarToggler');
    const menu = document.getElementById('navbarMenu');
    
    if (toggler && menu) {
        toggler.addEventListener('click', function() {
            menu.classList.toggle('active');
            toggler.classList.toggle('active');
        });
    }
    
    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Active nav link
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '/' && href === '/')) {
            link.classList.add('active');
        }
    });
});
