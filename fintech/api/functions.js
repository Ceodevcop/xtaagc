const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Process card payment
exports.processPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { cardId, amount, merchant } = data;
    const userId = context.auth.uid;

    const cardRef = admin.firestore().collection('users').doc(userId)
        .collection('cards').doc(cardId);

    const cardDoc = await cardRef.get();

    if (!cardDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Card not found');
    }

    const card = cardDoc.data();

    if (card.status === 'frozen') {
        throw new functions.https.HttpsError('failed-precondition', 'Card is frozen');
    }

    if (card.balance < amount) {
        throw new functions.https.HttpsError('failed-precondition', 'Insufficient funds');
    }

    // Process payment
    await admin.firestore().runTransaction(async (transaction) => {
        transaction.update(cardRef, {
            balance: card.balance - amount,
            dailySpent: admin.firestore.FieldValue.increment(amount),
            monthlySpent: admin.firestore.FieldValue.increment(amount),
            lastUsed: admin.firestore.FieldValue.serverTimestamp()
        });

        const transactionRef = admin.firestore().collection('users').doc(userId)
            .collection('transactions').doc();

        transaction.set(transactionRef, {
            type: 'purchase',
            amount,
            merchant,
            cardId,
            status: 'completed',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });

    return { success: true };
});

// Generate statement
exports.generateStatement = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { cardId, month, year } = data;
    const userId = context.auth.uid;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await admin.firestore().collection('users').doc(userId)
        .collection('transactions')
        .where('cardId', '==', cardId)
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .orderBy('createdAt', 'desc')
        .get();

    const statement = {
        cardId,
        month,
        year,
        transactions: transactions.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate()
        })),
        totalSpent: transactions.docs
            .filter(doc => doc.data().type === 'purchase')
            .reduce((sum, doc) => sum + doc.data().amount, 0),
        generatedAt: new Date()
    };

    // Save statement
    const statementRef = await admin.firestore().collection('users').doc(userId)
        .collection('statements').add(statement);

    return { id: statementRef.id, ...statement };
});

// Freeze/unfreeze card
exports.toggleCardFreeze = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { cardId } = data;
    const userId = context.auth.uid;

    const cardRef = admin.firestore().collection('users').doc(userId)
        .collection('cards').doc(cardId);

    const cardDoc = await cardRef.get();

    if (!cardDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Card not found');
    }

    const card = cardDoc.data();
    const newStatus = card.status === 'active' ? 'frozen' : 'active';

    await cardRef.update({
        status: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        frozenAt: newStatus === 'frozen' ? admin.firestore.FieldValue.serverTimestamp() : null
    });

    // Create audit log
    await admin.firestore().collection('audit').add({
        userId,
        action: `CARD_${newStatus === 'frozen' ? 'FROZEN' : 'UNFROZEN'}`,
        cardId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { status: newStatus };
});
