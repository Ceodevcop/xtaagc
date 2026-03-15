import React, { useState } from 'react';
import { getFunctions, httpsCallable } from '../firebase';
import { PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Airtime() {
  const [formData, setFormData] = useState({
    network: 'MTN',
    phoneNumber: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);

  const networks = [
    { name: 'MTN', commission: '3.00%' },
    { name: 'Airtel', commission: '3.00%' },
    { name: 'Glo', commission: '4.29%' },
    { name: '9mobile', commission: '7.71%' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const functions = getFunctions();
      const purchaseAirtime = httpsCallable(functions, 'purchaseAirtime');
      
      const result = await purchaseAirtime(formData);
      
      toast.success('Airtime purchased successfully!');
      setFormData({ ...formData, phoneNumber: '', amount: '' });
    } catch (error) {
      toast.error(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Buy Airtime</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Select Network</label>
            <div className="grid grid-cols-2 gap-3">
              {networks.map((net) => (
                <button
                  key={net.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, network: net.name })}
                  className={`p-3 border rounded-lg text-center ${
                    formData.network === net.name 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-medium">{net.name}</div>
                  <div className="text-sm text-gray-500">Commission: {net.commission}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Phone Number</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="input-field pl-10"
                placeholder="08012345678"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Amount (₦)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input-field"
              placeholder="100"
              min="50"
              required
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-bold">Commission Preview:</span> You will earn{' '}
              <span className="font-bold">
                ₦{(parseFloat(formData.amount || 0) * 
                  (formData.network === 'MTN' ? 0.03 : 
                   formData.network === 'Airtel' ? 0.03 :
                   formData.network === 'Glo' ? 0.0429 : 0.0771)).toFixed(2)}
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Processing...' : 'Buy Airtime'}
          </button>
        </form>
      </div>
    </div>
  );
}
