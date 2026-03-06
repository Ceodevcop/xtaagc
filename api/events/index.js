// api/events.js - Complete Events Management API
import admin, { db, isAdmin, verifyToken, logAudit, snapshotToArray } from './lib/firebase-admin.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, eventId } = req.query;

  // Show available actions if no action specified
  if (!action) {
    return res.status(200).json({
      name: "TAAGC Events API",
      endpoints: {
        list: "GET /api/events?action=list",
        featured: "GET /api/events?action=featured",
        upcoming: "GET /api/events?action=upcoming&limit=10",
        past: "GET /api/events?action=past&limit=10",
        get: "GET /api/events?action=get&eventId={id}",
        create: "POST /api/events?action=create (admin)",
        update: "PUT /api/events?action=update&eventId={id} (admin)",
        delete: "DELETE /api/events?action=delete&eventId={id} (admin)",
        stats: "GET /api/events?action=stats",
        register: "POST /api/events?action=register&eventId={id}",
        calendar: "GET /api/events?action=calendar&month={month}&year={year}"
      }
    });
  }

  try {
    switch (action) {
      // Public endpoints (no auth required)
      case 'list':
        return await handleListEvents(req, res);
      case 'featured':
        return await handleFeaturedEvents(req, res);
      case 'upcoming':
        return await handleUpcomingEvents(req, res);
      case 'past':
        return await handlePastEvents(req, res);
      case 'get':
        return await handleGetEvent(req, res, eventId);
      case 'calendar':
        return await handleCalendarEvents(req, res);
      case 'stats':
        return await handleEventStats(req, res);
      case 'register':
        return await handleEventRegistration(req, res, eventId);
      
      // Admin endpoints (require auth)
      case 'create':
        return await handleCreateEvent(req, res);
      case 'update':
        return await handleUpdateEvent(req, res, eventId);
      case 'delete':
        return await handleDeleteEvent(req, res, eventId);
      case 'bulk-delete':
        return await handleBulkDeleteEvents(req, res);
      case 'export':
        return await handleExportEvents(req, res);
      
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// PUBLIC ENDPOINTS (No Auth Required)
// ============================================

/**
 * List all events with pagination and filtering
 * GET /api/events?action=list&type=webinar&status=upcoming&limit=10&page=1
 */
async function handleListEvents(req, res) {
  const { 
    type, 
    status = 'upcoming', 
    limit = 20, 
    page = 1,
    startDate,
    endDate,
    search
  } = req.query;

  try {
    let query = db.collection('events');
    
    // Filter by type
    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }
    
    // Filter by status
    const now = new Date();
    if (status === 'upcoming') {
      query = query.where('date', '>=', now);
    } else if (status === 'past') {
      query = query.where('date', '<', now);
    }
    
    // Filter by date range
    if (startDate) {
      query = query.where('date', '>=', new Date(startDate));
    }
    if (endDate) {
      query = query.where('date', '<=', new Date(endDate));
    }
    
    // Search by title or description
    // Note: Firestore doesn't support native text search, so we'll filter after
    const snapshot = await query.orderBy('date', 'asc').get();
    let events = snapshotToArray(snapshot);
    
    // Apply search filter if needed
    if (search) {
      const searchLower = search.toLowerCase();
      events = events.filter(event => 
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower)
      );
    }
    
    // Paginate
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedEvents = events.slice(startIndex, startIndex + parseInt(limit));
    
    return res.status(200).json({
      success: true,
      events: paginatedEvents,
      pagination: {
        total: events.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(events.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('List events error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get featured events
 * GET /api/events?action=featured&limit=3
 */
async function handleFeaturedEvents(req, res) {
  const { limit = 3 } = req.query;
  
  try {
    const snapshot = await db.collection('events')
      .where('featured', '==', true)
      .where('date', '>=', new Date())
      .orderBy('date', 'asc')
      .limit(parseInt(limit))
      .get();
    
    const events = snapshotToArray(snapshot);
    
    return res.status(200).json({
      success: true,
      featured: events,
      count: events.length
    });
  } catch (error) {
    console.error('Featured events error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get upcoming events
 * GET /api/events?action=upcoming&limit=10
 */
async function handleUpcomingEvents(req, res) {
  const { limit = 10 } = req.query;
  
  try {
    const snapshot = await db.collection('events')
      .where('date', '>=', new Date())
      .orderBy('date', 'asc')
      .limit(parseInt(limit))
      .get();
    
    const events = snapshotToArray(snapshot);
    
    return res.status(200).json({
      success: true,
      upcoming: events,
      count: events.length
    });
  } catch (error) {
    console.error('Upcoming events error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get past events
 * GET /api/events?action=past&limit=10
 */
async function handlePastEvents(req, res) {
  const { limit = 10 } = req.query;
  
  try {
    const snapshot = await db.collection('events')
      .where('date', '<', new Date())
      .orderBy('date', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const events = snapshotToArray(snapshot);
    
    return res.status(200).json({
      success: true,
      past: events,
      count: events.length
    });
  } catch (error) {
    console.error('Past events error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get single event by ID
 * GET /api/events?action=get&eventId=123
 */
async function handleGetEvent(req, res, eventId) {
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID required' });
  }
  
  try {
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = { id: eventDoc.id, ...eventDoc.data() };
    
    // Increment view count
    await db.collection('events').doc(eventId).update({
      views: admin.firestore.FieldValue.increment(1)
    });
    
    return res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get events for calendar view
 * GET /api/events?action=calendar&month=3&year=2026
 */
async function handleCalendarEvents(req, res) {
  const { month, year } = req.query;
  
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year required' });
  }
  
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const snapshot = await db.collection('events')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .get();
    
    const events = snapshotToArray(snapshot);
    
    // Group events by date for calendar
    const calendar = {};
    events.forEach(event => {
      const eventDate = event.date.toDate().toISOString().split('T')[0];
      if (!calendar[eventDate]) {
        calendar[eventDate] = [];
      }
      calendar[eventDate].push({
        id: event.id,
        title: event.title,
        type: event.type,
        time: event.time
      });
    });
    
    return res.status(200).json({
      success: true,
      calendar,
      events,
      month: parseInt(month),
      year: parseInt(year)
    });
  } catch (error) {
    console.error('Calendar events error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Get event statistics
 * GET /api/events?action=stats
 */
async function handleEventStats(req, res) {
  try {
    const snapshot = await db.collection('events').get();
    const now = new Date();
    
    let stats = {
      total: 0,
      upcoming: 0,
      past: 0,
      featured: 0,
      byType: {},
      totalViews: 0,
      totalAttendees: 0
    };
    
    snapshot.forEach(doc => {
      const event = doc.data();
      stats.total++;
      
      // Count by status
      const eventDate = event.date.toDate();
      if (eventDate >= now) {
        stats.upcoming++;
      } else {
        stats.past++;
      }
      
      // Count featured
      if (event.featured) stats.featured++;
      
      // Count by type
      const type = event.type || 'other';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Sum views and attendees
      stats.totalViews += event.views || 0;
      stats.totalAttendees += event.attendees || 0;
    });
    
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Event stats error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Register for an event
 * POST /api/events?action=register&eventId=123
 */
async function handleEventRegistration(req, res, eventId) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }
  
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID required' });
  }
  
  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required to register' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const { ticketType, quantity = 1 } = req.body;
  
  try {
    // Get event details
    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventDoc.data();
    
    // Check if event is upcoming
    if (event.date.toDate() < new Date()) {
      return res.status(400).json({ error: 'Cannot register for past events' });
    }
    
    // Check capacity
    if (event.capacity && (event.registered || 0) + quantity > event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if already registered
    const registrationQuery = await db.collection('event_registrations')
      .where('eventId', '==', eventId)
      .where('userId', '==', tokenResult.decoded.uid)
      .get();
    
    if (!registrationQuery.empty) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Create registration
    const registration = {
      eventId,
      userId: tokenResult.decoded.uid,
      userEmail: tokenResult.decoded.email,
      userName: tokenResult.decoded.name || 'Unknown',
      ticketType: ticketType || 'general',
      quantity: parseInt(quantity),
      registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      checkedIn: false
    };
    
    await db.collection('event_registrations').add(registration);
    
    // Increment registered count
    await db.collection('events').doc(eventId).update({
      registered: admin.firestore.FieldValue.increment(parseInt(quantity))
    });
    
    return res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      registration
    });
  } catch (error) {
    console.error('Event registration error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// ADMIN ENDPOINTS (Auth Required)
// ============================================

/**
 * Create new event
 * POST /api/events?action=create
 */
async function handleCreateEvent(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }
  
  // Verify admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const isUserAdmin = await isAdmin(tokenResult.decoded.uid);
  if (!isUserAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const {
    title,
    description,
    date,
    time,
    location,
    type,
    format,
    price,
    capacity,
    speakers,
    image,
    featured = false,
    tags = []
  } = req.body;
  
  // Validate required fields
  if (!title || !description || !date || !location) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, description, date, location' 
    });
  }
  
  try {
    const eventData = {
      title,
      description,
      date: new Date(date),
      time: time || '10:00 AM',
      location,
      type: type || 'conference',
      format: format || 'in-person',
      price: price || { free: true, amount: 0 },
      capacity: capacity || null,
      speakers: speakers || [],
      image: image || '/images/events/default-event.jpg',
      featured,
      tags,
      status: 'published',
      registered: 0,
      views: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: tokenResult.decoded.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('events').add(eventData);
    
    await logAudit(tokenResult.decoded.uid, 'event_created', { 
      eventId: docRef.id, 
      title 
    });
    
    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: docRef.id,
      event: { id: docRef.id, ...eventData }
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Update event
 * PUT /api/events?action=update&eventId=123
 */
async function handleUpdateEvent(req, res, eventId) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Use PUT or PATCH method' });
  }
  
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID required' });
  }
  
  // Verify admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const isUserAdmin = await isAdmin(tokenResult.decoded.uid);
  if (!isUserAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const updates = req.body;
    
    // Convert date string to Date object if present
    if (updates.date) {
      updates.date = new Date(updates.date);
    }
    
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updates.updatedBy = tokenResult.decoded.uid;
    
    await eventRef.update(updates);
    
    await logAudit(tokenResult.decoded.uid, 'event_updated', { 
      eventId, 
      updates: Object.keys(updates) 
    });
    
    return res.status(200).json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Delete event
 * DELETE /api/events?action=delete&eventId=123
 */
async function handleDeleteEvent(req, res, eventId) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Use DELETE method' });
  }
  
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID required' });
  }
  
  // Verify admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const isUserAdmin = await isAdmin(tokenResult.decoded.uid);
  if (!isUserAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    // Delete event
    await db.collection('events').doc(eventId).delete();
    
    // Delete all registrations for this event
    const registrations = await db.collection('event_registrations')
      .where('eventId', '==', eventId)
      .get();
    
    const batch = db.batch();
    registrations.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    await logAudit(tokenResult.decoded.uid, 'event_deleted', { eventId });
    
    return res.status(200).json({
      success: true,
      message: 'Event and all registrations deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Bulk delete events
 * POST /api/events?action=bulk-delete
 */
async function handleBulkDeleteEvents(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }
  
  // Verify admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const isUserAdmin = await isAdmin(tokenResult.decoded.uid);
  if (!isUserAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { eventIds } = req.body;
  
  if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({ error: 'Array of event IDs required' });
  }
  
  try {
    const batch = db.batch();
    let deletedCount = 0;
    
    for (const eventId of eventIds) {
      const eventRef = db.collection('events').doc(eventId);
      batch.delete(eventRef);
      deletedCount++;
    }
    
    await batch.commit();
    
    await logAudit(tokenResult.decoded.uid, 'events_bulk_deleted', { 
      count: deletedCount 
    });
    
    return res.status(200).json({
      success: true,
      message: `${deletedCount} events deleted successfully`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Export events
 * GET /api/events?action=export&format=csv
 */
async function handleExportEvents(req, res) {
  // Verify admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  const tokenResult = await verifyToken(token);
  
  if (!tokenResult.valid) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const isUserAdmin = await isAdmin(tokenResult.decoded.uid);
  if (!isUserAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { format = 'json' } = req.query;
  
  try {
    const snapshot = await db.collection('events').orderBy('date', 'desc').get();
    const events = snapshotToArray(snapshot);
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Title', 'Date', 'Location', 'Type', 'Featured', 'Registered', 'Views'];
      const rows = events.map(event => [
        event.id,
        event.title,
        event.date?.toDate().toISOString() || '',
        event.location,
        event.type,
        event.featured ? 'Yes' : 'No',
        event.registered || 0,
        event.views || 0
      ]);
      
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
      return res.status(200).send(csv);
    } else {
      return res.status(200).json({
        success: true,
        events,
        count: events.length
      });
    }
  } catch (error) {
    console.error('Export events error:', error);
    return res.status(500).json({ error: error.message });
  }
}
