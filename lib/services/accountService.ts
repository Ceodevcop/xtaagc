import { 
  db, collection, doc, setDoc, getDoc, updateDoc,
  query, where, getDocs, serverTimestamp, onSnapshot,
  increment, runTransaction
} from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firebase/config';

export interface Account {
  id: string;
  userId: string;
  type: 'checking' | 'savings' | 'investment';
  currency: string;
  balance: number;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  status: 'active' | 'frozen' | 'closed';
  interestRate?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export class AccountService {
  private static instance: AccountService;

  static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  // Get user accounts with real-time updates
  subscribeToAccounts(userId: string, callback: (accounts: Account[]) => void) {
    const accountsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS);
    const q = query(accountsRef, where('status', '==', 'active'));
    
    return onSnapshot(q, (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Account[];
      callback(accounts);
    });
  }

  // Create new account
  async createAccount(userId: string, data: {
    type: 'checking' | 'savings' | 'investment';
    currency: string;
    initialDeposit?: number;
  }): Promise<Account> {
    const accountNumber = this.generateAccountNumber();
    
    const accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      type: data.type,
      currency: data.currency,
      balance: data.initialDeposit || 0,
      accountNumber,
      routingNumber: '121000358', // Example routing number
      status: 'active',
      metadata: {
        createdAt: serverTimestamp(),
      },
    };

    const accountRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS));
    await setDoc(accountRef, {
      ...accountData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // If initial deposit, create transaction
    if (data.initialDeposit && data.initialDeposit > 0) {
      const transactionRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
      await setDoc(transactionRef, {
        type: 'fund',
        amount: data.initialDeposit,
        currency: data.currency,
        accountId: accountRef.id,
        status: 'completed',
        description: 'Initial deposit',
        createdAt: serverTimestamp(),
      });
    }

    return {
      id: accountRef.id,
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Get account balance
  async getBalance(userId: string, accountId: string): Promise<number> {
    const accountRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, accountId);
    const accountDoc = await getDoc(accountRef);
    
    if (!accountDoc.exists()) {
      throw new Error('Account not found');
    }

    return accountDoc.data().balance || 0;
  }

  // Get total balance across all accounts
  async getTotalBalance(userId: string): Promise<{
    total: number;
    byCurrency: Record<string, number>;
  }> {
    const accountsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS);
    const q = query(accountsRef, where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    let total = 0;
    const byCurrency: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const account = doc.data();
      const balance = account.balance || 0;
      const currency = account.currency || 'USD';
      
      byCurrency[currency] = (byCurrency[currency] || 0) + balance;
      total += balance;
    });

    return { total, byCurrency };
  }

  // Transfer between accounts
  async transferBetweenAccounts(
    userId: string,
    fromAccountId: string,
    toAccountId: string,
    amount: number
  ): Promise<void> {
    await runTransaction(db, async (transaction) => {
      const fromRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, fromAccountId);
      const toRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.ACCOUNTS, toAccountId);

      const fromDoc = await transaction.get(fromRef);
      const toDoc = await transaction.get(toRef);

      if (!fromDoc.exists() || !toDoc.exists()) {
        throw new Error('Account not found');
      }

      const fromBalance = fromDoc.data().balance || 0;
      if (fromBalance < amount) {
        throw new Error('Insufficient funds');
      }

      transaction.update(fromRef, {
        balance: increment(-amount),
        updatedAt: serverTimestamp(),
      });

      transaction.update(toRef, {
        balance: increment(amount),
        updatedAt: serverTimestamp(),
      });

      // Create transaction record
      const transactionRef = doc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.TRANSACTIONS));
      transaction.set(transactionRef, {
        type: 'transfer',
        amount,
        fromAccountId,
        toAccountId,
        status: 'completed',
        description: 'Transfer between accounts',
        createdAt: serverTimestamp(),
      });
    });
  }

  // Generate account number
  private generateAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
}

export const accountService = AccountService.getInstance();
