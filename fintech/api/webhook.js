const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailure(event.data.object);
            break;
        case 'charge.refunded':
            await handleRefund(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handlePaymentSuccess(paymentIntent) {
    const { userId, cardId } = paymentIntent.metadata;
    
    await admin.firestore().collection('users').doc(userId)
        .collection('cards').doc(cardId).update({
            balance: admin.firestore.FieldValue.increment(paymentIntent.amount / 100)
        });

    await admin.firestore().collection('users').doc(userId)
        .collection('transactions').add({
            type: 'fund',
            amount: paymentIntent.amount / 100,
            cardId,
            status: 'completed',
            stripePaymentId: paymentIntent.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
}

async function handlePaymentFailure(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
}

async function handleRefund(charge) {
    console.log('Refund processed:', charge.id);
}

// Plaid webhook for bank connections
exports.plaidWebhook = functions.https.onRequest(async (req, res) => {
    const { webhook_type, webhook_code, item_id } = req.body;

    switch (webhook_type) {
        case 'TRANSACTIONS':
            if (webhook_code === 'DEFAULT_UPDATE') {
                await updateTransactions(item_id);
            }
            break;
        case 'ITEM':
            if (webhook_code === 'ERROR') {
                await handleItemError(item_id, req.body.error);
            }
            break;
    }

    res.json({ received: true });
});

async function updateTransactions(itemId) {
    // Fetch and update transactions from Plaid
    console.log('Updating transactions for item:', itemId);
}

async function handleItemError(itemId, error) {
    console.error('Plaid item error:', itemId, error);
}
