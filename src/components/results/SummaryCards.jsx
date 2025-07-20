import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiDollarSign, FiCalendar, FiTrendingDown, FiClock } = FiIcons;

const SummaryCards = ({ results }) => {
  // Calculate the total amount paid over the life of the loan
  const totalPaid = results.optimizedSchedule.reduce(
    (sum, payment) => sum + payment.principal + payment.interest + (payment.extraPayment || 0),
    0
  );

  const cards = [
    {
      title: 'Monthly Payment',
      value: `$${results.monthlyPayment.toLocaleString()}`,
      subtitle: 'Base payment amount',
      icon: FiDollarSign,
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Total Interest Saved',
      value: `$${results.totalInterestSaved.toLocaleString()}`,
      subtitle: 'With optimizations',
      icon: FiTrendingDown,
      color: 'secondary',
      gradient: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Time Saved',
      value: `${results.monthsSaved} months`,
      subtitle: 'Earlier payoff',
      icon: FiClock,
      color: 'accent',
      gradient: 'from-accent-500 to-accent-600'
    },
    {
      title: 'Payoff Date',
      value: new Date(results.payoffDate).toLocaleDateString(),
      subtitle: 'With optimizations',
      icon: FiCalendar,
      color: 'primary',
      gradient: 'from-blue-500 to-indigo-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div 
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-soft p-6 hover:shadow-medium transition-shadow duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0`}>
              <SafeIcon icon={card.icon} className="text-white text-lg" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;