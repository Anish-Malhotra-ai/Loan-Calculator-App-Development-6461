import React from 'react';
import SafeIcon from '../../common/SafeIcon';

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  icon,
  placeholder,
  min,
  max,
  step,
  className = '',
  helpText,
  required = false,
  disabled = false
}) => {
  const handleChange = (e) => {
    let val = e.target.value;
    
    // For number inputs, handle both regular numbers and decimals
    if (type === 'number') {
      // Allow decimal points, numbers, and basic editing
      // Fix for decimal input in interest rate
      if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
        // Remove leading zeros except for decimals like 0.5
        if (val !== '0' && val !== '-0' && val.startsWith('0') && !val.startsWith('0.')) {
          val = val.replace(/^0+/, '');
        }
        // If it's just a dot, make it 0.
        if (val === '.') {
          val = '0.';
        }
        // If it's just a negative sign with a dot, make it -0.
        if (val === '-.') {
          val = '-0.';
        }
        onChange(val);
      }
    } else {
      onChange(val);
    }
  };

  const handleBlur = (e) => {
    if (type === 'number' && e.target.value) {
      // Clean up the value on blur
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue)) {
        onChange(numValue.toString());
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SafeIcon icon={icon} className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          type={type === 'password' ? 'password' : type === 'number' ? 'number' : 'text'}
          inputMode={type === 'number' ? 'decimal' : 'text'}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 text-gray-900 placeholder-gray-400 hover:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400
          `}
        />
      </div>
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default InputField;