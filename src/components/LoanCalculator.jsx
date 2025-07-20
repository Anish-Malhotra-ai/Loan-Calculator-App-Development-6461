import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import LoanForm from './LoanForm';
import ResultsSection from './ResultsSection';
import { calculateLoan } from '../utils/loanCalculations';

const LoanCalculator = () => {
  const [loanData, setLoanData] = useState({
    amount: 250000,
    interestRate: 6.5,
    termYears: 30,
    startDate: new Date().toISOString().split('T')[0],
    paymentFrequency: 'monthly',
    extraPayment: 0,
    extraPaymentFrequency: 'monthly',
    lumpSumPayments: []
  });

  const [results, setResults] = useState(null);

  const calculatedResults = useMemo(() => {
    if (!loanData.amount || !loanData.interestRate || !loanData.termYears) {
      return null;
    }
    return calculateLoan(loanData);
  }, [loanData]);

  useEffect(() => {
    setResults(calculatedResults);
  }, [calculatedResults]);

  const handleLoanDataChange = (newData) => {
    setLoanData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Input Form */}
          <motion.div
            className="xl:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LoanForm loanData={loanData} onChange={handleLoanDataChange} />
          </motion.div>

          {/* Results */}
          <motion.div
            className="xl:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ResultsSection results={results} loanData={loanData} />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="LoanPro Calculator Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ display: 'none' }}>
                  LP
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">LoanPro Calculator</div>
                <div className="text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} All rights reserved.
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <span>Powered and supported with</span>
              <span className="text-red-500 mx-1">❤</span>
              <span>by</span>
              <span className="font-semibold text-primary-600 ml-1">BPA Solutions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoanCalculator;