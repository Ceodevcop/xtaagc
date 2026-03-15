import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs, query, where, orderBy, limit } from '../../firebase';
import {
  UsersIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalTransactions: 0,
    totalVolume: 0,
    pendingKYC: 0,
    activeTerminals: 0,
    systemAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get user counts
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const agentsSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('role', 'in', ['agent', 'slp'])
      ));

      // Get transaction stats
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      let totalVolume = 0;
      transactionsSnapshot.forEach(doc => {
        totalVolume += doc.data().amount || 0;
      });

      // Get pending KYC
      const kycSnapshot = await getDocs(query(
        collection(db, 'users'),
        where('kycStatus', '==', 'pending')
      ));

      // Get active terminals
      const terminalsSnapshot = await getDocs(query(
        collection(db, 'posTerminals'),
        where('status', '==', 'active')
      ));

      // Get system alerts
      const alertsSnapshot = await getDocs(query(
        collection(db, 'alerts'),
        where('resolved', '==', false)
      ));

      setStats({
        totalUsers: usersSnapshot.size,
        totalAgents: agentsSnapshot.size,
        totalTransactions: transactionsSnapshot.size,
        totalVolume,
        pendingKYC: kycSnapshot.size,
        activeTerminals: terminalsSnapshot.size,
        systemAlerts: alertsSnapshot.size
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'User Management',
      icon: UsersIcon,
      description: 'Manage users, KYC, and account status',
      href: '/admin/users',
      color: 'bg-blue-500',
      count: stats.totalUsers
    },
    {
      title: 'Agent Network',
      icon: UserGroupIcon,
      description: 'Manage agents, SLPs, and sub-agents',
      href: '/admin/agents',
      color: 'bg-green-500',
      count: stats.totalAgents
    },
    {
      title: 'Terminal Management',
      icon: ComputerDesktopIcon,
      description: 'Manage POS terminals and assignments',
      href: '/admin/terminals',
      color: 'bg-purple-500',
      count: stats.activeTerminals
    },
    {
      title: 'Transactions',
      icon: CurrencyDollarIcon,
      description: 'View all transactions and settlements',
      href: '/admin/transactions',
      color: 'bg-yellow-500',
      count: stats.totalTransactions
    },
    {
      title: 'Reports',
      icon: ChartBarIcon,
      description: 'Generate system reports and analytics',
      href: '/admin/reports',
      color: 'bg-red-500'
    },
    {
      title: 'Alerts',
      icon: BellAlertIcon,
      description: 'View system alerts and notifications',
      href: '/admin/alerts',
      color: 'bg-orange-500',
      count: stats.systemAlerts
    },
    {
      title: 'Compliance',
      icon: ShieldCheckIcon,
      description: 'KYC verification and compliance checks',
      href: '/admin/compliance',
      color: 'bg-indigo-500',
      count: stats.pendingKYC
    },
    {
      title: 'Settings',
      icon: Cog6ToothIcon,
      description: 'System configuration and API settings',
      href: '/admin/settings',
      color: 'bg-gray-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Agents</p>
          <p className="text-3xl font-bold">{stats.totalAgents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Transaction Volume</p>
          <p className="text-3xl font-bold">₦{(stats.totalVolume / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Pending KYC</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingKYC}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow relative"
          >
            <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            {item.count !== undefined && (
              <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            <p className="text-center text-gray-500 py-4">Loading...</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">API Status</span>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Database</span>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Queue Processing</span>
                <span className="text-sm text-yellow-600">Normal</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
