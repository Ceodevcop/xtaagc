import React, { useState } from 'react';
import { getFunctions, httpsCallable } from '../firebase';
import { TrophyIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Betting() {
  const [formData, setFormData] = useState({
    provider: 'Bet9ja',
    customerId: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);

  const providers = [
    { name: 'Bet9ja', commission: '0.34% (₦850 cap)' },
    { name: 'BetKing', commission: '0.86% (₦860 cap)' },
    { name: '1xBet', commission: '0.30%' },
    { name: 'BetLand', commission: '0.30%' },
    { name: 'MerryBet', commission: '0.13%' },
    { name: 'NairaBet', commission: '0.13%' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const functions = getFunctions();
      const fundBetting = httpsCallable(functions, 'fundBetting');
      
      const result = await fundBetting(formData);
      
      toast.success('Betting account funded successfully!');
      setFormData({ ...formData, customerId: '', amount: '' });
    } catch (error) {
      toast.error(error.message || 'Funding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Fund Betting Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Select Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="input-field"
            >
              {providers.map((provider) => (
                <option key={provider.name} value={provider.name}>
                  {provider.name} - Commission: {provider.commission}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Customer ID/Username</label>
            <input
              type="text"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="input-field"
              placeholder="Enter your betting ID"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Amount (₦)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field"
              placeholder="1000"
              min="100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Processing...' : 'Fund Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
