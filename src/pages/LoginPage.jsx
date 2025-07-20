import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-xl shadow-medium overflow-hidden mr-4">
              <img 
                src="/logo.jpg" 
                alt="LoanPro Calculator Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to gradient background if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold" style={{ display: 'none' }}>
                LP
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-display font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                  LoanPro Calculator
                </span>
              </h1>
              <p className="text-gray-600">Smart Loan Repayment Planning</p>
            </div>
          </div>
        </motion.div>

        <LoginForm />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>Secure access to advanced loan optimization tools</p>
        </motion.div>
      </div>

      <footer className="py-4 px-4 text-center text-xs text-gray-500">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} LoanPro Calculator. All rights reserved.
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <span>Powered and supported with</span>
            <span className="text-red-500 mx-1">❤</span>
            <span>by</span>
            <span className="font-semibold text-primary-600 ml-1">BPA Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;