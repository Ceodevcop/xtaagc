import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db, setDoc, doc } from '../firebase';
import { PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PhoneVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, isNewUser } = location.state || {};

  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const confirmationId = sessionStorage.getItem('confirmation');
      const confirmation = auth.ConfirmationResult.fromVerificationId(confirmationId);
      
      const otpCode = otp.join('');
      const result = await confirmation.confirm(otpCode);

      if (isNewUser) {
        const userData = JSON.parse(sessionStorage.getItem('pendingUser'));
        
        // Save user to Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
          ...userData,
          uid: result.user.uid,
          walletBalance: 0,
          kycStatus: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Create wallet
        const functions = getFunctions();
        const createWallet = httpsCallable(functions, 'createWallet');
        await createWallet({
          userId: result.user.uid,
          email: userData.email,
          phone: userData.phone
        });

        sessionStorage.removeItem('pendingUser');
      }

      sessionStorage.removeItem('confirmation');
      toast.success('Verification successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setTimeLeft(60);
    toast.success('OTP resent successfully');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <PhoneIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Verify Your Phone</h2>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit code to {phone}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength="1"
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Didn't receive code?{' '}
            {timeLeft > 0 ? (
              <span className="text-gray-500">Resend in {timeLeft}s</span>
            ) : (
              <button
                onClick={resendOTP}
                className="text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
