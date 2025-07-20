import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import UserTable from './UserTable';
import UserForm from './UserForm';
import supabase from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const { FiUsers, FiUserPlus, FiRefreshCw, FiDownload, FiUpload } = FiIcons;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { userData } = useAuth();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users_admin_x94d2')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const exportUsers = () => {
    try {
      // Convert users data to CSV
      const headers = ['Username', 'Email', 'Role', 'Request Date', 'Amount'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.username,
          user.email,
          user.role,
          new Date(user.request_date).toLocaleDateString(),
          user.amount
        ].join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users. Please try again.');
    }
  };
  
  const importUsers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Skip header row
        const newUsers = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',');
          const user = {
            username: values[0],
            email: values[1],
            password: 'password123', // Default password
            role: values[2] || 'user',
            request_date: values[3] ? new Date(values[3]) : new Date(),
            amount: parseFloat(values[4]) || 0
          };
          
          newUsers.push(user);
        }
        
        if (newUsers.length > 0) {
          const { error } = await supabase
            .from('users_admin_x94d2')
            .insert(newUsers);
          
          if (error) {
            throw error;
          }
          
          alert(`Successfully imported ${newUsers.length} users`);
          fetchUsers();
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing users:', error);
      alert('Failed to import users. Please check your file format.');
    }
    
    // Clear the input
    event.target.value = '';
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-medium p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
            <SafeIcon icon={FiUsers} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
            <p className="text-sm text-gray-500">Manage user access and permissions</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={showForm ? FiRefreshCw : FiUserPlus} className="mr-2" />
            {showForm ? 'View Users' : 'Add User'}
          </motion.button>
          
          <motion.button
            onClick={exportUsers}
            className="flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiDownload} className="mr-2" />
            Export
          </motion.button>
          
          <label className="cursor-pointer">
            <motion.div
              className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiUpload} className="mr-2" />
              Import
            </motion.div>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={importUsers}
            />
          </label>
        </div>
      </div>
      
      {/* Content */}
      {showForm ? (
        <UserForm onSuccess={() => {
          setShowForm(false);
          fetchUsers();
        }} />
      ) : (
        <UserTable 
          users={users} 
          loading={loading} 
          onRefresh={fetchUsers}
          currentUserEmail={userData?.email}
        />
      )}
    </motion.div>
  );
};

export default AdminDashboard;