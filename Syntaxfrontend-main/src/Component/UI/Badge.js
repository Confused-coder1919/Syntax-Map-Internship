import React from "react";
import { motion } from "framer-motion";

/**
 * Badge component with animations and modern styling options
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - standard, pill, dot, outline, gradient, solid
 * @param {string} props.color - primary, success, warning, danger, info, neutral, etc.
 * @param {string} props.size - xs, sm, md, lg
 * @param {boolean} props.glow - Add glow effect to badge
 * @param {boolean} props.removable - Add remove button to badge
 * @param {function} props.onRemove - Function to call when remove button is clicked
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Badge content
 * @param {React.ReactNode} props.icon - Icon to show in badge
 */
const Badge = ({ 
  variant = "standard",
  color = "primary",
  size = "md",
  glow = false,
  removable = false,
  onRemove,
  className = "",
  children,
  icon,
  ...props
}) => {
  // Color variants
  const colors = {
    primary: {
      standard: "bg-indigo-100 text-indigo-800",
      pill: "bg-indigo-100 text-indigo-800",
      dot: "text-indigo-800",
      outline: "bg-white text-indigo-700 border border-indigo-500",
      solid: "bg-indigo-500 text-white",
      gradient: "bg-gradient-to-r from-indigo-500 to-blue-500 text-white"
    },
    secondary: {
      standard: "bg-blue-100 text-blue-800",
      pill: "bg-blue-100 text-blue-800",
      dot: "text-blue-800",
      outline: "bg-white text-blue-700 border border-blue-500",
      solid: "bg-blue-500 text-white",
      gradient: "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
    },
    success: {
      standard: "bg-emerald-100 text-emerald-800",
      pill: "bg-emerald-100 text-emerald-800",
      dot: "text-emerald-800",
      outline: "bg-white text-emerald-700 border border-emerald-500",
      solid: "bg-emerald-500 text-white",
      gradient: "bg-gradient-to-r from-emerald-400 to-green-500 text-white"
    },
    warning: {
      standard: "bg-amber-100 text-amber-800",
      pill: "bg-amber-100 text-amber-800",
      dot: "text-amber-800",
      outline: "bg-white text-amber-700 border border-amber-500",
      solid: "bg-amber-500 text-white",
      gradient: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white"
    },
    danger: {
      standard: "bg-red-100 text-red-800",
      pill: "bg-red-100 text-red-800",
      dot: "text-red-800",
      outline: "bg-white text-red-700 border border-red-500",
      solid: "bg-red-500 text-white",
      gradient: "bg-gradient-to-r from-red-400 to-red-600 text-white"
    },
    info: {
      standard: "bg-sky-100 text-sky-800",
      pill: "bg-sky-100 text-sky-800",
      dot: "text-sky-800",
      outline: "bg-white text-sky-700 border border-sky-500",
      solid: "bg-sky-500 text-white",
      gradient: "bg-gradient-to-r from-sky-400 to-blue-500 text-white"
    },
    neutral: {
      standard: "bg-gray-100 text-gray-800",
      pill: "bg-gray-100 text-gray-800",
      dot: "text-gray-800",
      outline: "bg-white text-gray-700 border border-gray-400",
      solid: "bg-gray-500 text-white",
      gradient: "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
    },
    dark: {
      standard: "bg-gray-800 text-white",
      pill: "bg-gray-800 text-white",
      dot: "text-gray-800",
      outline: "bg-white text-gray-800 border border-gray-700",
      solid: "bg-gray-800 text-white",
      gradient: "bg-gradient-to-r from-gray-700 to-gray-900 text-white"
    }
  };
  
  // Badge sizes
  const sizes = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-sm px-3 py-1"
  };

  // Get dot color
  const getDotColor = () => {
    switch(color) {
      case 'primary': return 'bg-indigo-500';
      case 'secondary': return 'bg-blue-500';
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'danger': return 'bg-red-500';
      case 'info': return 'bg-sky-500';
      case 'neutral': return 'bg-gray-500';
      case 'dark': return 'bg-gray-800';
      default: return 'bg-indigo-500';
    }
  };
  
  // Base classes for all badges based on variant
  const getBaseClasses = () => {
    let baseClasses = 'inline-flex items-center justify-center font-medium';
    
    // Add shape classes
    if (variant === 'standard') {
      baseClasses += ' rounded-md';
    } else if (variant === 'pill' || variant === 'gradient' || variant === 'solid' || variant === 'outline') {
      baseClasses += ' rounded-full';
    } else if (variant === 'dot') {
      baseClasses += ' rounded-md pl-1.5';
    }
    
    // Add shadow if glow is true
    if (glow) {
      if (color === 'primary') baseClasses += ' shadow-indigo-100 shadow-lg';
      else if (color === 'secondary') baseClasses += ' shadow-blue-100 shadow-lg';
      else if (color === 'success') baseClasses += ' shadow-emerald-100 shadow-lg';
      else if (color === 'warning') baseClasses += ' shadow-amber-100 shadow-lg';
      else if (color === 'danger') baseClasses += ' shadow-red-100 shadow-lg';
      else if (color === 'info') baseClasses += ' shadow-sky-100 shadow-lg';
      else baseClasses += ' shadow-gray-100 shadow-lg';
    }
    
    return baseClasses;
  };

  // Animation properties
  const badgeAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  // Final classes combining all options
  const finalClasses = `
    ${getBaseClasses()}
    ${variant !== 'dot' ? colors[color][variant] : ''}
    ${sizes[size]} 
    ${className}
  `;

  // Dot element for dot variant
  const renderDot = () => {
    if (variant !== 'dot') return null;
    return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${getDotColor()}`} />;
  };

  // Icon element
  const renderIcon = () => {
    if (!icon) return null;
    return <span className="mr-1">{icon}</span>;
  };

  // Remove button
  const renderRemoveButton = () => {
    if (!removable) return null;
    return (
      <button 
        type="button" 
        onClick={onRemove} 
        className="ml-1 -mr-1 hover:text-gray-500 focus:outline-none"
      >
        <span className="sr-only">Remove</span>
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 8.586l3.293-3.293a1 1 0 011.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707a1 1 0 011.414-1.414L10 8.586z" clipRule="evenodd" />
        </svg>
      </button>
    );
  };

  return (
    <motion.span
      initial="initial"
      animate="animate"
      exit="exit"
      variants={badgeAnimation}
      className={finalClasses}
      {...props}
    >
      {renderDot()}
      {renderIcon()}
      {children}
      {renderRemoveButton()}
    </motion.span>
  );
};

export default Badge;