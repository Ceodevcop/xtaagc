// ============================================
// EVENTS PAGE - TAAGC Global
// Firebase Integration
// ============================================

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOcCDPqRSlAMJJBEeNchTA1qO9tl9Nldw",
    authDomain: "xtaagc.firebaseapp.com",
    projectId: "xtaagc",
    storageBucket: "xtaagc.firebasestorage.app",
    messagingSenderId: "256073982437",
    appId: "1:256073982437:android:0c54368d54e260cba98f0c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Enable offline persistence
db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED });

// ============================================
// GLOBAL VARIABLES
// ============================================
let allEvents = [];
let featuredEvent = null;
let currentFilter = 'all';
let currentSort = 'date';
let searchTerm = '';
let currentPage = 1;
const eventsPerPage = 6;
let pastEventsPage = 1;
const pastEventsPerPage = 8;

// ============================================
// DOM ELEMENTS
// ============================================
const eventsGrid = document.getElementById('eventsGrid');
const pastEventsGrid = document.getElementById('pastEventsGrid');
const monthEvents = document.getElementById('monthEvents');
const calendarDays = document.getElementById('calendarDays');
const currentMonthEl = document.getElementById('currentMonth');
const featuredSection = document.querySelector('.featured-event');

// ============================================
// INITIALIZE PAGE
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading states
        showLoading();
        
        // Load events from Firebase
        await loadEvents();
        
        // Initialize all components
        initEventListeners();
        initCalendar();
        initCountdown();
        
        // Hide loading
        hideLoading();
        
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to load events. Please refresh the page.');
    }
});

// ============================================
// LOAD EVENTS FROM FIREBASE
// ============================================
async function loadEvents() {
    try {
        const snapshot = await db.collection('events')
            .orderBy('date', 'asc')
            .get();
        
        allEvents = [];
        const now = new Date();
        
        snapshot.forEach(doc => {
            const event = { id: doc.id, ...doc.data() };
            
            // Parse event date
            const eventDate = new Date(event.date);
            event.isPast = eventDate < now;
            event.timestamp = eventDate.getTime();
            
            // Set default values if missing
            event.title = event.title || 'Untitled Event';
            event.description = event.description || 'Join us for this exciting event';
            event.location = event.location || 'Online';
            event.format = event.format || 'virtual';
            event.type = event.type || 'webinar';
            event.price = event.price || { virtual: 0, inPerson: 0, vip: 0 };
            event.attendees = event.attendees || Math.floor(Math.random() * 500) + 100;
            event.speakers = event.speakers || [];
            event.image = event.image || '/assets/images/events/default-event.jpg';
            
            allEvents.push(event);
        });
        
        // Find featured event (first upcoming with featured flag)
        featuredEvent = allEvents.find(e => e.featured && !e.isPast) || 
                       allEvents.find(e => !e.isPast);
        
        // Render all sections
        renderFeaturedEvent();
        renderEventsGrid();
        renderPastEvents();
        updateCalendarEvents();
        
    } catch (error) {
        console.error('Error loading events:', error);
        throw error;
    }
}

