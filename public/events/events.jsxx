// Events Page JavaScript - Complete Functionality

document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    initializeSearch();
    initializeSort();
    initializeCalendar();
    initializeEvents();
    initializePastEvents();
    initializeFAQ();
    initializeMobileMenu();
    initializeCountdown();
    initializeViewToggle();
    initializeLoadMore();
});

// ============================================
// EVENT DATA
// ============================================

const eventsData = [
    {
        id: 1,
        title: "Real Estate Investment Strategies",
        date: "2025-05-05",
        time: "3:00 PM",
        category: "webinar",
        format: "online",
        image: "/assets/images/events/webinar-1.jpg",
        description: "Learn how to build wealth through real estate investments in emerging markets.",
        attendees: 156,
        price: 49,
        featured: false
    },
    {
        id: 2,
        title: "Blockchain & Crypto Summit",
        date: "2025-06-10",
        time: "All Day",
        category: "conference",
        format: "hybrid",
        image: "/assets/images/events/conference-1.jpg",
        description: "Explore the future of digital assets and blockchain technology in finance.",
        attendees: 342,
        price: 299,
        featured: true
    },
    {
        id: 3,
        title: "Technical Analysis Workshop",
        date: "2025-04-22",
        time: "9:00 AM",
        category: "workshop",
        format: "in-person",
        image: "/assets/images/events/workshop-1.jpg",
        description: "Hands-on training for reading charts and identifying trading opportunities.",
        attendees: 89,
        price: 199,
        featured: false
    },
    {
        id: 4,
        title: "Investors Mixer - New York",
        date: "2025-05-18",
        time: "6:30 PM",
        category: "networking",
        format: "in-person",
        image: "/assets/images/events/networking-1.jpg",
        description: "Connect with fellow investors and industry experts over cocktails.",
        attendees: 78,
        price: 75,
        featured: false
    },
    {
        id: 5,
        title: "Tax Strategies for Investors",
        date: "2025-05-25",
        time: "2:00 PM",
        category: "webinar",
        format: "online",
        image: "/assets/images/events/webinar-2.jpg",
        description: "Expert advice on minimizing tax liability and maximizing returns.",
        attendees: 203,
        price: 49,
        featured: false
    },
    {
        id: 6,
        title: "Emerging Markets Forum",
        date: "2025-07-08",
        time: "All Day",
        category: "conference",
        format: "hybrid",
        image: "/assets/images/events/conference-2.jpg",
        description: "Discover high-growth opportunities in Asia, Africa, and Latin America.",
        attendees: 267,
        price: 399,
        featured: true
    }
];

const pastEventsData = [
    {
        id: 101,
        title: "Investment Strategies for 2025",
        date: "2025-02-28",
        category: "webinar",
        attendees: 342,
        videoUrl: "https://youtube.com/watch?v=...",
        thumbnail: "/assets/images/events/past-1.jpg"
    },
    {
        id: 102,
        title: "Dubai Investor Summit",
        date: "2025-02-15",
        category: "conference",
        attendees: 567,
        videoUrl: "https://youtube.com/watch?v=...",
        thumbnail: "/assets/images/events/past-2.jpg"
    },
    {
        id: 103,
        title: "Crypto Market Outlook",
        date: "2025-01-30",
        category: "webinar",
        attendees: 289,
        videoUrl: "https://youtube.com/watch?v=...",
        thumbnail: "/assets/images/events/past-3.jpg"
    }
];

// ============================================
// FILTER FUNCTIONALITY
// ============================================

function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            eventCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initializeSearch() {
    const searchInput = document.getElementById('eventSearch');
    const eventCards = document.querySelectorAll('.event-card');
    
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // Show all events
            eventCards.forEach(card => {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            });
            return;
        }
        
        let hasResults = false;
        
        eventCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const category = card.dataset.category;
            
            if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                hasResults = true;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show "no results" message if needed
        const noResultsMsg = document.getElementById('noResultsMessage');
        if (!hasResults) {
            if (!noResultsMsg) {
                const msg = document.createElement('div');
                msg.id = 'noResultsMessage';
                msg.className = 'no-results';
                msg.innerHTML = '<i class="fas fa-search"></i><h3>No events found</h3><p>Try different keywords or clear filters</p>';
                document.querySelector('.events-grid').appendChild(msg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }, 300));
}

// ============================================
// SORT FUNCTIONALITY
// ============================================

function initializeSort() {
    const sortSelect = document.getElementById('sortEvents');
    const eventsGrid = document.getElementById('eventsGrid');
    
    sortSelect.addEventListener('change', () => {
        const sortBy = sortSelect.value;
        const events = Array.from(document.querySelectorAll('.event-card'));
        
        events.sort((a, b) => {
            const aDate = new Date(a.dataset.date);
            const bDate = new Date(b.dataset.date);
            const aAttendees = parseInt(a.dataset.attendees);
            const bAttendees = parseInt(b.dataset.attendees);
            
            switch(sortBy) {
                case 'date':
                    return aDate - bDate;
                case 'popular':
                    return bAttendees - aAttendees;
                case 'upcoming':
                    return aDate - bDate;
                default:
                    return 0;
            }
        });
        
        events.forEach(event => eventsGrid.appendChild(event));
    });
}

// ============================================
// CALENDAR FUNCTIONALITY
// ============================================

function initializeCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthEl = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const monthEventsEl = document.getElementById('monthEvents');
    
    let currentDate = new Date();
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthEl.textContent = new Date(year, month).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();
        
        let days = '';
        
        // Previous month days
        for (let i = firstDay; i > 0; i--) {
            days += `<div class="calendar-day other-month">
                <div class="calendar-day-number">${prevLastDate - i + 1}</div>
            </div>`;
        }
        
        // Current month days
        for (let i = 1; i <= lastDate; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(dateStr);
            const hasEvent = dayEvents.length > 0;
            
            days += `
                <div class="calendar-day ${hasEvent ? 'has-event' : ''}" data-date="${dateStr}" onclick="showEventsForDate('${dateStr}')">
                    <div class="calendar-day-number">${i}</div>
                    ${hasEvent ? renderEventDots(dayEvents) : ''}
                </div>
            `;
        }
        
        // Next month days
        const totalDays = 42;
        const remainingDays = totalDays - (firstDay + lastDate);
        for (let i = 1; i <= remainingDays; i++) {
            days += `<div class="calendar-day other-month">
                <div class="calendar-day-number">${i}</div>
            </div>`;
        }
        
        calendarDays.innerHTML = days;
        updateMonthEvents();
    }
    
    function renderEventDots(events) {
        const colors = {
            webinar: '#c19a6b',
            conference: '#0a2540',
            workshop: '#10b981',
            networking: '#3b82f6'
        };
        
        let dots = '<div class="calendar-event-dots">';
        events.slice(0, 3).forEach(event => {
            dots += `<span class="calendar-event-dot" style="background: ${colors[event.category]}"></span>`;
        });
        if (events.length > 3) {
            dots += `<span class="calendar-event-dot-text">+${events.length - 3}</span>`;
        }
        dots += '</div>';
        return dots;
    }
    
    function updateMonthEvents() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const monthEvents = eventsData.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });
        
        if (monthEvents.length === 0) {
            monthEventsEl.innerHTML = '<p style="color: var(--light); text-align: center;">No events this month</p>';
            return;
        }
        
        let html = '';
        monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(event => {
            const eventDate = new Date(event.date);
            html += `
                <div class="mini-event-item" onclick="openRegistration('${event.id}')">
                    <div class="mini-event-date">
                        <span class="mini-event-day">${eventDate.getDate()}</span>
                        <span class="mini-event-month">${eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                    </div>
                    <div class="mini-event-info">
                        <h5>${event.title}</h5>
                        <p>${event.time} • ${event.attendees} attending</p>
                    </div>
                </div>
            `;
        });
        
        monthEventsEl.innerHTML = html;
    }
    
    function getEventsForDate(dateStr) {
        return eventsData.filter(event => event.date === dateStr);
    }
    
    window.showEventsForDate = (dateStr) => {
        const events = getEventsForDate(dateStr);
        if (events.length === 0) return;
        
        // Highlight selected day
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        event.target.closest('.calendar-day').classList.add('selected');
        
        // Show events modal or scroll to events
        const formattedDate = new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
        
        alert(`${events.length} events on ${formattedDate}`);
    };
    
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    renderCalendar();
}

// ============================================
// EVENTS GRID
// ============================================

function initializeEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    let html = '';
    
    eventsData.forEach(event => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();
        const status = isUpcoming ? 'Upcoming' : 'Recording Available';
        
        html += `
            <div class="event-card" data-category="${event.category}" data-date="${event.date}" data-attendees="${event.attendees}">
                <div class="event-image">
                    <img src="${event.image}" alt="${event.title}" onerror="this.src='/assets/images/events/default-event.jpg'">
                    <span class="event-category">${event.category}</span>
                    <span class="event-status">${status}</span>
                </div>
                <div class="event-details">
                    <div class="event-date">
                        <span><i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span><i class="far fa-clock"></i> ${event.time}</span>
                    </div>
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <div class="event-footer">
                        <span class="event-attendees"><i class="fas fa-users"></i> ${event.attendees} attending</span>
                        <a href="#" class="event-link" onclick="openRegistration('${event.id}')">Register →</a>
                    </div>
                </div>
            </div>
        `;
    });
    
    eventsGrid.innerHTML = html;
}

// ============================================
// PAST EVENTS
// ============================================

