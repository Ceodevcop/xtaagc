import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db, getDoc, doc, collection, query, where, getDocs, orderBy, limit } from '../../firebase';
import { 
  ComputerDesktopIcon,
  CreditCardIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AgentPortal() {
  const [agent, setAgent] = useState(null);
  const [stats, setStats] = useState({
    todayTransactions: 0,
    todayCommission: 0,
    totalCommission: 0,
    activeTerminals: 0,
    subAgents: 0,
    performance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Get agent profile
        const agentsQuery = query(
          collection(db, 'agents'),
          where('userId', '==', user.uid)
        );
        const agentsSnapshot = await getDocs(agentsQuery);
        
        if (!agentsSnapshot.empty) {
          const agentData = { id: agentsSnapshot.docs[0].id, ...agentsSnapshot.docs[0].data() };
          setAgent(agentData);

          // Get today's transactions
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const transactionsQuery = query(
            collection(db, 'posTransactions'),
            where('agentId', '==', user.uid),
            where('createdAt', '>=', today)
          );
          const transactionsSnapshot = await getDocs(transactionsQuery);
          
          let todayCommission = 0;
          transactionsSnapshot.forEach(doc => {
            todayCommission += doc.data().commission || 0;
          });

          // Get sub-agents
          const subAgentsQuery = query(
            collection(db, 'users'),
            where('agentId', '==', user.uid)
          );
          const subAgentsSnapshot = await getDocs(subAgentsQuery);

          // Get terminals
          const terminalsQuery = query(
            collection(db, 'posTerminals'),
            where('agentId', '==', agentData.id)
          );
          const terminalsSnapshot = await getDocs(terminalsQuery);

          setStats({
            todayTransactions: transactionsSnapshot.size,
            todayCommission,
            totalCommission: agentData.commissionEarned || 0,
            activeTerminals: terminalsSnapshot.size,
            subAgents: subAgentsSnapshot.size,
            performance: Math.min(100, (transactionsSnapshot.size / 30) * 100) // 30 daily target
          });
        }
      } catch (error) {
        console.error('Error fetching agent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'POS Operations',
      icon: CreditCardIcon,
      description: 'Process cash-in, cash-out, and transfers',
      href: '/agent/pos',
      color: 'bg-green-500'
    },
    {
      title: 'Sub-Agents',
      icon: UserGroupIcon,
      description: 'Manage your sub-agents and their performance',
      href: '/agent/sub-agents',
      color: 'bg-blue-500'
    },
    {
      title: 'Commission',
      icon: CurrencyDollarIcon,
      description: 'View your earnings and commission history',
      href: '/agent/commission',
      color: 'bg-purple-500'
    },
    {
      title: 'Terminals',
      icon: ComputerDesktopIcon,
      description: 'Manage POS terminals and assignments',
      href: '/agent/terminals',
      color: 'bg-yellow-500'
    },
    {
      title: 'Performance',
      icon: ChartBarIcon,
      description: 'Track your performance metrics',
      href: '/agent/performance',
      color: 'bg-red-500'
    },
    {
      title: 'Reports',
      icon: DocumentTextIcon,
      description: 'Generate transaction reports',
      href: '/agent/reports',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Agent Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {agent?.businessName || 'Agent'}! Manage your POS operations.
          </p>
        </div>
        <div className="bg-green-100 px-4 py-2 rounded-lg">
          <span className="text-green-800 font-medium">
            Agent Code: {agent?.agentCode}
          </span>
        </div>
      </div>

      {/* Performance Alert */}
      {stats.performance < 50 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-bold">Performance Alert:</span> You're at {stats.performance.toFixed(0)}% of daily target (30 transactions). Increase your transactions to avoid terminal recall.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Transactions</p>
              <p className="text-3xl font-bold">{stats.todayTransactions}</p>
              <p className="text-xs text-gray-500 mt-1">Target: 30</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.performance}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Commission</p>
              <p className="text-3xl font-bold">₦{stats.todayCommission.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Total: ₦{stats.totalCommission.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Network Overview</p>
              <p className="text-3xl font-bold">{stats.activeTerminals}</p>
              <p className="text-xs text-gray-500 mt-1">Terminals | {stats.subAgents} Sub-agents</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Menu */}
      <div className="grid md:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent POS Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent POS Transactions</h2>
        <div className="space-y-3">
          {/* Add transaction list here - will be implemented in next component */}
          <p className="text-center text-gray-500 py-4">Loading transactions...</p>
        </div>
      </div>
    </div>
  );
}
