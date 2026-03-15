// Support Page JavaScript
let chatActive = false;

document.addEventListener('DOMContentLoaded', () => {
    loadFAQs();
    loadArticles();
    setupChat();
});

// Load FAQs
function loadFAQs() {
    const faqList = document.getElementById('faqList');
    
    const faqs = [
        {
            question: 'How do I create a virtual card?',
            answer: 'Go to Cards section and click "Add New Card". Choose virtual card type and follow the instructions.'
        },
        {
            question: 'What are the daily transaction limits?',
            answer: 'Limits depend on your KYC level. Level 1: $1,000/day, Level 2: $5,000/day, Level 3: $10,000/day.'
        },
        {
            question: 'How do I freeze my card?',
            answer: 'Click on the card, then select "Freeze" from the menu. You can unfreeze anytime.'
        },
        {
            question: 'How long do transfers take?',
            answer: 'Internal transfers are instant. International transfers take 1-3 business days.'
        },
        {
            question: 'How do I verify my identity?',
            answer: 'Go to KYC Verification page and upload your ID documents. Verification takes 1-2 business days.'
        }
    ];

    let html = '';
    faqs.forEach((faq, index) => {
        html += `
            <div class="faq-item" onclick="toggleFAQ(${index})">
                <div class="faq-question">
                    <span>${faq.question}</span>
                    <span class="toggle">▼</span>
                </div>
                <div class="faq-answer" id="faq-${index}" style="display: none;">
                    ${faq.answer}
                </div>
            </div>
        `;
    });

    faqList.innerHTML = html;
}

// Toggle FAQ
function toggleFAQ(index) {
    const answer = document.getElementById(`faq-${index}`);
    const toggle = event.currentTarget.querySelector('.toggle');
    
    if (answer.style.display === 'none') {
        answer.style.display = 'block';
        toggle.textContent = '▲';
    } else {
        answer.style.display = 'none';
        toggle.textContent = '▼';
    }
}

// Load knowledge base articles
function loadArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    
    const articles = [
        {
            title: 'Getting Started Guide',
            category: 'Basics',
            readTime: '5 min'
        },
        {
            title: 'Understanding Card Limits',
            category: 'Cards',
            readTime: '3 min'
        },
        {
            title: 'Security Best Practices',
            category: 'Security',
            readTime: '4 min'
        },
        {
            title: 'International Transfer Guide',
            category: 'Transfers',
            readTime: '6 min'
        }
    ];

    let html = '';
    articles.forEach(article => {
        html += `
            <div class="article-card" onclick="viewArticle('${article.title}')">
                <span class="category">${article.category}</span>
                <h4>${article.title}</h4>
                <span class="read-time">${article.readTime} read</span>
            </div>
        `;
    });

    articlesGrid.innerHTML = html;
}

// Setup chat
function setupChat() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }
}

// Start live chat
function startLiveChat() {
    document.getElementById('chatModal').style.display = 'block';
    chatActive = true;
    
    // Add welcome message
    addChatMessage('Hello! How can we help you today?', 'support');
}

// Close chat
function closeChat() {
    document.getElementById('chatModal').style.display = 'none';
    chatActive = false;
}

// Send chat message
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (message) {
        addChatMessage(message, 'user');
        input.value = '';

        // Simulate response
        setTimeout(() => {
            const responses = [
                "Thanks for your message. One of our agents will help you shortly.",
                "I understand. Let me check that for you.",
                "Great question! Let me find the best answer.",
                "I'll help you with that right away."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage(randomResponse, 'support');
        }, 1000);
    }
}

// Add chat message
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <span class="avatar">${sender === 'support' ? '🤖' : '👤'}</span>
        <div class="message-content">${message}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send email
function sendEmail() {
    window.location.href = 'mailto:support@taagc.website';
}

// Call support
function callSupport() {
    window.location.href = 'tel:+18001234567';
}

// Show FAQ category
function showFAQ(category) {
    showToast(`Loading ${category} FAQs...`, 'info');
}

// View article
function viewArticle(title) {
    showToast(`Opening article: ${title}`, 'info');
}
