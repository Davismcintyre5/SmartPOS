// components/ui/Input.jsx
import React from "react";

export const Input = ({ 
  label, 
  error, 
  type = "text", 
  className = "", 
  value, 
  onChange, 
  onBlur,
  onFocus,
  placeholder,
  disabled = false,
  required = false,
  name,
  id,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 border rounded-lg 
          bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 
          placeholder-gray-400 dark:placeholder-gray-500 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};