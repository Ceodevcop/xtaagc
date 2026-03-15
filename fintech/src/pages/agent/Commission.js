import React, { useState, useEffect } from 'react';
import { auth, db, collection, query, where, getDocs, orderBy } from '../../firebase';
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Commission() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    let startDate = new Date();
    if (dateRange === 'week') {
      startDate = subDays(startDate, 7);
    } else if (dateRange === 'month') {
      startDate = subDays(startDate, 30);
    }

    const transactionsQuery = query(
      collection(db, 'posTransactions'),
      where('agentId', '==', user.uid),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(transactionsQuery);
    const txList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().createdAt?.toDate?.() || new Date()
    }));

    setTransactions(txList);

    // Calculate summaries
    const now = new Date();
    const today = now.setHours(0, 0, 0, 0);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    let total = 0, todayTotal = 0, weekTotal = 0, monthTotal = 0;

    txList.forEach(tx => {
      const txDate = tx.date;
      total += tx.commission || 0;
      
      if (txDate >= today) todayTotal += tx.commission || 0;
      if (txDate >= weekAgo) weekTotal += tx.commission || 0;
      if (txDate >= monthAgo) monthTotal += tx.commission || 0;
    });

    setSummary({ total, today: todayTotal, thisWeek: weekTotal, thisMonth: monthTotal });

    // Prepare chart data
    const dailyData = {};
    txList.forEach(tx => {
      const day = format(tx.date, 'dd MMM');
      dailyData[day] = (dailyData[day] || 0) + (tx.commission || 0);
    });

    setChartData(Object.entries(dailyData).map(([date, amount]) => ({ date, amount })));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Commission Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
          <CurrencyDollarIcon className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-blue-100 text-sm">Total Commission</p>
          <p className="text-2xl font-bold">₦{summary.total.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
          <CalendarIcon className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-green-100 text-sm">Today</p>
          <p className="text-2xl font-bold">₦{summary.today.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-lg">
          <ChartBarIcon className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-purple-100 text-sm">This Week</p>
          <p className="text-2xl font-bold">₦{summary.thisWeek.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-6 rounded-lg">
          <DocumentArrowDownIcon className="h-8 w-8 mb-2 opacity-80" />
          <p className="text-yellow-100 text-sm">This Month</p>
          <p className="text-2xl font-bold">₦{summary.thisMonth.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Commission Trend</h2>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div
