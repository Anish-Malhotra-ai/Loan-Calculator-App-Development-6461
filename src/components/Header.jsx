import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTrendingUp, FiCalculator, FiDollarSign } = FiIcons;

const Header = () => {
  return (
    <header className="bg-white shadow-soft border-b border-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-medium overflow-hidden">
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
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center" style={{ display: 'none' }}>
                <SafeIcon icon={FiCalculator} className="text-white text-xl" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                LoanPro Calculator
              </h1>
              <p className="text-sm text-gray-600">Smart Loan Repayment Planning</p>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center space-x-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 text-gray-600">
              <SafeIcon icon={FiTrendingUp} className="text-secondary-500" />
              <span className="text-sm font-medium">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <SafeIcon icon={FiDollarSign} className="text-accent-500" />
              <span className="text-sm font-medium">Save Thousands</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Section */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Optimize Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
              Loan Payments
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how extra payments and strategic planning can save you thousands in interest and years off your loan term.
          </p>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;