import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import InputField from '../ui/InputField';
import supabase from '../../lib/supabase';

const { FiUser, FiMail, FiLock, FiUserCheck, FiDollarSign } = FiIcons;

const UserForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    amount: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Validate form
      if (!formData.username || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields');
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Create user in our custom table
      const { error: supabaseError } = await supabase
        .from('users_admin_x94d2')
        .insert([{
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          amount: formData.amount,
          request_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }]);
        
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      setSuccess(true);
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'user',
        amount: 0
      });
      
      // Notify parent component of success
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h3 className="text-lg font-semibold mb-4">Add New User</h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          User created successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Username"
            value={formData.username}
            onChange={(value) => handleChange('username', value)}
            icon={FiUser}
            placeholder="Enter username"
            required
          />
          
          <InputField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            icon={FiMail}
            placeholder="Enter email address"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleChange('password', value)}
            icon={FiLock}
            placeholder="Create password"
            required
          />
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Role
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon icon={FiUserCheck} className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200 pl-10 pr-3 py-2.5"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>
        
        <InputField
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(value) => handleChange('amount', value)}
          icon={FiDollarSign}
          placeholder="0"
          min="0"
          step="0.01"
          helpText="Initial payment amount (if applicable)"
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            type="button"
            onClick={() => onSuccess()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          
          <motion.button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg shadow-sm"
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
                Creating...
              </span>
            ) : (
              <span>Create User</span>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default UserForm;