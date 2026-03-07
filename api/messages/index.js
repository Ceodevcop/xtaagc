// api/messages/index.js
const express = require('express');
const router = express.Router();
const { collections } = require('../../config/firebase');
const { authenticate } = require('../../middleware/auth');

// Get user messages
router.get('/', authenticate, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const snapshot = await collections.messages
      .where('participants', 'array-contains', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: messages.length,
      messages
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { from, to, subject, content, type = 'general' } = req.body;
    
    const messageData = {
      from,
      to,
      subject,
      content,
      type,
      status: 'sent',
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      participants: [from, to]
    };
    
    const docRef = await collections.messages.add(messageData);
    
    // Create notification
    await collections.notifications.add({
      userId: to,
      type: 'message',
      title: 'New Message',
      content: `You have a new message from ${from}`,
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({
      success: true,
      id: docRef.id,
      ...messageData
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await collections.messages.doc(id).update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const snapshot = await collections.messages
      .where('to', '==', userId)
      .where('read', '==', false)
      .get();
    
    res.json({
      success: true,
      count: snapshot.size
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await collections.messages.doc(id).delete();
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
