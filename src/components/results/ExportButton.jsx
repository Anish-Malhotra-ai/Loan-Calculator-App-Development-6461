import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { exportToPDF } from '../../utils/pdfExport';

const { FiDownload, FiLoader, FiChevronDown, FiFileText, FiList } = FiIcons;

const ExportButton = ({ results, loanData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (type) => {
    setIsExporting(true);
    setShowOptions(false);
    
    try {
      await exportToPDF(results, loanData, type);
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + (error.message || 'Please try again later.'));
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  return (
    <div className="relative">
      <motion.div className="flex gap-2">
        <motion.button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isExporting}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-medium hover:shadow-large transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={isExporting ? FiLoader : FiDownload} className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
          <span className="font-medium">
            {isExporting ? 'Creating PDF...' : 'Export Professional Report'}
          </span>
          <SafeIcon icon={FiChevronDown} className="w-4 h-4" />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showOptions && (
          <motion.div 
            className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10 w-64"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="py-2">
              <li>
                <button 
                  onClick={() => handleExport('summary')}
                  className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-left text-gray-700"
                >
                  <SafeIcon icon={FiFileText} className="w-5 h-5 mr-3 text-primary-500" />
                  <div>
                    <p className="font-medium">Summary Report</p>
                    <p className="text-xs text-gray-500">Key metrics with sample payments</p>
                  </div>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleExport('full')}
                  className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-left text-gray-700"
                >
                  <SafeIcon icon={FiList} className="w-5 h-5 mr-3 text-secondary-500" />
                  <div>
                    <p className="font-medium">Complete Schedule</p>
                    <p className="text-xs text-gray-500">All payments for entire loan term</p>
                  </div>
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButton;