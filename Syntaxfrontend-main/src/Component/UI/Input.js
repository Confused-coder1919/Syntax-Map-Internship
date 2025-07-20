import React, { forwardRef } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

/**
 * Input component with various styles and validation states
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, password, email, number, etc.)
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.helper - Helper text below input
 * @param {string} props.error - Error message
 * @param {boolean} props.success - Success state
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.size - sm, md, lg
 * @param {string} props.variant - outlined, filled, underlined
 * @param {boolean} props.fullWidth - Whether input should take full width
 * @param {React.ReactNode} props.prefix - Content to show before input
 * @param {React.ReactNode} props.suffix - Content to show after input
 * @param {React.ReactNode} props.leftIcon - Icon to show inside input on the left
 * @param {React.ReactNode} props.rightIcon - Icon to show inside input on the right
 * @param {string} props.className - Additional classes
 * @param {function} props.onChange - Change handler
 * @param {function} props.onBlur - Blur handler
 */
const Input = forwardRef(({ 
  type = "text",
  id,
  name,
  label,
  placeholder,
  helper,
  error,
  success,
  disabled = false,
  size = "md",
  variant = "outlined",
  fullWidth = false,
  prefix,
  suffix,
  leftIcon,
  rightIcon,
  className = "",
  onChange,
  onBlur,
  ...props
}, ref) => {
  // Size variants
  const sizes = {
    sm: "h-8 text-xs py-1",
    md: "h-10 text-sm py-2",
    lg: "h-12 text-base py-2.5"
  };
  
  // Variant styles
  const getVariantClasses = () => {
    if (error) {
      switch (variant) {
        case "filled":
          return "border-transparent bg-red-50 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500";
        case "underlined":
          return "border-t-0 border-l-0 border-r-0 border-b-2 border-red-500 bg-transparent rounded-none px-0 focus:ring-0 focus:border-red-700";
        case "outlined":
        default:
          return "border-red-300 focus:ring-red-500 focus:border-red-500";
      }
    } else if (success) {
      switch (variant) {
        case "filled":
          return "border-transparent bg-emerald-50 text-emerald-900 placeholder-emerald-300 focus:ring-emerald-500 focus:border-emerald-500";
        case "underlined":
          return "border-t-0 border-l-0 border-r-0 border-b-2 border-emerald-500 bg-transparent rounded-none px-0 focus:ring-0 focus:border-emerald-700";
        case "outlined":
        default:
          return "border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500";
      }
    } else {
      switch (variant) {
        case "filled":
          return "border-transparent bg-gray-100 focus:bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500";
        case "underlined":
          return "border-t-0 border-l-0 border-r-0 border-b-2 border-gray-300 bg-transparent rounded-none px-0 focus:ring-0 focus:border-indigo-500";
        case "outlined":
        default:
          return "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500";
      }
    }
  };

  // Input padding classes based on presence of icons/prefix/suffix
  const getPaddingClasses = () => {
    if (leftIcon && rightIcon) {
      return "pl-10 pr-10";
    } else if (leftIcon) {
      return "pl-10";
    } else if (rightIcon || error) {
      return "pr-10";
    } else if (prefix) {
      return "rounded-l-none";
    } else if (suffix) {
      return "rounded-r-none";
    }
    return "";
  };

  const variantClasses = getVariantClasses();
  const paddingClasses = getPaddingClasses();
  
  // Base classes for input
  const baseInputClasses = `block w-full shadow-sm focus:outline-none ${sizes[size]} ${paddingClasses} ${variantClasses} ${
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
  } ${
    variant !== 'underlined' ? 'rounded-md' : ''
  } ${className}`;

  // Label classes
  const labelClasses = `block text-sm font-medium ${
    error ? 'text-red-600' : 'text-gray-700'
  } ${
    disabled ? 'opacity-50' : ''
  } mb-1`;

  // Helper text classes
  const helperClasses = `mt-1 text-xs ${
    error ? 'text-red-600' : success ? 'text-emerald-600' : 'text-gray-500'
  }`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      )}
      
      <div className="relative mt-1 flex">
        {/* Prefix element (e.g. for currency inputs) */}
        {prefix && (
          <div className={`inline-flex items-center px-3 ${sizes[size].replace('py-', '')} rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm`}>
            {prefix}
          </div>
        )}
        
        <div className={`relative flex-grow ${prefix || suffix ? 'flex' : ''}`}>
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            type={type}
            id={id}
            name={name}
            ref={ref}
            disabled={disabled}
            className={baseInputClasses}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
          
          {/* Right icon or error icon */}
          {(rightIcon || error) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {error ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        
        {/* Suffix element */}
        {suffix && (
          <div className={`inline-flex items-center px-3 ${sizes[size].replace('py-', '')} rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm`}>
            {suffix}
          </div>
        )}
      </div>
      
      {/* Helper text or error message */}
      {(helper || error) && (
        <p className={helperClasses}>
          {error || helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;