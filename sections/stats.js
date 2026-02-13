// sections/stats.js
export default {
    render() {
        return `
            <section id="stats" class="stats-section">
                <div class="container">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-cubes"></i></div>
                            <div class="stat-number">5</div>
                            <div class="stat-label">Core Sectors</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-globe-americas"></i></div>
                            <div class="stat-number">50+</div>
                            <div class="stat-label">Countries</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                            <div class="stat-number">15+</div>
                            <div class="stat-label">Years Experience</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-handshake"></i></div>
                            <div class="stat-number">500+</div>
                            <div class="stat-label">Global Partners</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
};
