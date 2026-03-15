import React, { useState } from 'react';
import { getFunctions, httpsCallable } from '../firebase';
import { BoltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Bills() {
  const [formData, setFormData] = useState({
    disco: 'AEDC',
    meterNumber: '',
    amount: '',
    customerName: ''
  });
  const [loading, setLoading] = useState(false);

  const discos = [
    { name: 'AEDC', commission: '1.29%' },
    { name: 'EEDC', commission: '1.29%' },
    { name: 'KAEDC', commission: '1.29%' },
    { name: 'PHED', commission: '1.29%' },
    { name: 'JED', commission: '1.29%' },
    { name: 'IBEDC', commission: '0.86%' },
    { name: 'IEDC', commission: '1.20%' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const functions = getFunctions();
      const payBill = httpsCallable(functions, 'payBill');
      
      const result = await payBill(formData);
      
      toast.success('Bill payment successful!');
      setFormData({ ...formData, meterNumber: '', amount: '', customerName: '' });
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Pay Electricity Bill</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Select Disco</label>
            <select
              value={formData.disco}
              onChange={(e) => setFormData({ ...formData, disco: e.target.value })}
              className="input-field"
            >
              {discos.map((disco) => (
                <option key={disco.name} value={disco.name}>
                  {disco.name} - Commission: {disco.commission}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Meter Number</label>
            <input
              type="text"
              value={formData.meterNumber}
              onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
              className="input-field"
              placeholder="Enter meter number"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Customer Name</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="input-field"
              placeholder="Enter customer name"
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
            {loading ? 'Processing...' : 'Pay Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}
