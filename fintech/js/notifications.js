// Push Notification Service
class NotificationService {
    constructor() {
        this.messaging = null;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.register('/js/service-worker.js');
                console.log('Service Worker registered');

                // Request permission
                const permission = await this.requestPermission();
                
                if (permission === 'granted') {
                    this.setupMessaging();
                }
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    }

    setupMessaging() {
        // Firebase Cloud Messaging setup
        if (typeof firebase !== 'undefined') {
            this.messaging = firebase.messaging();
            
            this.messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY' })
                .then(currentToken => {
                    if (currentToken) {
                        this.sendTokenToServer(currentToken);
                    }
                });

            this.messaging.onMessage(payload => {
                this.showNotification(payload);
            });
        }
    }

    sendTokenToServer(token) {
        // Save token to user's document in Firestore
        if (auth.currentUser) {
            db.collection(COLLECTIONS.USERS).doc(auth.currentUser.uid)
                .update({
                    'pushToken': token,
                    'pushTokenUpdatedAt': firebase.firestore.FieldValue.serverTimestamp()
                });
        }
    }

    showNotification(payload) {
        const notification = new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/assets/images/logo.svg',
            badge: '/assets/images/logo.svg'
        });

        notification.onclick = () => {
            window.focus();
            if (payload.data?.url) {
                window.location.href = payload.data.url;
            }
        };
    }

    async subscribeToTopic(topic) {
        if (this.messaging && auth.currentUser) {
            const token = await this.messaging.getToken();
            // Subscribe to topic via Firebase Functions
            const response = await fetch('/api/subscribe-to-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    topic,
                    userId: auth.currentUser.uid
                })
            });
        }
    }

    async unsubscribeFromTopic(topic) {
        if (this.messaging && auth.currentUser) {
            const token = await this.messaging.getToken();
            // Unsubscribe from topic via Firebase Functions
            const response = await fetch('/api/unsubscribe-from-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    topic,
                    userId: auth.currentUser.uid
                })
            });
        }
    }
}

// Initialize notifications
const notificationService = new NotificationService();

// Send notification to user
async function sendNotificationToUser(userId, notification) {
    try {
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
        const pushToken = userDoc.data()?.pushToken;

        if (pushToken) {
            // Send via Firebase Functions
            await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: pushToken,
                    notification
                })
            });
        }

        // Save to Firestore
        await db.collection(COLLECTIONS.NOTIFICATIONS).add({
            userId,
            ...notification,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Get user notifications
async function getUserNotifications(userId) {
    try {
        const snapshot = await db.collection(COLLECTIONS.NOTIFICATIONS)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
}

// Mark notification as read
async function markNotificationAsRead(notificationId) {
    try {
        await db.collection(COLLECTIONS.NOTIFICATIONS).doc(notificationId).update({
            read: true
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}
