import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db, getDoc, doc, collection, query, where, getDocs, orderBy, limit } from '../firebase';
import { 
  WalletIcon, 
  PhoneIcon, 
  BoltIcon, 
  TrophyIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalCommission: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setUser(userDoc.data());

        // Get wallet
        const walletDoc = await getDoc(doc(db, 'wallets', currentUser.uid));
        setWallet(walletDoc.data());

        // Get recent transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactions = transactionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentTransactions(transactions);

        // Calculate stats
        const allTransactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid)
        );
        const allTransactions = await getDocs(allTransactionsQuery);
        
        let total = 0;
        let commission = 0;
        allTransactions.forEach(doc => {
          const data = doc.data();
          total += data.amount || 0;
          commission += data.commission || 0;
        });

        setStats({
          totalSpent: total,
          totalCommission: commission,
          transactionCount: allTransactions.size
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    { name: 'Buy Airtime', icon: PhoneIcon, href: '/airtime', color: 'bg-green-500' },
    { name: 'Pay Bills', icon: BoltIcon, href: '/bills', color: 'bg-yellow-500' },
    { name: 'Fund Betting', icon: TrophyIcon, href: '/betting', color: 'bg-purple-500' },
    { name: 'View Wallet', icon: WalletIcon, href: '/wallet', color: 'bg-blue-500' },
  ];

  const chartData = recentTransactions.reverse().map(t => ({
    date: format(t.createdAt?.toDate?.() || new Date(), 'dd MMM'),
    amount: t.amount
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-600 font-medium">
            {user?.role === 'agent' ? 'Agent' : user?.role === 'slp' ? 'SLP' : 'Customer'}
          </span>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="dashboard-card">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-100 mb-2">Wallet Balance</p>
            <p className="text-4xl font-bold">₦{wallet?.balance?.toLocaleString() || '0.00'}</p>
            <p className="text-blue-100 mt-2">Account: {wallet?.accountNumber || 'N/A'}</p>
          </div>
          <WalletIcon className="h-16 w-16 text-white opacity-50" />
        </div>
        <div className="mt-4 flex gap-4">
          <Link to="/wallet/fund" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
            Fund Wallet
          </Link>
          <Link to="/wallet/withdraw" className="bg-transparent border border-white text-white px-4 py-2 rounded-lg text-sm font-medium">
            Withdraw
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">₦{stats.totalSpent.toLocaleString()}</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Commission Earned</p>
              <p className="text-2xl font-bold">₦{stats.totalCommission.toLocaleString()}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Transactions</p>
              <p className="text-2xl font-bold">{stats.transactionCount}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="text-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Transaction Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link to="/transactions" className="text-blue-600 hover:underline text-sm">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'airtime' ? 'bg-green-100' :
                    transaction.type === 'bill' ? 'bg-yellow-100' :
                    transaction.type === 'betting' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'airtime' && <PhoneIcon className="h-5 w-5 text-green-600" />}
                    {transaction.type === 'bill' && <BoltIcon className="h-5 w-5 text-yellow-600" />}
                    {transaction.type === 'betting' && <TrophyIcon className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'airtime' && `${transaction.network} Airtime`}
                      {transaction.type === 'bill' && `${transaction.disco} Bill`}
                      {transaction.type === 'betting' && `${transaction.provider} Funding`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.createdAt?.toDate?.() 
                        ? format(transaction.createdAt.toDate(), 'dd MMM yyyy, hh:mm a')
                        : 'Just now'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{transaction.amount?.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+₦{transaction.commission?.toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
