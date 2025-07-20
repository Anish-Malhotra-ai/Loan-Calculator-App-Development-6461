import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';

const { FiCalculator, FiMenu, FiX, FiLogOut, FiUsers, FiHome, FiUser } = FiIcons;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userData, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: FiHome },
    ...(isAdmin() ? [{ label: 'Admin Panel', path: '/admin', icon: FiUsers }] : [])
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/logo.jpg" 
                alt="LoanPro Calculator Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                <SafeIcon icon={FiCalculator} className="text-white" />
              </div>
            </div>
            <span className="text-lg font-display font-semibold text-gray-900">LoanPro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user && (
              <>
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === item.path
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <SafeIcon icon={item.icon} className="mr-2" />
                    {item.label}
                  </Link>
                ))}

                <div className="border-l border-gray-200 h-6 mx-2" />

                {/* User info and logout */}
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{userData?.username || user?.email}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({userData?.role || 'user'})
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <SafeIcon icon={FiLogOut} className="mr-1" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none"
            >
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="container mx-auto px-4 py-2 space-y-1">
              {user && (
                <>
                  {/* User info for mobile */}
                  <div className="px-4 py-2 mb-2 flex items-center space-x-3 border-b border-gray-100 pb-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{userData?.username || user?.email}</div>
                      <div className="text-xs text-gray-500">{userData?.role || 'user'}</div>
                    </div>
                  </div>

                  {/* Mobile menu items */}
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-md text-base font-medium ${
                        location.pathname === item.path
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <SafeIcon icon={item.icon} className="mr-3" />
                      {item.label}
                    </Link>
                  ))}

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <SafeIcon icon={FiLogOut} className="mr-3" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;