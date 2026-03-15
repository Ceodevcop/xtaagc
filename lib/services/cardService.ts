import { 
  db, collection, doc, setDoc, getDoc, updateDoc, 
  query, where, getDocs, serverTimestamp, runTransaction,
  arrayUnion, increment 
} from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/config';

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  balance: number;
  currency: string;
  type: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'blocked' | 'expired';
  brand: 'visa' | 'mastercard' | 'amex';
  spendingLimit?: number;
  dailySpent: number;
  monthlySpent: number;
  createdAt: Date;
  lastUsed?: Date;
  frozenAt?: Date;
  metadata?: Record<string, any>;
}

export class CardService {
  private static instance: CardService;
  private constructor() {}

  static getInstance(): CardService {
    if (!CardService.instance) {
      CardService.instance = new CardService();
    }
    return CardService.instance;
  }

  // Get user's cards with real-time updates
  subscribeToUserCards(userId: string, callback: (cards: Card[]) => void) {
    const cardsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS);
    const q = query(cardsRef, where('status', 'in', ['active', 'frozen']));
    
    return onSnapshot(q, (snapshot) => {
      const cards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastUsed: doc.data().lastUsed?.toDate(),
        frozenAt: doc.data().frozenAt?.toDate(),
      })) as Card[];
      callback(cards);
    });
  }

  // Issue new card
  async issueCard(userId: string, data: {
    type: 'virtual' | 'physical';
    currency: string;
    spendingLimit?: number;
    cardholderName?: string;
  }): Promise<Card> {
    // Get user data for cardholder name
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    const userData = userDoc.data();
    
    const cardholderName = data.cardholderName || userData?.profile?.fullName || 'User';
    
    // Generate card details (in production, this would come from a card issuer)
    const cardNumber = this.generateCardNumber();
    const last4 = cardNumber.slice(-4);
    const expiryMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const expiryYear = (new Date().getFullYear() + 3).toString().slice(-2);
    const cvv = this.generateCVV();

    const cardData: Omit<Card, 'id'> = {
      userId,
      cardNumber,
      cardholderName,
      expiryMonth,
      expiryYear,
      cvv,
      balance: 0,
      currency: data.currency,
      type: data.type,
      status: 'active',
      brand: 'visa',
      spendingLimit: data.spendingLimit,
      dailySpent: 0,
      monthlySpent: 0,
      createdAt: new Date(),
      metadata: {
        last4,
        issuedAt: serverTimestamp(),
      },
    };

    // Create card document
    const cardRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS));
    await setDoc(cardRef, {
      ...cardData,
      createdAt: serverTimestamp(),
    });

    // Create audit log
    await this.createAuditLog(userId, 'CARD_ISSUED', {
      cardId: cardRef.id,
      type: data.type,
      currency: data.currency,
    });

    return {
      id: cardRef.id,
      ...cardData,
    };
  }

  // Fund card
  async fundCard(userId: string, cardId: string, amount: number): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const cardRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS, cardId);
      const cardDoc = await transaction.get(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const card = cardDoc.data();
      const newBalance = (card.balance || 0) + amount;

      transaction.update(cardRef, {
        balance: newBalance,
        lastFundedAt: serverTimestamp(),
      });

      // Create transaction record
      const transactionRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
      transaction.set(transactionRef, {
        type: 'fund',
        amount,
        cardId,
        status: 'completed',
        description: `Funded card ending in ${card.metadata?.last4}`,
        createdAt: serverTimestamp(),
      });
    });
  }

  // Withdraw from card
  async withdrawFromCard(userId: string, cardId: string, amount: number): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const cardRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS, cardId);
      const cardDoc = await transaction.get(cardRef);
      
      if (!cardDoc.exists()) {
        throw new Error('Card not found');
      }

      const card = cardDoc.data();
      
      if (card.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const newBalance = card.balance - amount;

      transaction.update(cardRef, {
        balance: newBalance,
        lastWithdrawnAt: serverTimestamp(),
      });

      // Create transaction record
      const transactionRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
      transaction.set(transactionRef, {
        type: 'withdraw',
        amount,
        cardId,
        status: 'completed',
        description: `Withdrawn from card ending in ${card.metadata?.last4}`,
        createdAt: serverTimestamp(),
      });
    });
  }

  // Freeze/Unfreeze card
  async toggleFreeze(userId: string, cardId: string): Promise<boolean> {
    const cardRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS, cardId);
    const cardDoc = await getDoc(cardRef);
    
    if (!cardDoc.exists()) {
      throw new Error('Card not found');
    }

    const card = cardDoc.data();
    const newStatus = card.status === 'active' ? 'frozen' : 'active';
    const updateData: any = {
      status: newStatus,
      updatedAt: serverTimestamp(),
    };

    if (newStatus === 'frozen') {
      updateData.frozenAt = serverTimestamp();
    }

    await updateDoc(cardRef, updateData);

    // Create audit log
    await this.createAuditLog(userId, `CARD_${newStatus === 'frozen' ? 'FROZEN' : 'UNFROZEN'}`, {
      cardId,
      previousStatus: card.status,
    });

    return newStatus === 'active';
  }

  // Authorize transaction (called from payment processor)
  async authorizeTransaction(cardId: string, amount: number, merchant: string): Promise<{
    authorized: boolean;
    reason?: string;
    transactionId?: string;
  }> {
    // Find card across all users (in production, use a dedicated cards collection)
    const cardsRef = collectionGroup(db, COLLECTIONS.CARDS);
    const q = query(cardsRef, where('cardNumber', '==', cardId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { authorized: false, reason: 'Card not found' };
    }

    const cardDoc = snapshot.docs[0];
    const card = cardDoc.data();
    const userId = cardDoc.ref.parent.parent?.id;

    if (!userId) {
      return { authorized: false, reason: 'Invalid card' };
    }

    // Check if card is frozen
    if (card.status === 'frozen') {
      return { authorized: false, reason: 'Card is frozen' };
    }

    if (card.status === 'blocked') {
      return { authorized: false, reason: 'Card is blocked' };
    }

    // Check balance
    if (card.balance < amount) {
      return { authorized: false, reason: 'Insufficient funds' };
    }

    // Check spending limits
    const today = new Date().toDateString();
    const todaySpent = card.dailySpent || 0;
    
    if (card.spendingLimit && (todaySpent + amount) > card.spendingLimit) {
      return { authorized: false, reason: 'Daily spending limit exceeded' };
    }

    // Authorize transaction
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update card spent amounts
    await updateDoc(cardDoc.ref, {
      balance: card.balance - amount,
      dailySpent: increment(amount),
      monthlySpent: increment(amount),
      lastUsed: serverTimestamp(),
    });

    // Create transaction record
    const transactionRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
    await setDoc(transactionRef, {
      id: transactionId,
      type: 'purchase',
      amount,
      merchant,
      cardId: cardDoc.id,
      status: 'completed',
      description: `Purchase at ${merchant}`,
      createdAt: serverTimestamp(),
    });

    return {
      authorized: true,
      transactionId,
    };
  }

  // Generate statement
  async generateStatement(userId: string, cardId: string, month: string, year: string): Promise<any> {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const transactionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS);
    const q = query(
      transactionsRef,
      where('cardId', '==', cardId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    const totalSpent = transactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      cardId,
      month,
      year,
      transactions,
      totalSpent,
      generatedAt: new Date(),
    };
  }

  // Manage merchants
  async addMerchant(userId: string, cardId: string, merchant: string): Promise<void> {
    const cardRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS, cardId);
    await updateDoc(cardRef, {
      'metadata.allowedMerchants': arrayUnion(merchant),
    });
  }

  async removeMerchant(userId: string, cardId: string, merchant: string): Promise<void> {
    const cardRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.CARDS, cardId);
    await updateDoc(cardRef, {
      'metadata.allowedMerchants': arrayRemove(merchant),
    });
  }

  // Private helpers
  private generateCardNumber(): string {
    // In production, this would come from a card issuer
    const prefix = '4'; // Visa
    const length = 16;
    let number = prefix;
    for (let i = 1; i < length; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  }

  private generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  private async createAuditLog(userId: string, action: string, data: any) {
    const auditRef = doc(collection(db, COLLECTIONS.AUDIT));
    await setDoc(auditRef, {
      userId,
      action,
      data,
      timestamp: serverTimestamp(),
      ip: 'system',
      userAgent: 'system',
    });
  }
}

export const cardService = CardService.getInstance();
