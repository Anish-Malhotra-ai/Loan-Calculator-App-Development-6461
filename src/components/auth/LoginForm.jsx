import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import InputField from '../ui/InputField';
import { useAuth } from '../../context/AuthContext';
import CredentialRequestModal from './CredentialRequestModal';

const { FiUser, FiLock, FiLogIn, FiAlertCircle, FiHelpCircle } = FiIcons;

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentialRequest, setShowCredentialRequest] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting login form with:', { email, password });
      const { success, error } = await login(email, password);
      
      if (!success) {
        setError(error || 'Invalid email or password. Please check your credentials.');
        setLoading(false);
        return;
      }
      
      // Successfully logged in
      console.log('Login successful, navigating to home');
      navigate('/');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('user@example.com');
      setPassword('user123');
    }
    setError(''); // Clear any existing errors
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <SafeIcon icon={FiLogIn} className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              Secure Login
            </h2>
          </div>
          <p className="text-center text-white text-opacity-80 mt-2">
            Enter your credentials to access the application
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <motion.div 
              className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-start">
                <SafeIcon icon={FiAlertCircle} className="text-red-500 mr-3 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              icon={FiUser}
              placeholder="Enter your email"
              required
            />
            
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              icon={FiLock}
              placeholder="Enter your password"
              required
            />
            
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center">
                  <SafeIcon icon={FiLogIn} className="mr-2" />
                  Login
                </span>
              )}
            </motion.button>
          </form>

          {/* Forgot Credentials */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCredentialRequest(true)}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center justify-center space-x-1 mx-auto"
            >
              <SafeIcon icon={FiHelpCircle} className="w-4 h-4" />
              <span>Forgot your credentials?</span>
            </button>
          </div>

          <div className="mt-6">
            <div className="text-center text-sm font-medium text-gray-700 mb-3">Demo Accounts - Click to Auto-Fill:</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fillDemoCredentials('admin')}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 p-3 rounded-lg text-center transition-colors cursor-pointer"
              >
                <p className="font-semibold text-purple-700">Admin Account</p>
                <p className="text-xs text-purple-600">admin@example.com</p>
                <p className="text-xs text-purple-600">admin123</p>
              </button>
              <button
                onClick={() => fillDemoCredentials('user')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-3 rounded-lg text-center transition-colors cursor-pointer"
              >
                <p className="font-semibold text-blue-700">User Account</p>
                <p className="text-xs text-blue-600">user@example.com</p>
                <p className="text-xs text-blue-600">user123</p>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Credential Request Modal */}
      {showCredentialRequest && (
        <CredentialRequestModal 
          onClose={() => setShowCredentialRequest(false)}
        />
      )}
    </>
  );
};

export default LoginForm;