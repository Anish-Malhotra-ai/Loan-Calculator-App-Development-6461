import React from 'react';
import SafeIcon from '../../common/SafeIcon';

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options, 
  icon, 
  className = '',
  helpText
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SafeIcon icon={icon} className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm 
            focus:border-primary-500 focus:ring-primary-500 
            transition-colors duration-200 appearance-none
            ${icon ? 'pl-10' : 'pl-3'} pr-8 py-2.5 text-gray-900 
            bg-white hover:border-gray-400
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default SelectField;