// ============================================
// RENDER FEATURED EVENT
// ============================================
function renderFeaturedEvent() {
    if (!featuredEvent || !featuredSection) return;
    
    const eventDate = new Date(featuredEvent.date);
    const eventTime = featuredEvent.time || '10:00 AM - 6:00 PM';
    
    const html = `
        <div class="featured-card">
            <div class="featured-image">
                <img src="${featuredEvent.image}" alt="${featuredEvent.title}" onerror="this.src='/assets/images/events/default-event.jpg'">
                <span class="featured-badge">Featured</span>
                <span class="event-format"><i class="fas fa-video"></i> ${featuredEvent.format === 'hybrid' ? 'Hybrid Event' : featuredEvent.format === 'in-person' ? 'In-Person' : 'Virtual'}</span>
            </div>
            
            <div class="featured-content">
                <div class="event-countdown" id="featuredCountdown">
                    <div class="countdown-item">
                        <span class="countdown-number" id="days">0</span>
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="hours">00</span>
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="minutes">00</span>
                        <span class="countdown-label">Mins</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="seconds">00</span>
                        <span class="countdown-label">Secs</span>
                    </div>
                </div>
                
                <div class="event-meta">
                    <span><i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span><i class="far fa-clock"></i> ${eventTime}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${featuredEvent.location}</span>
                    <span><i class="fas fa-ticket-alt"></i> ${featuredEvent.attendees} attendees</span>
                </div>
                
                <h2>${featuredEvent.title}</h2>
                <p>${featuredEvent.description}</p>
                
                <div class="event-speakers">
                    <h4>Featured Speakers:</h4>
                    <div class="speaker-avatars">
                        ${renderSpeakers(featuredEvent.speakers)}
                    </div>
                </div>
                
                <div class="event-pricing">
                    <div class="price-card">
                        <span class="price-type">Virtual</span>
                        <span class="price-amount">$${featuredEvent.price?.virtual || 99}</span>
                    </div>
                    <div class="price-card featured">
                        <span class="price-type">In-Person</span>
                        <span class="price-amount">$${featuredEvent.price?.inPerson || 499}</span>
                        <span class="price-badge">Best Value</span>
                    </div>
                    <div class="price-card">
                        <span class="price-type">VIP</span>
                        <span class="price-amount">$${featuredEvent.price?.vip || 999}</span>
                    </div>
                </div>
                
                <div class="event-actions">
                    <button class="btn-primary" onclick="openRegistration('${featuredEvent.id}')">
                        <i class="fas fa-ticket"></i> Register Now
                    </button>
                    <button class="btn-secondary" onclick="addToCalendar('${featuredEvent.id}')">
                        <i class="far fa-calendar-plus"></i> Add to Calendar
                    </button>
                    <button class="btn-icon" onclick="shareEvent('${featuredEvent.id}')">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    featuredSection.innerHTML = html;
}

function renderSpeakers(speakers) {
    if (!speakers || speakers.length === 0) {
        return '<div class="speaker-count">TBA</div>';
    }
    
    let html = '';
    const maxDisplay = 3;
    
    speakers.slice(0, maxDisplay).forEach(speaker => {
        html += `<img src="${speaker.avatar || '/assets/images/events/default-speaker.jpg'}" alt="${speaker.name}">`;
    });
    
    if (speakers.length > maxDisplay) {
        html += `<div class="speaker-count">+${speakers.length - maxDisplay}</div>`;
    }
    
    return html;
}

// ============================================
// RENDER EVENTS GRID
// ============================================
function renderEventsGrid() {
    if (!eventsGrid) return;
    
    // Filter and sort events
    let filteredEvents = filterEvents(allEvents.filter(e => !e.isPast));
    filteredEvents = sortEvents(filteredEvents, currentSort);
    
    // Paginate
    const start = (currentPage - 1) * eventsPerPage;
    const paginatedEvents = filteredEvents.slice(start, start + eventsPerPage);
    
    if (paginatedEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="far fa-calendar-times"></i>
                <h3>No events found</h3>
                <p>Check back later for upcoming events</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    paginatedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        
        html += `
            <div class="event-card" onclick="viewEvent('${event.id}')">
                <div class="event-card-image">
                    <img src="${event.image}" alt="${event.title}" onerror="this.src='/assets/images/events/default-event.jpg'">
                    <span class="event-card-tag">${event.type}</span>
                    <span class="event-card-format"><i class="fas ${event.format === 'virtual' ? 'fa-laptop' : event.format === 'in-person' ? 'fa-users' : 'fa-globe'}"></i> ${event.format}</span>
                </div>
                
                <div class="event-card-content">
                    <div class="event-card-date">
                        <i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <h3 class="event-card-title">${event.title}</h3>
                    <div class="event-card-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    
                    <div class="event-card-footer">
                        <span class="event-card-price ${event.price?.virtual === 0 ? 'free' : ''}">
                            ${event.price?.virtual === 0 ? 'FREE' : `$${event.price?.virtual}`}
                        </span>
                        <a href="#" class="event-card-link" onclick="event.stopPropagation(); openRegistration('${event.id}')">
                            Register <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    eventsGrid.innerHTML = html;
    
    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        const hasMore = filteredEvents.length > start + eventsPerPage;
        loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    }
}

