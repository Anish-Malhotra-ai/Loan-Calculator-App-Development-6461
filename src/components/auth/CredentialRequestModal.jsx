import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import InputField from '../ui/InputField';
import supabase from '../../lib/supabase';

const { FiX, FiMail, FiUser, FiSend, FiCheck } = FiIcons;

const CredentialRequestModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email && !username) {
        throw new Error('Please provide either email or username');
      }

      // Search for user by email or username
      let query = supabase.from('users_admin_x94d2').select('*');
      if (email) {
        query = query.eq('email', email.trim().toLowerCase());
      } else if (username) {
        query = query.ilike('username', `%${username.trim()}%`);
      }

      const { data: user, error: searchError } = await query;

      if (searchError) {
        throw new Error('Error searching for user');
      }

      if (!user || user.length === 0) {
        throw new Error('No user found with the provided information');
      }

      // Create credential request
      const { error: requestError } = await supabase
        .from('credential_requests_x94d2')
        .insert([
          {
            email: email || user[0].email,
            username: username || user[0].username,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (requestError) throw requestError;

      setSuccess(true);
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Request Login Credentials</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Request Sent Successfully!</h4>
              <p className="text-gray-600 text-sm">
                Your credential request has been sent to the administrator.
                You will receive your login details via email once approved.
              </p>
            </motion.div>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-6">
                Forgot your login credentials? Provide your email or username below and we'll
                send a request to the administrator to help you recover your account.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  icon={FiMail}
                  placeholder="Enter your email address"
                />

                <div className="text-center text-gray-500 text-sm">
                  - OR -
                </div>

                <InputField
                  label="Username"
                  value={username}
                  onChange={setUsername}
                  icon={FiUser}
                  placeholder="Enter your username"
                />

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <motion.button
                    type="submit"
                    disabled={loading || (!email && !username)}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <SafeIcon icon={FiSend} className="w-4 h-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CredentialRequestModal;