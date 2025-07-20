import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import supabase from '../../lib/supabase';

const { FiTrash2, FiEdit, FiMail, FiCheck, FiX, FiSearch, FiFilter, FiBell, FiKey, FiEye, FiEyeOff } = FiIcons;

const UserTable = ({ users, loading, onRefresh, currentUserEmail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [credentialRequests, setCredentialRequests] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});

  // Fetch credential requests
  useEffect(() => {
    fetchCredentialRequests();
    // Set up real-time subscription for credential requests
    const subscription = supabase
      .channel('credential_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'credential_requests_x94d2' }, 
        () => {
          fetchCredentialRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCredentialRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('credential_requests_x94d2')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credential requests:', error);
        return;
      }
      
      setCredentialRequests(data || []);
    } catch (error) {
      console.error('Error fetching credential requests:', error);
    }
  };

  // Handle credential request
  const handleCredentialRequest = async (requestId, action) => {
    try {
      const { data: request, error: fetchError } = await supabase
        .from('credential_requests_x94d2')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) {
        console.error('Error fetching request:', fetchError);
        alert('Failed to fetch request details');
        return;
      }

      if (action === 'approve') {
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
        // Update the user's password
        const { error: updateError } = await supabase
          .from('users_admin_x94d2')
          .update({ password: tempPassword })
          .eq('email', request.email);

        if (updateError) {
          console.error('Error updating password:', updateError);
          alert('Failed to update user password');
          return;
        }

        // Show the temporary password to admin
        alert(`Request approved! New temporary password for ${request.email}: ${tempPassword}\n\nPlease share this with the user securely.`);
      }

      // Update request status
      const { error: statusError } = await supabase
        .from('credential_requests_x94d2')
        .update({ 
          status: action === 'approve' ? 'approved' : 'rejected',
          handled_by: currentUserEmail,
          handled_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (statusError) {
        console.error('Error updating request status:', statusError);
        alert('Failed to update request status');
        return;
      }

      // Refresh both requests and users
      fetchCredentialRequests();
      onRefresh();
      
      if (action === 'approve') {
        alert('Request approved successfully! User password has been updated.');
      } else {
        alert('Request rejected successfully.');
      }
    } catch (error) {
      console.error('Error handling credential request:', error);
      alert('An error occurred while processing the request');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Delete user function
  const deleteUser = async (userId, userEmail) => {
    if (userEmail === currentUserEmail) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      try {
        const { error } = await supabase
          .from('users_admin_x94d2')
          .delete()
          .eq('id', userId);

        if (error) throw error;
        
        alert('User deleted successfully');
        onRefresh();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  // Send login email function (simulated)
  const sendLoginEmail = (email, username, password) => {
    const emailContent = `
Login Credentials for LoanPro Calculator:
Username: ${username}
Email: ${email}
Password: ${password}

Please log in at: ${window.location.origin}
    `;
    
    // In a real app, this would send an actual email
    if (window.confirm(`Send login credentials to ${email}?\n\nCredentials:\n${emailContent}`)) {
      alert(`Login credentials would be sent to ${email}`);
    }
  };

  // Enhanced search functionality
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();

    switch (searchField) {
      case 'username':
        return user.username.toLowerCase().includes(searchLower);
      case 'email':
        return user.email.toLowerCase().includes(searchLower);
      case 'role':
        return user.role.toLowerCase().includes(searchLower);
      case 'amount':
        return user.amount.toString().includes(searchTerm);
      case 'date':
        return new Date(user.request_date).toLocaleDateString().includes(searchTerm);
      default: // 'all'
        return (
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower) ||
          user.amount.toString().includes(searchTerm) ||
          new Date(user.request_date).toLocaleDateString().includes(searchTerm)
        );
    }
  });

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditFormData({
      username: user.username,
      role: user.role,
      amount: user.amount,
      password: user.password
    });
  };

  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase
        .from('users_admin_x94d2')
        .update(editFormData)
        .eq('id', editingUser);

      if (error) throw error;
      
      setEditingUser(null);
      onRefresh();
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const changePassword = async () => {
    try {
      if (!newPassword || newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }

      const { error } = await supabase
        .from('users_admin_x94d2')
        .update({ password: newPassword })
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert('Password updated successfully');
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUser(null);
      onRefresh();
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to update password');
    }
  };

  return (
    <div>
      {/* Credential Requests Section */}
      {credentialRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r"
        >
          <div className="flex items-center mb-2">
            <SafeIcon icon={FiBell} className="text-yellow-500 mr-2" />
            <h3 className="font-semibold text-yellow-800">
              🔔 Pending Credential Requests ({credentialRequests.length})
            </h3>
          </div>
          <div className="space-y-3">
            {credentialRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border">
                <div>
                  <p className="font-medium text-gray-900">{request.email}</p>
                  {request.username && (
                    <p className="text-sm text-gray-600">Username: {request.username}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Requested: {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCredentialRequest(request.id, 'approve')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleCredentialRequest(request.id, 'reject')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Search Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SafeIcon icon={FiSearch} className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search users..."
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Fields</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="amount">Amount</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'No users found matching your search' : 'No users found'}
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredUsers.map(user => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <input
                          type="text"
                          value={editFormData.username}
                          onChange={(e) => handleEditChange('username', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          value={editFormData.role}
                          onChange={(e) => handleEditChange('role', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">
                          {showPasswords[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(user.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <SafeIcon icon={showPasswords[user.id] ? FiEyeOff : FiEye} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPasswordModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <SafeIcon icon={FiKey} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(user.request_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <input
                          type="number"
                          value={editFormData.amount}
                          onChange={(e) => handleEditChange('amount', e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span className="text-gray-900">${user.amount.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex space-x-2">
                          <button onClick={saveEdit} className="text-green-600 hover:text-green-900">
                            <SafeIcon icon={FiCheck} />
                          </button>
                          <button onClick={() => setEditingUser(null)} className="text-red-600 hover:text-red-900">
                            <SafeIcon icon={FiX} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">
                            <SafeIcon icon={FiEdit} />
                          </button>
                          <button
                            onClick={() => sendLoginEmail(user.email, user.username, user.password)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <SafeIcon icon={FiMail} />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-900"
                            disabled={user.email === currentUserEmail}
                          >
                            <SafeIcon icon={FiTrash2} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              Change Password for {selectedUser?.username}
            </h3>
            <div className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserTable;