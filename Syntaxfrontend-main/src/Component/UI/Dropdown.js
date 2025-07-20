import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";

/**
 * Enhanced Dropdown select component with animation and styling options
 * 
 * @param {Object} props - Component props
 * @param {Array} props.options - Array of options to display
 * @param {any} props.value - Currently selected value
 * @param {function} props.onChange - Function to call when selection changes
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text when no selection
 * @param {string} props.error - Error message
 * @param {string} props.helper - Helper text
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {boolean} props.fullWidth - Whether dropdown should take full width
 * @param {string} props.size - sm, md, lg
 * @param {string} props.variant - outlined, filled, underlined
 * @param {string} props.className - Additional classes
 * @param {function} props.renderOption - Custom option renderer
 * @param {string} props.labelKey - Key to use for option labels
 * @param {string} props.valueKey - Key to use for option values
 * @param {boolean} props.multiple - Enable multiple selection
 */
const Dropdown = ({ 
  options = [],
  value,
  onChange,
  label,
  placeholder = "Select an option",
  error,
  helper,
  disabled = false,
  fullWidth = false,
  size = "md",
  variant = "outlined",
  className = "",
  renderOption,
  labelKey = "label",
  valueKey = "value",
  multiple = false,
  ...props
}) => {
  // Size variants
  const sizes = {
    sm: "py-1 text-xs",
    md: "py-2 text-sm",
    lg: "py-2.5 text-base"
  };

  // Dropdown button heights should match input heights
  const heights = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12"
  };
  
  // Variant styles with improved focus states
  const getVariantClasses = () => {
    if (error) {
      switch (variant) {
        case "filled":
          return "border-transparent bg-red-50 text-red-900 focus:ring-red-500 focus:border-red-500";
        case "underlined":
          return "border-t-0 border-l-0 border-r-0 border-b-2 border-red-500 bg-transparent rounded-none px-0 focus:ring-0 focus:border-red-700";
        case "outlined":
        default:
          return "border-red-300 focus:ring-red-500 focus:border-red-500";
      }
    } else {
      switch (variant) {
        case "filled":
          return "border-transparent bg-gray-100 hover:bg-gray-50 focus:ring-orange-500 focus:border-orange-500";
        case "underlined":
          return "border-t-0 border-l-0 border-r-0 border-b-2 border-gray-300 bg-transparent rounded-none px-0 focus:ring-0 focus:border-orange-500";
        case "outlined":
        default:
          return "border-gray-300 hover:border-gray-400 focus:ring-orange-500 focus:border-orange-500";
      }
    }
  };

  // Label classes
  const labelClasses = `block text-sm font-medium ${
    error ? 'text-red-600' : 'text-gray-700'
  } ${
    disabled ? 'opacity-50' : ''
  } mb-1`;

  // Helper text classes
  const helperClasses = `mt-1 text-xs ${
    error ? 'text-red-600' : 'text-gray-500'
  }`;

  // Find the currently selected option(s) for display
  const getSelectedOption = () => {
    if (multiple) {
      if (!value || value.length === 0) return null;
      return options.filter(option => 
        value.includes(
          typeof option === 'object' ? option[valueKey] : option
        )
      );
    } else {
      if (value === undefined || value === null) return null;
      return options.find(option => 
        (typeof option === 'object' ? option[valueKey] : option) === value
      );
    }
  };

  // Get display label for an option
  const getOptionLabel = (option) => {
    if (!option) return "";
    return typeof option === 'object' ? option[labelKey] : option;
  };

  // Handle selection change
  const handleChange = (selected) => {
    if (multiple) {
      const selectedValues = selected.map(option => 
        typeof option === 'object' ? option[valueKey] : option
      );
      onChange(selectedValues);
    } else {
      const selectedValue = typeof selected === 'object' ? selected[valueKey] : selected;
      onChange(selectedValue);
    }
  };

  // Handle rendering multiple selected items
  const renderMultipleSelection = (selected) => {
    if (!selected || selected.length === 0) {
      return <span className="text-gray-400">{placeholder}</span>;
    }
    
    if (selected.length === 1) {
      return getOptionLabel(selected[0]);
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map((option, index) => (
          <span 
            key={index} 
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
          >
            {getOptionLabel(option)}
          </span>
        ))}
      </div>
    );
  };

  // Determine if button should be rounded
  const roundedClasses = variant !== 'underlined' ? 'rounded-md' : '';

  // Determine width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  const selectedOption = getSelectedOption();

  return (
    <div className={`${widthClasses} ${className}`}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <Listbox 
        value={selectedOption} 
        onChange={handleChange} 
        disabled={disabled}
        multiple={multiple}
        {...props}
      >
        {({ open }) => (
          <div className="relative mt-1">
            <Listbox.Button 
              className={`${heights[size]} relative ${widthClasses} ${sizes[size]} pl-3 pr-10 text-left ${
                disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-default'
              } ${getVariantClasses()} ${roundedClasses} shadow-sm focus:outline-none focus:ring-2 transition-all duration-200`}
            >
              <span className={`block truncate ${!selectedOption ? 'text-gray-400' : ''}`}>
                {multiple 
                  ? renderMultipleSelection(selectedOption) 
                  : (selectedOption ? getOptionLabel(selectedOption) : placeholder)
                }
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            
            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {options.length === 0 ? (
                  <div className="py-2 px-3 text-gray-400 italic">
                    No options available
                  </div>
                ) : (
                  options.map((option, index) => (
                    <Listbox.Option
                      key={index}
                      className={({ active }) =>
                        `${active ? 'text-white bg-orange-600' : 'text-gray-900'}
                        cursor-default select-none relative py-2 pl-10 pr-4 hover:bg-orange-50 hover:text-orange-900 transition-colors duration-100`
                      }
                      value={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`${selected ? 'font-medium' : 'font-normal'} block truncate`}
                          >
                            {renderOption ? renderOption(option, { selected, active }) : getOptionLabel(option)}
                          </span>
                          {selected ? (
                            <span
                              className={`${
                                active ? 'text-white' : 'text-orange-600'
                              } absolute inset-y-0 left-0 flex items-center pl-3`}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))
                )}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
      
      {/* Helper text or error message */}
      {(helper || error) && (
        <p className={helperClasses}>
          {error || helper}
        </p>
      )}
    </div>
  );
};

export default Dropdown;