// ============================================
// RENDER PAST EVENTS
// ============================================
function renderPastEvents() {
    if (!pastEventsGrid) return;
    
    const pastEvents = allEvents.filter(e => e.isPast);
    const start = (pastEventsPage - 1) * pastEventsPerPage;
    const paginatedEvents = pastEvents.slice(start, start + pastEventsPerPage);
    
    if (paginatedEvents.length === 0) {
        pastEventsGrid.innerHTML = `
            <div class="no-events">
                <i class="far fa-calendar-check"></i>
                <h3>No past events</h3>
                <p>Check back later for recordings</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    paginatedEvents.forEach(event => {
        const eventDate = new Date(event.date);
        
        html += `
            <div class="past-event-card" onclick="viewRecording('${event.id}')">
                <div class="past-event-image">
                    <img src="${event.image}" alt="${event.title}">
                    <div class="past-event-overlay">
                        <i class="fas fa-play-circle"></i>
                    </div>
                </div>
                <div class="past-event-content">
                    <h4 class="past-event-title">${event.title}</h4>
                    <div class="past-event-date">
                        <i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>
        `;
    });
    
    pastEventsGrid.innerHTML = html;
    
    // Update load more button
    const loadMoreBtn = document.getElementById('loadMorePastBtn');
    if (loadMoreBtn) {
        const hasMore = pastEvents.length > start + pastEventsPerPage;
        loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
    }
}

// ============================================
// FILTER EVENTS
// ============================================
function filterEvents(events) {
    return events.filter(event => {
        // Filter by type
        if (currentFilter !== 'all' && event.type !== currentFilter) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return event.title.toLowerCase().includes(term) ||
                   event.description.toLowerCase().includes(term) ||
                   event.location.toLowerCase().includes(term);
        }
        
        return true;
    });
}

// ============================================
// SORT EVENTS
// ============================================
function sortEvents(events, sortBy) {
    const sorted = [...events];
    
    switch (sortBy) {
        case 'date':
            sorted.sort((a, b) => a.timestamp - b.timestamp);
            break;
        case 'popular':
            sorted.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
            break;
        case 'upcoming':
            sorted.sort((a, b) => a.timestamp - b.timestamp);
            break;
        default:
            sorted.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    return sorted;
}

// ============================================
// CALENDAR FUNCTIONS
// ============================================
let currentDate = new Date();

function initCalendar() {
    renderCalendar();
    
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

function renderCalendar() {
    if (!calendarDays || !currentMonthEl) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthEl.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let days = '';
    
    // Previous month days
    for (let i = 0; i < firstDay.getDay(); i++) {
        days += '<div class="calendar-day other-month"></div>';
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        const hasEvent = allEvents.some(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
        
        days += `<div class="calendar-day ${hasEvent ? 'has-event' : ''}">${i}</div>`;
    }
    
    calendarDays.innerHTML = days;
}

function updateCalendarEvents() {
    if (!monthEvents) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthEventsList = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    if (monthEventsList.length === 0) {
        monthEvents.innerHTML = '<p style="color: var(--light);">No events this month</p>';
        return;
    }
    
    let html = '';
    monthEventsList.slice(0, 5).forEach(event => {
        const eventDate = new Date(event.date);
        html += `
            <div class="mini-event-item">
                <div class="mini-event-title">${event.title}</div>
                <div class="mini-event-date">
                    <i class="far fa-calendar"></i> ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
            </div>
        `;
    });
    
    monthEvents.innerHTML = html;
}

// ============================================
// COUNTDOWN TIMER
// ============================================
function initCountdown() {
    if (!featuredEvent) return;
    
    const targetDate = new Date(featuredEvent.date).getTime();
    
    setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;
        
        if (distance < 0) {
            document.getElementById('days').textContent = '0';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// ============================================
// EVENT HANDLERS
// ============================================
function initEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            currentPage = 1;
            renderEventsGrid();
        });
    });
    
    // Search input
    document.getElementById('eventSearch')?.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        currentPage = 1;
        renderEventsGrid();
    });
    
    // Sort select
    document.getElementById('sortEvents')?.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderEventsGrid();
    });
    
    // Load more buttons
    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
        currentPage++;
        renderEventsGrid();
    });
    
    document.getElementById('loadMorePastBtn')?.addEventListener('click', () => {
        pastEventsPage++;
        renderPastEvents();
    });
    
    // Mobile menu
    document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });
}

// ============================================
// ACTION FUNCTIONS
// ============================================
window.openRegistration = function(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    document.getElementById('registrationModal').classList.add('active');
    document.querySelector('.modal-content h2').textContent = `Register for ${event.title}`;
}

window.closeModal = function() {
    document.getElementById('registrationModal').classList.remove('active');
}

window.viewEvent = function(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (event) {
        // Scroll to featured section and update with selected event
        featuredEvent = event;
        renderFeaturedEvent();
        initCountdown();
        document.querySelector('.featured-event').scrollIntoView({ behavior: 'smooth' });
    }
}

window.viewRecording = function(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (event && event.recordingUrl) {
        window.open(event.recordingUrl, '_blank');
    } else {
        alert('Recording not available yet');
    }
}

window.addToCalendar = function(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const eventDate = new Date(event.date);
    const startTime = event.time?.split(' - ')[0] || '10:00';
    
    // Create Google Calendar URL
    const start = `${eventDate.toISOString().split('T')[0]}T${startTime.replace(':', '')}00`;
    const end = `${eventDate.toISOString().split('T')[0]}T180000`;
    
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(url, '_blank');
}

window.shareEvent = function(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: event.description,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`${event.title}\n${event.description}\n${window.location.href}`);
        alert('Event link copied to clipboard!');
    }
}

window.submitRegistration = function(e) {
    e.preventDefault();
    alert('Thank you for registering! You will receive a confirmation email shortly.');
    closeModal();
}

window.subscribeNewsletter = function(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Save to Firebase
    db.collection('newsletter').add({
        email: email,
        subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert('Thank you for subscribing! Check your email for confirmation.');
        e.target.reset();
    }).catch(error => {
        console.error('Error subscribing:', error);
        alert('Error subscribing. Please try again.');
    });
    
    return false;
}

window.downloadCalendar = function() {
    const events = allEvents.filter(e => !e.isPast).slice(0, 10);
    
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TAAGC Global//Events Calendar//EN\n';
    
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const start = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0];
        const end = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0];
        
        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `DTSTART:${start}\n`;
        icsContent += `DTEND:${end}\n`;
        icsContent += `SUMMARY:${event.title}\n`;
        icsContent += `DESCRIPTION:${event.description}\n`;
        icsContent += `LOCATION:${event.location}\n`;
        icsContent += 'END:VEVENT\n';
    });
    
    icsContent += 'END:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taagc-events.ics';
    a.click();
}

// ============================================
// FAQ TOGGLE
// ============================================
window.toggleFAQ = function(element) {
    const faqItem = element.closest('.faq-item');
    faqItem.classList.toggle('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showLoading() {
    // Add loading spinners to grids
    if (eventsGrid) eventsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading events...</p></div>';
    if (pastEventsGrid) pastEventsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading past events...</p></div>';
}

function hideLoading() {
    // Loading removed by render functions
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.querySelector('.container').prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// ============================================
// TRACK EVENT VIEWS
// ============================================
async function trackEventView(eventId) {
    try {
        const eventRef = db.collection('events').doc(eventId);
        await eventRef.update({
            views: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error tracking view:', error);
    }
}

// Track page view
if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
        page_title: 'Events & Webinars',
        page_location: window.location.href
    });
}
