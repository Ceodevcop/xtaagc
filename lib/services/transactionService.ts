import { 
  db, collection, doc, setDoc, getDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
  runTransaction, onSnapshot, Timestamp 
} from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/config';

export interface Transaction {
  id: string;
  userId: string;
  type: 'purchase' | 'fund' | 'withdraw' | 'transfer' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  merchant?: string;
  cardId?: string;
  accountId?: string;
  recipientId?: string;
  recipientName?: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export class TransactionService {
  private static instance: TransactionService;

  static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  // Get user transactions with real-time updates
  subscribeToTransactions(
    userId: string, 
    callback: (transactions: Transaction[]) => void,
    limitCount: number = 20
  ) {
    const transactionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS);
    const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Transaction[];
      callback(transactions);
    });
  }

  // Create transaction
  async createTransaction(userId: string, data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const transactionRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
    
    const transactionData = {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(transactionRef, transactionData);

    return {
      id: transactionRef.id,
      ...data,
      createdAt: new Date(),
    } as Transaction;
  }

  // Process transfer between users
  async processTransfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string,
    description: string
  ): Promise<Transaction> {
    return await runTransaction(db, async (transaction) => {
      // Get sender's account
      const senderAccountRef = doc(db, COLLECTIONS.USERS, fromUserId, COLLECTIONS.ACCOUNTS, 'main');
      const senderAccount = await transaction.get(senderAccountRef);
      
      if (!senderAccount.exists()) {
        throw new Error('Sender account not found');
      }

      const senderBalance = senderAccount.data().balance || 0;
      if (senderBalance < amount) {
        throw new Error('Insufficient funds');
      }

      // Get recipient's account
      const recipientAccountRef = doc(db, COLLECTIONS.USERS, toUserId, COLLECTIONS.ACCOUNTS, 'main');
      const recipientAccount = await transaction.get(recipientAccountRef);
      
      if (!recipientAccount.exists()) {
        throw new Error('Recipient account not found');
      }

      // Update balances
      transaction.update(senderAccountRef, {
        balance: senderBalance - amount,
        updatedAt: serverTimestamp(),
      });

      transaction.update(recipientAccountRef, {
        balance: (recipientAccount.data().balance || 0) + amount,
        updatedAt: serverTimestamp(),
      });

      // Create transaction records
      const senderTransactionRef = doc(collection(db, COLLECTIONS.USERS, fromUserId, COLLECTIONS.TRANSACTIONS));
      const recipientTransactionRef = doc(collection(db, COLLECTIONS.USERS, toUserId, COLLECTIONS.TRANSACTIONS));

      const transactionData = {
        type: 'transfer',
        amount,
        currency,
        status: 'completed',
        description,
        recipientId: toUserId,
        senderId: fromUserId,
        createdAt: serverTimestamp(),
      };

      transaction.set(senderTransactionRef, {
        ...transactionData,
        type: 'transfer_out',
      });

      transaction.set(recipientTransactionRef, {
        ...transactionData,
        type: 'transfer_in',
      });

      return {
        id: senderTransactionRef.id,
        ...transactionData,
        createdAt: new Date(),
      } as Transaction;
    });
  }

  // Get transaction by ID
  async getTransaction(userId: string, transactionId: string): Promise<Transaction | null> {
    const transactionRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS, transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      return null;
    }

    return {
      id: transactionDoc.id,
      ...transactionDoc.data(),
      createdAt: transactionDoc.data().createdAt?.toDate(),
      updatedAt: transactionDoc.data().updatedAt?.toDate(),
    } as Transaction;
  }

  // Get transaction statistics
  async getTransactionStats(userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    const transactionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS);
    const q = query(
      transactionsRef,
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const transactions = snapshot.docs.map(doc => doc.data());

    const totalSpent = transactions
      .filter(t => t.type === 'purchase' || t.type === 'transfer_out')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
      .filter(t => t.type === 'transfer_in' || t.type === 'fund')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = transactions.reduce((acc: any, t) => {
      const category = t.metadata?.category || 'other';
      if (!acc[category]) acc[category] = 0;
      acc[category] += t.amount;
      return acc;
    }, {});

    return {
      period,
      totalSpent,
      totalReceived,
      netFlow: totalReceived - totalSpent,
      transactionCount: transactions.length,
      byCategory,
      startDate,
      endDate: new Date(),
    };
  }
}

export const transactionService = TransactionService.getInstance();
