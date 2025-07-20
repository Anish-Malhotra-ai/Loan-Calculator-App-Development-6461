import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import InputField from './ui/InputField';
import DatePicker from './ui/DatePicker';

const { FiPlus, FiTrash2, FiDollarSign, FiCalendar, FiInfo, FiClock } = FiIcons;

const LumpSumManager = ({ lumpSumPayments = [], onChange }) => {
  const [newPayment, setNewPayment] = useState({ amount: '', date: '' });

  const addLumpSum = () => {
    if (newPayment.amount && newPayment.date) {
      const payment = {
        id: Date.now(),
        amount: parseFloat(newPayment.amount),
        date: newPayment.date
      };
      onChange([...lumpSumPayments, payment]);
      setNewPayment({ amount: '', date: '' });
    }
  };

  const removeLumpSum = (id) => {
    onChange(lumpSumPayments.filter(payment => payment.id !== id));
  };

  return (
    <div>
      {/* Add New Payment */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InputField
            label="Amount"
            type="number"
            value={newPayment.amount}
            onChange={(value) => setNewPayment(prev => ({ ...prev, amount: value }))}
            icon={FiDollarSign}
            placeholder="5,000"
            min="100"
            step="100"
            helpText="One-time payment amount"
          />
          <DatePicker
            label="Payment Date"
            value={newPayment.date}
            onChange={(value) => setNewPayment(prev => ({ ...prev, date: value }))}
            helpText="When you'll make this payment"
          />
        </div>
        <button
          onClick={addLumpSum}
          disabled={!newPayment.amount || !newPayment.date}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add One-time Payment</span>
        </button>
      </div>

      {lumpSumPayments.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">
              Scheduled Payments ({lumpSumPayments.length})
            </h5>
            <span className="text-xs text-gray-500">
              Total: ${lumpSumPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
            {lumpSumPayments
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-secondary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {/* Impact information */}
                    <div className="mt-1 flex items-center text-xs text-green-600">
                      <SafeIcon icon={FiClock} className="mr-1 w-3 h-3" />
                      <span>This payment will save you interest and reduce your loan term</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLumpSum(payment.id)}
                    className="ml-4 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                    aria-label="Remove payment"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
          <SafeIcon icon={FiInfo} className="mx-auto mb-2 text-gray-400 text-xl" />
          <p>No one-time payments scheduled</p>
          <p className="text-xs mt-1 text-gray-400">Add payments to reduce your loan term</p>
        </div>
      )}
    </div>
  );
};

export default LumpSumManager;