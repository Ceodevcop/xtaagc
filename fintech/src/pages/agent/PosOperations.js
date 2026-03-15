import React, { useState, useEffect } from 'react';
import { auth, db, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from '../../firebase';
import { getFunctions, httpsCallable } from '../../firebase';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import QRCode from 'qrcode.react';

export default function PosOperations() {
  const [activeTab, setActiveTab] = useState('cash-in');
  const [formData, setFormData] = useState({
    amount: '',
    customerPhone: '',
    customerName: '',
    terminalId: '',
    reference: ''
  });
  const [terminals, setTerminals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTerminals();
    fetchRecentTransactions();
  }, []);

  const fetchTerminals = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const agentsQuery = query(
      collection(db, 'agents'),
      where('userId', '==', user.uid)
    );
    const agentsSnapshot = await getDocs(agentsQuery);
    
    if (!agentsSnapshot.empty) {
      const agentId = agentsSnapshot.docs[0].id;
      const terminalsQuery = query(
        collection(db, 'posTerminals'),
        where('agentId', '==', agentId),
        where('status', '==', 'active')
      );
      const terminalsSnapshot = await getDocs(terminalsQuery);
      setTerminals(terminalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  const fetchRecentTransactions = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const transactionsQuery = query(
      collection(db, 'posTransactions'),
      where('agentId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(transactionsQuery);
    setRecentTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      const functions = getFunctions();
      const recordTransaction = httpsCallable(functions, 'recordPosTransaction');

      const result = await recordTransaction({
        type: activeTab,
        amount: parseFloat(formData.amount),
        customerPhone: formData.customerPhone,
        terminalId: formData.terminalId
      });

      // Save to Firestore
      await addDoc(collection(db, 'posTransactions'), {
        agentId: user.uid,
        type: activeTab,
        amount: parseFloat(formData.amount),
        customerPhone: formData.customerPhone,
        customerName: formData.customerName,
        terminalId: formData.terminalId,
        commission: result.data.commission,
        status: 'completed',
        reference: `POS${Date.now()}`,
        createdAt: serverTimestamp()
      });

      toast.success(`${activeTab === 'cash-in' ? 'Cash-in' : 'Cash-out'} successful! Commission: ₦${result.data.commission}`);
      setFormData({ amount: '', customerPhone: '', customerName: '', terminalId: '', reference: '' });
      fetchRecentTransactions();
    } catch (error) {
      toast.error(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const commissionRates = {
    'cash-out': '0.04% (₦25 max)',
    'transfer': '₦4.00 flat',
    'cash-in': 'No commission'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">POS Operations</h1>

      {/* Commission Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Commission Rates</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>Cash-out: <span className="font-bold">0.04% (₦25 max)</span></div>
          <div>Transfer: <span className="font-bold">₦4.00 flat</span></div>
          <div>Cash-in: <span className="font-bold">No commission</span></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Transaction Form */}
        <div className="card">
          <div className="flex border-b mb-6">
            <button
              className={`flex-1 py-2 text-center ${activeTab === 'cash-in' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('cash-in')}
            >
              <ArrowDownIcon className="h-5 w-5 inline mr-2" />
              Cash In
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === 'cash-out' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('cash-out')}
            >
              <ArrowUpIcon className="h-5 w-5 inline mr-2" />
              Cash Out
            </button>
            <button
              className={`flex-1 py-2 text-center ${activeTab === 'transfer' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('transfer')}
            >
              <ArrowPathIcon className="h-5 w-5 inline mr-2" />
              Transfer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Select Terminal</label>
              <select
                value={formData.terminalId}
                onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Choose terminal</option>
                {terminals.map(term => (
                  <option key={term.id} value={term.id}>
                    {term.id} - {term.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Amount (₦)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
                min="100"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Customer Phone</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="input-field"
                placeholder="08012345678"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Customer Name (Optional)</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="input-field"
                placeholder="John Doe"
              />
            </div>

            {activeTab === 'cash-out' && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Commission: ₦{Math.min(parseFloat(formData.amount || 0) * 0.0004, 25).toFixed(2)}
                </p>
              </div>
            )}

            {activeTab === 'transfer' && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Commission: ₦4.00 flat rate
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                activeTab === 'cash-in' ? 'bg-green-600 hover:bg-green-700' :
                activeTab === 'cash-out' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : `Process ${activeTab.replace('-', ' ')}`}
            </button>
          </form>
        </div>

        {/* QR Code Scanner Placeholder */}
        <div className="card text-center">
          <h3 className="text-lg font-semibold mb-4">Scan Customer QR Code</h3>
          <div className="bg-gray-100 p-8 rounded-lg flex justify-center">
            <QrCodeIcon className="h-32 w-32 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Scan customer's QR code to auto-fill their details
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'cash-in' ? 'bg-green-100' :
                    tx.type === 'cash-out' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {tx.type === 'cash-in' && <ArrowDownIcon className="h-5 w-5 text-green-600" />}
                    {tx.type === 'cash-out' && <ArrowUpIcon className="h-5 w-5 text-red-600" />}
                    {tx.type === 'transfer' && <ArrowPathIcon className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-sm text-gray-500">{tx.customerPhone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{tx.amount?.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+₦{tx.commission?.toFixed(2)}</p>
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
