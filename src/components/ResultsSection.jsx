import React from 'react';
import { motion } from 'framer-motion';
import SummaryCards from './results/SummaryCards';
import InsightsPanel from './results/InsightsPanel';
import ChartsSection from './results/ChartsSection';
import AmortizationTable from './results/AmortizationTable';
import ExportButton from './results/ExportButton';

const ResultsSection = ({ results, loanData }) => {
  if (!results) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-medium p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Enter loan details to see results</h3>
          <p>Fill out the form on the left to calculate your loan payments and savings.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <motion.div 
        className="flex justify-end"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ExportButton results={results} loanData={loanData} />
      </motion.div>

      {/* Summary Cards */}
      <SummaryCards results={results} />

      {/* Insights Panel */}
      <InsightsPanel results={results} loanData={loanData} />

      {/* Charts */}
      <ChartsSection results={results} />

      {/* Amortization Table */}
      <AmortizationTable schedule={results.optimizedSchedule} />
    </div>
  );
};

export default ResultsSection;