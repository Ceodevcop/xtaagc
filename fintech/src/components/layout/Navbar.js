import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signOut, getCurrentUser, getUserRole } from '../../firebase';
import { 
  HomeIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Airtime', href: '/airtime', icon: HomeIcon },
      { name: 'Bills', href: '/bills', icon: HomeIcon },
      { name: 'Betting', href: '/betting', icon: HomeIcon },
      { name: 'Wallet', href: '/wallet', icon: WalletIcon },
    ] : []),
    ...(userRole === 'agent' || userRole === 'slp' ? [
      { name: 'Agent Portal', href: '/agent', icon: HomeIcon }
    ] : []),
    ...(userRole === 'admin' ? [
      { name: 'Admin', href: '/admin', icon: HomeIcon }
    ] : [])
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">TAAGC</span>
            <span className="text-gray-600">Fintech</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {user.phoneNumber || 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <div className="px-4 py-2 space-y-2">
                <Link
                  to="/login"
                  className="block text-center btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block text-center btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
