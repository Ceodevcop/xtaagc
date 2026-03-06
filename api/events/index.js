// api/events/index.js - CORRECTED IMPORT PATH
import admin, { db, isAdmin, verifyToken, logAudit, snapshotToArray } from '../lib/firebase-admin.js';
//                                                 ↑ IMPORTANT: ../lib/ not ./lib/

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ... rest of your code (keep everything else the same)
  const { action, eventId } = req.query;

  // Show available actions
  if (!action) {
    return res.status(200).json({
      name: "TAAGC Events API",
      endpoints: {
        list: "GET /api/events?action=list",
        featured: "GET /api/events?action=featured",
        upcoming: "GET /api/events?action=upcoming",
        past: "GET /api/events?action=past",
        get: "GET /api/events?action=get&eventId={id}",
        create: "POST /api/events?action=create (admin)",
        update: "PUT /api/events?action=update&eventId={id} (admin)",
        delete: "DELETE /api/events?action=delete&eventId={id} (admin)",
        stats: "GET /api/events?action=stats"
      }
    });
  }

  try {
    switch (action) {
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
      case 'stats':
        return await handleEventStats(req, res);
      case 'create':
        return await handleCreateEvent(req, res);
      case 'update':
        return await handleUpdateEvent(req, res, eventId);
      case 'delete':
        return await handleDeleteEvent(req, res, eventId);
      default:
        return res.status(404).json({ error: 'Action not found' });
    }
  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// EVENT HANDLERS (keep all your existing handler functions)
// ============================================
async function handleListEvents(req, res) {
  // Your existing code
  const { limit = 20 } = req.query;
  const snapshot = await db.collection('events').orderBy('date', 'asc').limit(parseInt(limit)).get();
  const events = snapshotToArray(snapshot);
  return res.status(200).json({ success: true, events });
}

async function handleFeaturedEvents(req, res) {
  // Your existing code
  const snapshot = await db.collection('events').where('featured', '==', true).limit(3).get();
  const events = snapshotToArray(snapshot);
  return res.status(200).json({ success: true, featured: events });
}

async function handleUpcomingEvents(req, res) {
  // Your existing code
  const snapshot = await db.collection('events').where('date', '>=', new Date()).orderBy('date', 'asc').limit(10).get();
  const events = snapshotToArray(snapshot);
  return res.status(200).json({ success: true, upcoming: events });
}

async function handlePastEvents(req, res) {
  // Your existing code
  const snapshot = await db.collection('events').where('date', '<', new Date()).orderBy('date', 'desc').limit(10).get();
  const events = snapshotToArray(snapshot);
  return res.status(200).json({ success: true, past: events });
}

async function handleGetEvent(req, res, eventId) {
  // Your existing code
  if (!eventId) return res.status(400).json({ error: 'Event ID required' });
  const eventDoc = await db.collection('events').doc(eventId).get();
  if (!eventDoc.exists) return res.status(404).json({ error: 'Event not found' });
  return res.status(200).json({ success: true, event: { id: eventDoc.id, ...eventDoc.data() } });
}

async function handleEventStats(req, res) {
  // Your existing code
  const snapshot = await db.collection('events').get();
  const stats = {
    total: snapshot.size,
    upcoming: 0,
    past: 0,
    featured: 0
  };
  snapshot.forEach(doc => {
    const event = doc.data();
    if (event.featured) stats.featured++;
    if (event.date?.toDate() > new Date()) stats.upcoming++;
    else stats.past++;
  });
  return res.status(200).json({ success: true, stats });
}

async function handleCreateEvent(req, res) {
  // Admin check required
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
  
  const { title, description, date, location, type, featured } = req.body;
  
  if (!title || !description || !date || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const eventData = {
    title,
    description,
    date: new Date(date),
    location,
    type: type || 'conference',
    featured: featured || false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: tokenResult.decoded.uid
  };
  
  const docRef = await db.collection('events').add(eventData);
  
  await logAudit(tokenResult.decoded.uid, 'event_created', { eventId: docRef.id });
  
  return res.status(201).json({
    success: true,
    message: 'Event created',
    eventId: docRef.id
  });
}

async function handleUpdateEvent(req, res, eventId) {
  // Admin check required (similar to create)
  if (!eventId) return res.status(400).json({ error: 'Event ID required' });
  
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
  
  const updates = req.body;
  updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  
  await db.collection('events').doc(eventId).update(updates);
  
  return res.status(200).json({ success: true, message: 'Event updated' });
}

async function handleDeleteEvent(req, res, eventId) {
  // Admin check required (similar to create)
  if (!eventId) return res.status(400).json({ error: 'Event ID required' });
  
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
  
  await db.collection('events').doc(eventId).delete();
  
  return res.status(200).json({ success: true, message: 'Event deleted' });
}
