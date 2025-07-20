import React from "react";
import { motion } from "framer-motion";
import { Tab } from "@headlessui/react";

/**
 * Tabs component with animations and modern styling options
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with { name, content, icon, disabled, badge }
 * @param {string} props.variant - pills, underline, bordered, cards, vertical, gradient
 * @param {string} props.color - primary, success, warning, danger, info, neutral, etc.
 * @param {string} props.size - sm, md, lg
 * @param {string} props.className - Additional classes
 * @param {number} props.defaultIndex - Default selected tab index
 * @param {string} props.tabsAlign - left, center, right, justify (horizontal alignment)
 * @param {function} props.onChange - Function called when active tab changes
 */
const Tabs = ({ 
  tabs = [],
  variant = "underline",
  color = "primary",
  size = "md",
  className = "",
  defaultIndex = 0,
  tabsAlign = "left",
  onChange,
  ...props
}) => {
  // Color options for different states
  const colors = {
    primary: {
      selected: "text-indigo-600 border-indigo-500 bg-indigo-50",
      hover: "hover:text-indigo-700 hover:border-indigo-300",
      fillSelected: "bg-indigo-600 text-white",
      fillHover: "hover:bg-indigo-700",
      gradientSelected: "bg-gradient-to-r from-indigo-500 to-blue-600 text-white",
    },
    secondary: {
      selected: "text-blue-600 border-blue-500 bg-blue-50",
      hover: "hover:text-blue-700 hover:border-blue-300",
      fillSelected: "bg-blue-600 text-white",
      fillHover: "hover:bg-blue-700",
      gradientSelected: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
    },
    success: {
      selected: "text-emerald-600 border-emerald-500 bg-emerald-50",
      hover: "hover:text-emerald-700 hover:border-emerald-300",
      fillSelected: "bg-emerald-600 text-white",
      fillHover: "hover:bg-emerald-700",
      gradientSelected: "bg-gradient-to-r from-emerald-400 to-green-500 text-white",
    },
    warning: {
      selected: "text-amber-600 border-amber-500 bg-amber-50",
      hover: "hover:text-amber-700 hover:border-amber-300",
      fillSelected: "bg-amber-600 text-white",
      fillHover: "hover:bg-amber-700",
      gradientSelected: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white",
    },
    danger: {
      selected: "text-red-600 border-red-500 bg-red-50",
      hover: "hover:text-red-700 hover:border-red-300",
      fillSelected: "bg-red-600 text-white",
      fillHover: "hover:bg-red-700",
      gradientSelected: "bg-gradient-to-r from-red-400 to-red-600 text-white",
    },
    info: {
      selected: "text-sky-600 border-sky-500 bg-sky-50",
      hover: "hover:text-sky-700 hover:border-sky-300",
      fillSelected: "bg-sky-600 text-white",
      fillHover: "hover:bg-sky-700",
      gradientSelected: "bg-gradient-to-r from-sky-400 to-blue-500 text-white",
    },
    neutral: {
      selected: "text-gray-800 border-gray-500 bg-gray-50",
      hover: "hover:text-gray-700 hover:border-gray-300",
      fillSelected: "bg-gray-700 text-white",
      fillHover: "hover:bg-gray-800",
      gradientSelected: "bg-gradient-to-r from-gray-500 to-gray-700 text-white",
    },
    dark: {
      selected: "text-gray-900 border-gray-800 bg-gray-100",
      hover: "hover:text-gray-800 hover:border-gray-700",
      fillSelected: "bg-gray-900 text-white",
      fillHover: "hover:bg-black",
      gradientSelected: "bg-gradient-to-r from-gray-700 to-gray-900 text-white",
    }
  };
  
  // Size variants
  const sizes = {
    sm: "text-xs py-2 px-3",
    md: "text-sm py-2.5 px-4",
    lg: "text-base py-3 px-5"
  };
  
  // Tab alignment
  const getTabsAlign = () => {
    switch(tabsAlign) {
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      case 'justify': return 'justify-between';
      case 'left':
      default: return 'justify-start';
    }
  };

  // Variants styling with advanced options
  const getVariantStyles = () => {
    switch(variant) {
      case 'pills':
        return {
          list: `flex p-1 space-x-1 rounded-xl bg-gray-100 ${getTabsAlign()}`,
          tab: {
            selected: `${colors[color].fillSelected} shadow-md`,
            notSelected: "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          },
          base: `${sizes[size]} font-medium leading-5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500`
        };
      case 'underline':
        return {
          list: `flex border-b border-gray-200 ${getTabsAlign()}`,
          tab: {
            selected: `border-b-2 ${colors[color].selected.replace('bg-', '')}`,
            notSelected: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2"
          },
          base: `${sizes[size]} font-medium transition-all duration-200 focus:outline-none`
        };
      case 'bordered':
        return {
          list: `flex border-b border-gray-200 ${getTabsAlign()}`,
          tab: {
            selected: `bg-white border border-gray-200 border-b-white text-gray-800 rounded-t-lg -mb-px`,
            notSelected: "bg-gray-50 text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100 rounded-t-lg"
          },
          base: `${sizes[size]} font-medium transition-all duration-200 focus:outline-none`
        };
      case 'cards':
        return {
          list: `flex space-x-2 ${getTabsAlign()}`,
          tab: {
            selected: `shadow-md rounded-lg ${colors[color].selected}`,
            notSelected: "bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg"
          },
          base: `${sizes[size]} font-medium transition-all duration-200 focus:outline-none`
        };
      case 'vertical':
        return {
          list: `flex flex-col space-y-1`,
          tab: {
            selected: `border-l-4 ${colors[color].selected}`,
            notSelected: "border-l-4 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          },
          base: `${sizes[size]} font-medium transition-all duration-200 focus:outline-none text-left`
        };
      case 'gradient':
        return {
          list: `flex p-1 space-x-1 rounded-xl bg-gray-100 ${getTabsAlign()}`,
          tab: {
            selected: colors[color].gradientSelected,
            notSelected: "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          },
          base: `${sizes[size]} font-medium leading-5 rounded-lg transition-all duration-200 focus:outline-none`
        };
      case 'buttons':
        return {
          list: `inline-flex p-1 space-x-1 rounded-lg border border-gray-200 bg-gray-50 ${getTabsAlign()}`,
          tab: {
            selected: colors[color].fillSelected,
            notSelected: "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
          },
          base: `${sizes[size]} font-medium transition-all duration-200 focus:outline-none`
        };
      default:
        return {
          list: `flex border-b border-gray-200 ${getTabsAlign()}`,
          tab: {
            selected: `border-b-2 ${colors[color].selected.replace('bg-', '')}`,
            notSelected: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2"
          },
          base: `${sizes[size]} font-medium transition-all duration-200 focus:outline-none`
        };
    }
  };

  // Animation properties
  const tabAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  // Get the current variant styles
  const variantStyles = getVariantStyles();

  // Render badge if provided
  const renderBadge = (badge) => {
    if (!badge) return null;
    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
        colors[color].fillSelected.replace('text-white', 'text-white bg-opacity-90')
      }`}>
        {badge}
      </span>
    );
  };

  // Render icon if provided
  const renderIcon = (icon) => {
    if (!icon) return null;
    return (
      <span className="mr-2">{icon}</span>
    );
  };

  return (
    <div className={`${className} ${variant === 'vertical' ? 'flex' : 'block'}`}>
      <Tab.Group 
        defaultIndex={defaultIndex} 
        onChange={onChange}
        vertical={variant === 'vertical'}
      >
        <Tab.List className={`${variantStyles.list} ${variant === 'vertical' ? 'flex-shrink-0' : ''}`}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              disabled={tab.disabled}
              className={({ selected }) =>
                `${variantStyles.base} ${
                  selected
                    ? variantStyles.tab.selected
                    : variantStyles.tab.notSelected
                } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`
              }
            >
              <div className="flex items-center justify-center whitespace-nowrap">
                {renderIcon(tab.icon)}
                <span>{tab.name}</span>
                {renderBadge(tab.badge)}
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className={`mt-4 ${variant === 'vertical' ? 'flex-grow ml-4' : ''}`}>
          {tabs.map((tab, index) => (
            <Tab.Panel
              key={index}
              className={`rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500`}
            >
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={tabAnimation}
              >
                {tab.content}
              </motion.div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Tabs;