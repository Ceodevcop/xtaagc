// components/navbar.js
export const Navbar = {
    render() {
        return `
            <nav class="navbar" id="navbar">
                <div class="container">
                    <div class="navbar-content">
                        <a href="/" class="navbar-brand">
                            <div class="navbar-logo">A</div>
                            <div class="navbar-brand-text"><span>TAAGC</span> GLOBAL</div>
                        </a>
                        
                        <div class="navbar-menu" id="navbarMenu">
                            <ul class="navbar-nav">
                                <li class="nav-item"><a href="#home" class="nav-link active">Home</a></li>
                                <li class="nav-item"><a href="#sectors" class="nav-link">Sectors</a></li>
                                <li class="nav-item"><a href="#approach" class="nav-link">Approach</a></li>
                                <li class="nav-item"><a href="#testimonials" class="nav-link">Partners</a></li>
                                <li class="nav-item"><a href="#ceo" class="nav-link">CEO</a></li>
                                <li class="nav-item"><a href="/staff.html" class="nav-link">Team</a></li>
                                <li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li>
                                <li class="nav-item nav-cta">
                                    <a href="/register.html" class="nav-link">
                                        <i class="fas fa-handshake"></i> Partner
                                    </a>