function initializePastEvents() {
    const pastEventsGrid = document.getElementById('pastEventsGrid');
    
    if (!pastEventsGrid) return;
    
    let html = '';
    
    pastEventsData.forEach(event => {
        const eventDate = new Date(event.date);
        
        html += `
            <div class="past-event-card" onclick="watchRecording('${event.videoUrl}')">
                <div class="past-event-thumb">
                    <img src="${event.thumbnail}" alt="${event.title}">
                    <div class="play-icon"><i class="fas fa-play"></i></div>
                </div>
                <div class="past-event-info">
                    <h4>${event.title}</h4>
                    <p>${eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <div class="past-event-meta">
                        <span><i class="fas fa-users"></i> ${event.attendees} attendees</span>
                        <span><i class="fas fa-video"></i> Recording</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    pastEventsGrid.innerHTML = html;
}

// ============================================
// FAQ FUNCTIONALITY
// ============================================

function initializeFAQ() {
    window.toggleFAQ = (element) => {
        const faqItem = element.closest('.faq-item');
        faqItem.classList.toggle('active');
    };
}

// ============================================
// MOBILE MENU
// ============================================

function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuBtn || !navMenu) return;
    
    menuBtn.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        menuBtn.innerHTML = navMenu.style.display === 'flex' ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });
}

// ============================================
// COUNTDOWN TIMER
// ============================================

function initializeCountdown() {
    const targetDate = new Date('2025-06-15T10:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// VIEW TOGGLE
// ============================================

function initializeViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!viewToggle || !eventsGrid) return;
    
    let isGridView = true;
    
    viewToggle.addEventListener('click', () => {
        isGridView = !isGridView;
        viewToggle.innerHTML = isGridView ? 
            '<i class="fas fa-th-large"></i>' : 
            '<i class="fas fa-th-list"></i>';
        
        eventsGrid.style.gridTemplateColumns = isGridView ? 
            'repeat(auto-fill, minmax(350px, 1fr))' : 
            '1fr';
    });
}

// ============================================
// LOAD MORE
// ============================================

function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMorePastBtn = document.getElementById('loadMorePastBtn');
    let currentPage = 1;
    const eventsPerPage = 6;
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            
            setTimeout(() => {
                // Simulate loading more events
                loadMoreBtn.innerHTML = '<i class="fas fa-spinner"></i> Load More Events';
                
                currentPage++;
                if (currentPage >= 3) {
                    loadMoreBtn.style.display = 'none';
                }
            }, 1000);
        });
    }
    
    if (loadMorePastBtn) {
        loadMorePastBtn.addEventListener('click', () => {
            loadMorePastBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            
            setTimeout(() => {
                loadMorePastBtn.innerHTML = '<i class="fas fa-history"></i> Load More Recordings';
                loadMorePastBtn.style.display = 'none';
            }, 1000);
        });
    }
}

// ============================================
// REGISTRATION
// ============================================

function openRegistration(eventId) {
    const modal = document.getElementById('registrationModal');
    const event = eventsData.find(e => e.id == eventId);
    
    if (event) {
        document.querySelector('#registrationModal h2').textContent = `Register for ${event.title}`;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('registrationModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitRegistration(event) {
    event.preventDefault();
    
    // Simulate form submission
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        alert('Registration successful! Check your email for confirmation.');
        closeModal();
        submitBtn.innerHTML = 'Complete Registration';
        submitBtn.disabled = false;
        event.target.reset();
    }, 1500);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function addToCalendar(eventId) {
    const event = eventsData.find(e => e.id == eventId);
    if (!event) return;
    
    // Create .ics file and trigger download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TAAGC Global//Events//EN
BEGIN:VEVENT
UID:${eventId}@taagc.website
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.date.replace(/-/g, '')}T${event.time.replace(':', '')}00
SUMMARY:${event.title}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

function shareEvent(eventId) {
    const event = eventsData.find(e => e.id == eventId);
    if (!event) return;
    
    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: event.description,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

function watchRecording(videoUrl) {
    window.open(videoUrl, '_blank');
}

function downloadCalendar() {
    // Generate calendar file with all events
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TAAGC Global//Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:TAAGC Events
X-WR-TIMEZONE:America/New_York
`;
    
    eventsData.forEach(event => {
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        
        icsContent += `
BEGIN:VEVENT
UID:${event.id}@taagc.website
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.format === 'online' ? 'Online' : 'TAAGC Venue'}
END:VEVENT`;
    });
    
    icsContent += '\nEND:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taagc-events.ics';
    a.click();
    URL.revokeObjectURL(url);
}

function subscribeNewsletter(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[type="email"]').value;
    
    // Simulate subscription
    alert(`Thank you for subscribing! Check ${email} for confirmation.`);
    form.reset();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('registrationModal');
    if (event.target === modal) {
        closeModal();
    }
};
