import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

/**
 * Alert component with animations and variants
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - info, success, warning, error, neutral
 * @param {string} props.title - Alert title
 * @param {boolean} props.dismissible - Whether the alert can be dismissed
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Alert content
 * @param {React.ReactNode} props.action - Action button or link
 * @param {string} props.position - Position of the alert (for toast-style alerts)
 * @param {boolean} props.elevated - Add shadow for a raised look
 */
const Alert = ({ 
  variant = "info",
  title,
  dismissible = true,
  className = "",
  children,
  action,
  position,
  elevated = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Enhanced Alert variants with more professional styling
  const variants = {
    info: "bg-blue-50 text-blue-800 border-blue-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-red-50 text-red-800 border-red-200",
    neutral: "bg-gray-50 text-gray-800 border-gray-200",
    primary: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dark: "bg-gray-800 text-white border-gray-700",
    outline: {
      info: "bg-white border-blue-500 text-blue-700 border-2",
      success: "bg-white border-emerald-500 text-emerald-700 border-2",
      warning: "bg-white border-amber-500 text-amber-700 border-2",
      error: "bg-white border-red-500 text-red-700 border-2",
      neutral: "bg-white border-gray-500 text-gray-700 border-2",
      primary: "bg-white border-indigo-500 text-indigo-700 border-2"
    },
    solid: {
      info: "bg-blue-500 text-white border-blue-600",
      success: "bg-emerald-500 text-white border-emerald-600",
      warning: "bg-amber-500 text-white border-amber-600",
      error: "bg-red-500 text-white border-red-600",
      neutral: "bg-gray-500 text-white border-gray-600",
      primary: "bg-indigo-500 text-white border-indigo-600"
    }
  };

  // Get the appropriate style based on variant
  const getVariantStyle = () => {
    // Check if the variant is a nested variant (like outline.info)
    if (variant.includes('.')) {
      const [style, color] = variant.split('.');
      return variants[style][color];
    }
    
    return variants[variant];
  };

  // Enhanced icons with better styling
  const getIcon = () => {
    const baseColor = variant.includes('outline') ? '' : 
                      variant.includes('solid') ? 'text-white' : 
                      variant === 'info' ? 'text-blue-400' :
                      variant === 'success' ? 'text-emerald-400' :
                      variant === 'warning' ? 'text-amber-400' :
                      variant === 'error' ? 'text-red-400' :
                      variant === 'primary' ? 'text-indigo-400' : 'text-gray-400';
    
    const actualVariant = variant.includes('.') ? variant.split('.')[1] : variant;
    
    switch(actualVariant) {
      case 'info':
        return <InformationCircleIcon className={`h-5 w-5 ${baseColor}`} aria-hidden="true" />;
      case 'success':
        return <CheckCircleIcon className={`h-5 w-5 ${baseColor}`} aria-hidden="true" />;
      case 'warning':
        return <ExclamationTriangleIcon className={`h-5 w-5 ${baseColor}`} aria-hidden="true" />;
      case 'error':
        return <ExclamationCircleIcon className={`h-5 w-5 ${baseColor}`} aria-hidden="true" />;
      default:
        return <InformationCircleIcon className={`h-5 w-5 ${baseColor}`} aria-hidden="true" />;
    }
  };

  // Base classes for all alerts with improved styling
  const baseClasses = `
    relative rounded-xl border p-4 ${elevated ? 'shadow-md' : ''}
    ${getVariantStyle()} 
    ${className}
  `;

  // Animation properties
  const alertAnimation = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  // Different animations based on position for toast-style alerts
  const getAnimationVariants = () => {
    if (!position) return alertAnimation;
    
    if (position.includes('top')) {
      return {
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.2 } }
      };
    }
    
    if (position.includes('bottom')) {
      return {
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: 50, transition: { duration: 0.2 } }
      };
    }
    
    if (position.includes('left')) {
      return {
        initial: { opacity: 0, x: -50 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
      };
    }
    
    if (position.includes('right')) {
      return {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
      };
    }
    
    return alertAnimation;
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={getAnimationVariants()}
          className={baseClasses}
          {...props}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h3 className="text-sm font-semibold">
                  {title}
                </h3>
              )}
              <div className={`text-sm ${title ? 'mt-1' : ''}`}>
                {children}
              </div>
              {action && (
                <div className="mt-3">
                  {action}
                </div>
              )}
            </div>
            
            {dismissible && (
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      variant.includes('solid') ? 'text-white hover:bg-white hover:bg-opacity-10 focus:ring-white' :
                      variant === 'info' || variant.includes('.info') ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600' :
                      variant === 'success' || variant.includes('.success') ? 'text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-600' :
                      variant === 'warning' || variant.includes('.warning') ? 'text-amber-500 hover:bg-amber-100 focus:ring-amber-600' :
                      variant === 'error' || variant.includes('.error') ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' :
                      variant === 'primary' || variant.includes('.primary') ? 'text-indigo-500 hover:bg-indigo-100 focus:ring-indigo-600' :
                      'text-gray-500 hover:bg-gray-100 focus:ring-gray-600'
                    }`}
                    onClick={() => setIsVisible(false)}
                  >
                    <span className="sr-only">Dismiss</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;