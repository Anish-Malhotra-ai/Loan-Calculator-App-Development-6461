import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import InputField from './ui/InputField';
import SelectField from './ui/SelectField';
import DatePicker from './ui/DatePicker';
import LumpSumManager from './LumpSumManager';

const { FiDollarSign, FiPercent, FiCalendar, FiClock, FiPlus, FiSettings, FiRepeat, FiInfo } = FiIcons;

const LoanForm = ({ loanData, onChange }) => {
  const paymentFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' }
  ];

  const extraPaymentFrequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'fortnightly', label: 'Fortnightly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleInputChange = (field, value) => {
    // Handle numeric conversions properly
    if (field === 'amount' || field === 'extraPayment') {
      const numValue = parseFloat(value) || 0;
      onChange({ [field]: numValue });
    } else if (field === 'interestRate') {
      const numValue = parseFloat(value);
      onChange({ [field]: isNaN(numValue) ? 0 : numValue });
    } else if (field === 'termYears') {
      const numValue = parseInt(value) || 0;
      onChange({ [field]: numValue });
    } else {
      onChange({ [field]: value });
    }
  };

  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-medium"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiDollarSign} className="text-white text-lg" />
          </div>
          <h3 className="text-xl font-display font-semibold text-gray-900">Loan Details</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Section 1: Loan Principal Details */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiDollarSign} className="text-primary-500" />
            <h4 className="font-semibold text-gray-900">Principal Amount</h4>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <InputField
              label="Loan Amount"
              type="number"
              value={loanData.amount || ''}
              onChange={(value) => handleInputChange('amount', value)}
              icon={FiDollarSign}
              placeholder="250000"
              min="1000"
              step="1000"
              helpText="Enter the total loan amount you wish to borrow"
            />
          </div>
        </motion.section>

        {/* Section 2: Loan Terms */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon icon={FiSettings} className="text-secondary-500" />
            <h4 className="font-semibold text-gray-900">Loan Terms</h4>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Interest Rate (%)"
                type="number"
                value={loanData.interestRate || ''}
                onChange={(value) => handleInputChange('interestRate', value)}
                icon={FiPercent}
                placeholder="6.5"
                min="0.1"
                max="30"
                step="0.01"
                helpText="Annual interest rate (e.g., 6.5 for 6.5%)"
              />
              <InputField
                label="Loan Term (Years)"
                type="number"
                value={loanData.termYears || ''}
                onChange={(value) => handleInputChange('termYears', value)}
                icon={FiCalendar}
                placeholder="30"
                min="1"
                max="50"
                helpText="Duration of the loan"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Start Date"
                value={loanData.startDate}
                onChange={(value) => handleInputChange('startDate', value)}
                helpText="When payments begin"
                required
              />
              <SelectField
                label="Payment Frequency"
                value={loanData.paymentFrequency}
                onChange={(value) => handleInputChange('paymentFrequency', value)}
                options={paymentFrequencyOptions}
                icon={FiClock}
                helpText="How often you make payments"
              />
            </div>
          </div>
        </motion.section>

        {/* Section 3: Payment Optimization */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiRepeat} className="text-accent-500" />
              <h4 className="font-semibold text-gray-900">Payment Optimization</h4>
            </div>
            <div className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
              Optional
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Extra Payment Amount"
                type="number"
                value={loanData.extraPayment || ''}
                onChange={(value) => handleInputChange('extraPayment', value)}
                icon={FiDollarSign}
                placeholder="200"
                min="0"
                step="50"
                helpText="Recurring additional payment"
              />
              <SelectField
                label="Extra Payment Frequency"
                value={loanData.extraPaymentFrequency}
                onChange={(value) => handleInputChange('extraPaymentFrequency', value)}
                options={extraPaymentFrequencyOptions}
                icon={FiClock}
                helpText="How often to make extra payments"
              />
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-md text-sm text-blue-700">
              <div className="flex items-start">
                <SafeIcon icon={FiInfo} className="flex-shrink-0 mt-0.5 mr-2" />
                <p>Adding extra payments can significantly reduce your loan term and save on interest payments.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 4: Lump Sum Payments */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiPlus} className="text-secondary-500" />
              <h4 className="font-semibold text-gray-900">One-time Additional Payments</h4>
            </div>
            <div className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
              Optional
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <LumpSumManager
              lumpSumPayments={loanData.lumpSumPayments}
              onChange={(payments) => handleInputChange('lumpSumPayments', payments)}
            />
          </div>
        </motion.section>
      </div>

      {/* Footer with information */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
        <div className="flex items-center text-sm text-gray-600">
          <SafeIcon icon={FiCalendar} className="mr-2 text-primary-400" />
          <span>All calculations are estimates based on the information provided and may vary from actual loan terms.</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanForm;