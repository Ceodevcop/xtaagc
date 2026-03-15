import React, { useState, useEffect } from 'react';
import { auth, db, collection, query, where, getDocs, addDoc, serverTimestamp } from '../../firebase';
import { 
  UserPlusIcon, 
  UserGroupIcon,
  ChartBarIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SubAgents() {
  const [subAgents, setSubAgents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    commission: '50',
    terminalId: ''
  });
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubAgents();
    fetchAvailableTerminals();
  }, []);

  const fetchSubAgents = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const subAgentsQuery = query(
      collection(db, 'users'),
      where('agentId', '==', user.uid)
    );
    const snapshot = await getDocs(subAgentsQuery);
    setSubAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchAvailableTerminals = async () => {
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
        where('assignedTo', '==', null)
      );
      const terminalsSnapshot = await getDocs(terminalsQuery);
      setTerminals(terminalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;

      // Create sub-agent record
      await addDoc(collection(db, 'users'), {
        ...formData,
        agentId: user.uid,
        role: 'sub-agent',
        walletBalance: 0,
        kycStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Assign terminal if selected
      if (formData.terminalId) {
        await db.collection('posTerminals').doc(formData.terminalId).update({
          assignedTo: formData.fullName,
          assignedAt: serverTimestamp()
        });
      }

      toast.success('Sub-agent added successfully');
      setShowForm(false);
      setFormData({ fullName: '', phone: '', email: '', commission: '50', terminalId: '' });
      fetchSubAgents();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sub-Agents Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>Add Sub-Agent</span>
        </button>
      </div>

      {/* Add Sub-Agent Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Register New Sub-Agent</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block mb-2">Commission Split (%)</label>
                <input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  className="input-field"
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Assign Terminal</label>
                <select
                  value={formData.terminalId}
                  onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select terminal</option>
                  {terminals.map(term => (
                    <option key={term.id} value={term.id}>{term.id}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Adding...' : 'Add Sub-Agent'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-Agents List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Sub-Agents</h2>
        <div className="space-y-4">
          {subAgents.length > 0 ? (
            subAgents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.fullName}</h3>
                    <p className="text-sm text-gray-600">{agent.phone}</p>
                    <p className="text-xs text-gray-500">Commission: {agent.commission}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    agent.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    agent.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agent.kycStatus}
                  </span>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <ChartBarIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No sub-agents yet. Add your first sub-agent!</p>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <p className="text-purple-100 mb-2">Total Sub-Agents</p>
          <p className="text-3xl font-bold">{subAgents.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <p className="text-blue-100 mb-2">Active Today</p>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <p className="text-green-100 mb-2">Total Commission</p>
          <p className="text-3xl font-bold">₦0</p>
        </div>
      </div>
    </div>
  );
}
