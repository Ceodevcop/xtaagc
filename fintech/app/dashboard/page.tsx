'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { cardService, type Card } from '@/lib/services/cardService';
import { transactionService, type Transaction } from '@/lib/services/transactionService';
import { userService, type User } from '@/lib/services/userService';
import { accountService } from '@/lib/services/accountService';
import { Card as CardComponent } from '@/components/cards/Card';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/shared/LoadingScreen';
import { 
  Plus, MoreHorizontal, Eye, EyeOff, Copy, 
  Wallet, Download, Settings, Snowflake, LogOut,
  Bell, User as UserIcon 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time data
  useEffect(() => {
    if (!authUser) {
      router.push('/login');
      return;
    }

    setLoading(true);

    // Subscribe to user data
    const unsubscribeUser = userService.subscribeToUser(authUser.uid, (userData) => {
      setUser(userData);
    });

    // Subscribe to cards
    const unsubscribeCards = cardService.subscribeToUserCards(authUser.uid, (cardsData) => {
      setCards(cardsData);
      
      // Calculate total balance from all cards
      const total = cardsData.reduce((sum, card) => sum + (card.balance || 0), 0);
      setTotalBalance(total);
    });

    // Subscribe to recent transactions
    const unsubscribeTransactions = transactionService.subscribeToTransactions(
      authUser.uid,
      (transactionsData) => {
        setTransactions(transactionsData);
        setLoading(false);
      },
      10
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeUser();
      unsubscribeCards();
      unsubscribeTransactions();
    };
  }, [authUser, router]);

  const toggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const handleCopyCard = async (cardNumber: string) => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      toast.success('Card number copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy card number');
    }
  };

  const handleFreezeCard = async (cardId: string) => {
    try {
      const isActive = await cardService.toggleFreeze(authUser!.uid, cardId);
      toast.success(isActive ? 'Card unfrozen' : 'Card frozen');
    } catch (error) {
      toast.error('Failed to freeze/unfreeze card');
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Virtual Dollar Cards</h1>
              <button 
                onClick={toggleBalance}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle balance visibility"
              >
                {showBalance ? <Eye className="h-5 w-5 text-gray-500" /> : <EyeOff className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.profile?.firstName?.charAt(0) || authUser?.email?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {cards.map((card) => (
            <CardComponent 
              key={card.id} 
              card={card} 
              showBalance={showBalance}
              onCopy={() => handleCopyCard(card.cardNumber)}
              onFreeze={() => handleFreezeCard(card.id)}
            />
          ))}

          {/* Add New Card */}
          <Link href="/cards/issue" className="block">
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8 h-full flex flex-col items-center justify-center text-center hover:border-blue-600 hover:bg-blue-50 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100">
                <Plus className="h-8 w-8 text-gray-400 group-hover:text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">+ Add New Card</h3>
              <p className="text-sm text-gray-500">Create a new virtual USD card</p>
            </div>
          </Link>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
          <h2 className="text-xl font-semibold mb-2">Get virtual USD cards that work.</h2>
          <p className="text-blue-100 mb-4">Create virtual cards for online payments, subscriptions, and more</p>
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
            Learn More
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {transaction.merchant?.substring(0, 3) || 'TXN'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.createdAt?.toLocaleDateString()} at{' '}
                        {transaction.createdAt?.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      transaction.type === 'purchase' ? 'text-red-600' :
                      transaction.type === 'fund' ? 'text-green-600' :
                      transaction.type === 'transfer_out' ? 'text-red-600' :
                      'text-green-600'
                    }`}>
                      {transaction.type === 'purchase' || transaction.type === 'transfer_out' ? '-' : '+'}
                      ${transaction.amount.toFixed(2)}
                    </span>
                    <p className={`text-xs ${
                      transaction.status === 'completed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
