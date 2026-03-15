import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, signInWithPhoneNumber, setupRecaptcha, setDoc, doc } from '../firebase';
import { UserIcon, PhoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    businessName: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setupRecaptcha('recaptcha-container');
      const confirmation = await signInWithPhoneNumber(auth, formData.phone, window.recaptchaVerifier);
      
      // Store user data temporarily
      sessionStorage.setItem('pendingUser', JSON.stringify(formData));
      sessionStorage.setItem('confirmation', confirmation.verificationId);
      
      toast.success('OTP sent successfully!');
      navigate('/verify', { state: { phone: formData.phone, isNewUser: true } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Create Your Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Phone Number</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="08012345678"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Business Name (Optional)</label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Your Business Name"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Account Type</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="customer">Customer</option>
              <option value="agent">Agent (₦400,000 registration fee)</option>
              <option value="slp">Service Location Partner</option>
            </select>
          </div>

          {formData.role === 'agent' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Agent registration requires ₦400,000 onboarding fee for 50 POS terminals.
                You'll be contacted for payment after verification.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login here
          </Link>
        </p>
        
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
