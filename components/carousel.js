// components/carousel.js
class Carousel {
    constructor(container, options = {}) {
        this.container = container;
        this.items = options.items || [];
        this.interval = options.interval || 5000;
        this.currentIndex = 0;
        this.autoPlay = options.autoPlay !== false;
        this.createCarousel();
    }
    
    createCarousel() {
        this.element = document.createElement('div');
        this.element.className = 'carousel';
        
        // Inner container
        this.inner = document.createElement('div');
        this.inner.className = 'carousel-inner';
        
        // Items
        this.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'carousel-item';
            div.innerHTML = item;
            if (index === 0) div.classList.add('active');
            this.inner.appendChild(div);
        });
        
        this.element.appendChild(this.inner);
        
        // Controls
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-control prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => this.prev());
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-control next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => this.next());
        
        this.element.appendChild(prevBtn);
        this.element.appendChild(nextBtn);
        
        // Indicators
        this.indicators = document.createElement('div');
        this.indicators.className = 'carousel-indicators';
        
        this.items.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'carousel-dot';
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goTo(index));
            this.indicators.appendChild(dot);
        });
        
        this.element.appendChild(this.indicators);
        
        this.container.innerHTML = '';
        this.container.appendChild(this.element);
        
        if (this.autoPlay) this.startAutoPlay();
    }
    
    next() {
        const items = this.inner.children;
        items[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex + 1) % items.length;
        items[this.currentIndex].classList.add('active');
        this.updateIndicators();
    }
    
    prev() {
        const items = this.inner.children;
        items[this.currentIndex].classList.remove('active');
        this.currentIndex = (this.currentIndex - 1 + items.length) % items.length;
        items[this.currentIndex].classList.add('active');
        this.updateIndicators();
    }
    
    goTo(index) {
        const items = this.inner.children;
        items[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        items[this.currentIndex].classList.add('active');
        this.updateIndicators();
    }
    
    updateIndicators() {
        const dots = this.indicators.children;
        Array.from(dots).forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
    
    startAutoPlay() {
        this.timer = setInterval(() => this.next(), this.interval);
    }
    
    stopAutoPlay() {
        if (this.timer) clearInterval(this.timer);
    }
}

window.Carousel = Carousel;
