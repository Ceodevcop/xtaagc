import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signInWithPhoneNumber, setupRecaptcha } from '../firebase';
import { PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setupRecaptcha('recaptcha-container');
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      
      // Store confirmation in session
      sessionStorage.setItem('confirmation', confirmation.verificationId);
      
      toast.success('OTP sent successfully!');
      navigate('/verify', { state: { phone } });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-center mb-6">Login to TAAGC Fintech</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Phone Number</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
                placeholder="08012345678"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Sending OTP...' : 'Login with Phone'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
        
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
