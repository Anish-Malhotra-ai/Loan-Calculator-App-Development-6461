import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiLightbulb, FiAlertTriangle, FiTrendingUp, FiDollarSign, FiCalendar, FiClock } = FiIcons;

const InsightsPanel = ({ results, loanData }) => {
  const generateInsights = () => {
    const insights = [];
    const warnings = [];
    const suggestions = [];
    
    // Generate smart insights based on the loan data
    if (loanData.extraPayment > 0) {
      const monthlyExtraImpact = (results.totalInterestSaved / (loanData.extraPayment * 12)) * 100;
      insights.push({
        type: 'tip',
        title: 'Extra Payment Impact',
        message: `Your $${loanData.extraPayment.toLocaleString()} ${loanData.extraPaymentFrequency} payment saves you $${results.totalInterestSaved.toLocaleString()} in interest and ${results.monthsSaved} months.`,
        icon: FiTrendingUp
      });
    }
    
    if (results.monthsSaved > 60) {
      insights.push({
        type: 'highlight',
        title: 'Excellent Progress!',
        message: `You're cutting over 5 years off your loan term. That's incredible savings!`,
        icon: FiLightbulb
      });
    }
    
    if (loanData.interestRate > 7) {
      warnings.push({
        type: 'warning',
        title: 'High Interest Rate',
        message: 'Consider refinancing if possible. Even a 1% reduction could save thousands.',
        icon: FiAlertTriangle
      });
    }
    
    if (loanData.extraPayment === 0) {
      const suggestedExtra = Math.round(results.monthlyPayment * 0.1 / 50) * 50;
      insights.push({
        type: 'suggestion',
        title: 'Optimization Opportunity',
        message: `Adding just $${suggestedExtra} monthly could save you thousands in interest. Try it above!`,
        icon: FiDollarSign
      });
    }
    
    // Smart mortgage insights
    if (loanData.paymentFrequency === 'monthly') {
      suggestions.push({
        type: 'suggestion',
        title: 'Try Bi-weekly Payments',
        message: `Switching to bi-weekly payments (half your monthly payment every two weeks) results in 26 half-payments per year - effectively making 13 monthly payments instead of 12. This simple change could save years off your mortgage.`,
        icon: FiCalendar
      });
    }
    
    // Round up suggestion
    const roundUpAmount = Math.ceil(results.monthlyPayment / 100) * 100;
    const difference = roundUpAmount - results.monthlyPayment;
    if (difference > 0 && difference < 100) {
      suggestions.push({
        type: 'suggestion',
        title: 'Round Up Your Payments',
        message: `Consider rounding up your payment from $${results.monthlyPayment} to $${roundUpAmount}. This small increase of $${difference.toFixed(0)} could save you approximately $${Math.round(difference * 12 * loanData.termYears * 0.6).toLocaleString()} over the life of your loan.`,
        icon: FiDollarSign
      });
    }
    
    // Lump sum impact insights
    if (results.lumpSumImpacts && results.lumpSumImpacts.length > 0) {
      const totalInterestSaved = results.lumpSumImpacts.reduce((sum, impact) => sum + impact.interestSaved, 0);
      const totalMonthsSaved = results.lumpSumImpacts.reduce((sum, impact) => sum + impact.monthsSaved, 0);
      
      insights.push({
        type: 'highlight',
        title: 'Lump Sum Payment Benefits',
        message: `Your scheduled one-time payments will save you approximately $${totalInterestSaved.toLocaleString()} in interest and reduce your loan term by about ${totalMonthsSaved} months.`,
        icon: FiClock
      });
    }
    
    return [...insights, ...warnings, ...suggestions];
  };

  const insights = generateInsights();

  if (insights.length === 0) return null;

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-soft p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center space-x-2 mb-4">
        <SafeIcon icon={FiLightbulb} className="text-yellow-500 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            className={`
              p-4 rounded-lg border-l-4
              ${insight.type === 'warning' ? 'bg-red-50 border-red-400' : 
                insight.type === 'highlight' ? 'bg-green-50 border-green-400' : 
                insight.type === 'suggestion' ? 'bg-purple-50 border-purple-400' :
                'bg-blue-50 border-blue-400'}
            `}
          >
            <div className="flex items-start space-x-3">
              <SafeIcon 
                icon={insight.icon} 
                className={`
                  mt-0.5 flex-shrink-0
                  ${insight.type === 'warning' ? 'text-red-500' : 
                    insight.type === 'highlight' ? 'text-green-500' : 
                    insight.type === 'suggestion' ? 'text-purple-500' :
                    'text-blue-500'}
                `}
              />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-gray-700 text-sm">{insight.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InsightsPanel;