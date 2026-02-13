// admin/js/components/modal.js
export class Modal {
    constructor(options = {}) {
        this.id = options.id || 'modal-' + Date.now();
        this.title = options.title || 'Modal';
        this.size = options.size || 'md';
        this.onClose = options.onClose || null;
        this.createModal();
    }
    
    createModal() {
        this.element = document.createElement('div');
        this.element.id = this.id;
        this.element.className = 'modal';
        this.element.innerHTML = `
            <div class="modal-content" style="${this.getSizeStyle()}">
                <div class="modal-header">
                    <h3 class="modal-title">${this.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        `;
        
        this.element.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.close();
        });
        
        document.body.appendChild(this.element);
        this.body = this.element.querySelector('.modal-body');
        this.footer = this.element.querySelector('.modal-footer');
    }
    
    getSizeStyle() {
        const sizes = {
            sm: 'max-width: 400px;',
            md: 'max-width: 600px;',
            lg: 'max-width: 800px;',
            xl: 'max-width: 1000px;'
        };
        return sizes[this.size] || sizes.md;
    }
    
    open(content = null) {
        if (content) this.setContent(content);
        this.element.classList.add('active');
    }
    
    close() {
        this.element.classList.remove('active');
        if (this.onClose) this.onClose();
    }
    
    setContent(html) {
        this.body.innerHTML = html;
    }
    
    setFooter(html) {
        this.footer.innerHTML = html;
    }
    
    destroy() {
        this.element.remove();
    }
}

window.Modal = Modal;
