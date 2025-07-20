import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * Button component with animations and variants
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - primary, secondary, outline, text, gradient
 * @param {string} props.size - xs, sm, md, lg, xl
 * @param {string} props.to - Link destination (if Link component)
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Icon to show before text
 * @param {React.ReactNode} props.rightIcon - Icon to show after text
 */
const Button = ({ 
  variant = "primary",
  size = "md",
  to,
  onClick,
  isLoading,
  disabled,
  fullWidth = false,
  className = "",
  children,
  leftIcon,
  rightIcon,
  ...props
}) => {
  // Button variants - enhanced with more professional styles
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm ring-1 ring-indigo-600 ring-opacity-50",
    secondary: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm ring-1 ring-blue-500 ring-opacity-50",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm ring-1 ring-emerald-500 ring-opacity-50",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm ring-1 ring-red-500 ring-opacity-50",
    warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm ring-1 ring-amber-500 ring-opacity-50",
    info: "bg-sky-500 text-white hover:bg-sky-600 shadow-sm ring-1 ring-sky-500 ring-opacity-50",
    dark: "bg-gray-800 text-white hover:bg-gray-900 shadow-sm ring-1 ring-gray-800 ring-opacity-50",
    light: "bg-white text-gray-800 hover:bg-gray-50 shadow-sm ring-1 ring-gray-200",
    outline: "bg-transparent border border-indigo-500 text-indigo-600 hover:bg-indigo-50",
    text: "bg-transparent text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 shadow-none",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 shadow-none",
    gradient: "text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-md",
  };
  
  // Enhanced button sizes with XS and XL options
  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-3.5 text-lg",
  };
  
  // Base classes for all buttons
  const baseClasses = `
    inline-flex items-center justify-center 
    font-medium rounded-md 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
    transition-all duration-200 ease-in-out
    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    ${variants[variant]} 
    ${sizes[size]} 
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  // Enhanced animation properties
  const buttonAnimation = {
    tap: { scale: 0.97 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" cy="12" r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Button content with icons
  const renderContent = () => (
    <>
      {isLoading && <LoadingSpinner />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isLoading ? 'Loading...' : children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <motion.div
        whileHover="hover"
        whileTap="tap"
        variants={buttonAnimation}
        className={fullWidth ? 'w-full' : 'inline-block'}
      >
        <Link 
          to={to} 
          className={baseClasses}
          {...props}
        >
          {renderContent()}
        </Link>
      </motion.div>
    );
  }

  // Otherwise render as button
  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      variants={buttonAnimation}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
};

export default Button;