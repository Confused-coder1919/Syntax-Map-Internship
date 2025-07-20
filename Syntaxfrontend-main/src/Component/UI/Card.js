import React from "react";
import { motion } from "framer-motion";

/**
 * Card component with animations and variants
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - basic, elevated, outlined, gradient, dark, etc.
 * @param {boolean} props.hover - Enable hover effects
 * @param {boolean} props.interactive - Add interactive styles (for clickable cards)
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {function} props.onClick - Click handler for interactive cards
 * @param {string} props.hoverEffect - Type of hover effect (e.g., 'lift')
 */
const Card = ({ 
  variant = "basic",
  hover = true,
  interactive = false,
  className = "",
  children,
  header,
  footer,
  onClick,
  hoverEffect,  // Add this prop to the destructuring
  ...props
}) => {
  // Card variants with more professional options
  const variants = {
    basic: "bg-white",
    elevated: "bg-white shadow-md",
    highlighted: "bg-white shadow-md border-l-4 border-indigo-500",
    outlined: "bg-white border border-gray-200",
    subtle: "bg-gray-50 border border-gray-100",
    flat: "bg-gray-50",
    dark: "bg-gray-800 text-white",
    primary: "bg-indigo-50 border border-indigo-100",
    success: "bg-emerald-50 border border-emerald-100",
    warning: "bg-amber-50 border border-amber-100",
    danger: "bg-red-50 border border-red-100",
    info: "bg-sky-50 border border-sky-100",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md",
    glass: "bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 shadow-lg"
  };
  
  // Base classes for all cards
  const baseClasses = `
    rounded-xl overflow-hidden
    ${variants[variant]} 
    ${interactive ? 'cursor-pointer transition-all duration-300 hover:shadow-lg' : ''}
    ${className}
  `;

  // Animation properties with improved animations
  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" } 
    },
    hover: hover ? { 
      y: hoverEffect === 'lift' ? -5 : 0,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.2 }
    } : {}
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : undefined}
      variants={cardAnimation}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 font-medium">
          {header}
        </div>
      )}
      <div className={`${!header && !footer ? 'p-6' : 'px-6 py-5'}`}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;