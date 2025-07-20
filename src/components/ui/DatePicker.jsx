import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCalendar, FiChevronLeft, FiChevronRight } = FiIcons;

const DatePicker = ({
  label,
  value,
  onChange,
  className = '',
  helpText,
  required = false,
  disabled = false,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      setSelectedDate(newDate);
      setCurrentDate(newDate);
    }
  }, [value]);

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // FIX: Use proper UTC handling to prevent timezone issues
  const formatInputDate = (date) => {
    if (!date) return '';
    // Create date with time set to noon to avoid timezone issues
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const selectDate = (day) => {
    // FIX: Create date properly with noon time to prevent timezone issues
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0, 0);
    
    // Check if date is within allowed range
    if (minDate && newDate < new Date(minDate)) return;
    if (maxDate && newDate > new Date(maxDate)) return;
    
    setSelectedDate(newDate);
    onChange(formatInputDate(newDate));
    setIsOpen(false);
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const isToday = (day) => {
    const today = new Date();
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Add day headers
    const dayHeaders = dayNames.map(day => (
      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
        {day}
      </div>
    ));

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const today = isToday(day);
      const selected = isSelected(day);

      days.push(
        <motion.button
          key={day}
          type="button"
          onClick={() => !disabled && selectDate(day)}
          disabled={disabled}
          className={`
            w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors duration-200
            ${selected
              ? 'bg-primary-600 text-white font-semibold'
              : today
                ? 'bg-primary-100 text-primary-700 font-medium'
                : disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          whileHover={!disabled ? { scale: 1.1 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          {day}
        </motion.button>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders}
        {days}
      </div>
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={datePickerRef}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={selectedDate ? formatDisplayDate(selectedDate) : ''}
            readOnly
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm 
              focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200
              cursor-pointer bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            `}
            placeholder="Select a date"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SafeIcon icon={FiCalendar} className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-80"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <motion.button
                    type="button"
                    onClick={() => navigateYear(-1)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiChevronLeft} className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiChevronLeft} className="w-3 h-3" />
                  </motion.button>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiChevronRight} className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => navigateYear(1)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Calendar Grid */}
              {renderCalendar()}

              {/* Quick Actions */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <motion.button
                  type="button"
                  onClick={() => {
                    // FIX: Set time to noon to prevent timezone issues
                    const today = new Date();
                    today.setHours(12, 0, 0, 0);
                    setSelectedDate(today);
                    setCurrentDate(today);
                    onChange(formatInputDate(today));
                    setIsOpen(false);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Today
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setSelectedDate(null);
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default DatePicker;