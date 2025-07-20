import React, { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

/**
 * Modal component with animations and headless UI
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Control modal visibility
 * @param {function} props.onClose - Function to call when modal closes
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.description - Additional description text
 * @param {string} props.size - sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
 * @param {boolean} props.closeOnOverlayClick - Allow closing by clicking overlay
 * @param {string} props.position - Position of the modal (center, top, bottom)
 * @param {boolean} props.withCloseButton - Show close button in header
 * @param {React.ReactNode} props.footer - Footer content
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.variant - basic, rounded, gradient, glass
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  description,
  size = "md",
  closeOnOverlayClick = true,
  position = "center",
  withCloseButton = true,
  footer,
  children,
  variant = "basic",
  ...props
}) => {
  const cancelButtonRef = useRef(null);
  
  // Size variants
  const sizes = {
    xs: "sm:max-w-xs",
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    full: "sm:max-w-full sm:w-full"
  };

  // Modal variants
  const variants = {
    basic: "bg-white",
    rounded: "bg-white rounded-2xl",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white",
    glass: "bg-white bg-opacity-70 backdrop-filter backdrop-blur-xl border border-gray-200 border-opacity-50",
    dark: "bg-gray-900 text-white"
  };

  // Position variants
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "items-start pt-16";
      case "bottom":
        return "items-end pb-16";
      case "center":
      default:
        return "items-center";
    }
  };

  // Enhanced animation variants for modal content based on position
  const getModalVariants = () => {
    switch (position) {
      case "top":
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          },
          exit: { opacity: 0, y: -50, transition: { duration: 0.2 } }
        };
      case "bottom":
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          },
          exit: { opacity: 0, y: 50, transition: { duration: 0.2 } }
        };
      case "center":
      default:
        return {
          hidden: { opacity: 0, scale: 0.95 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          },
          exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
        };
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="fixed z-50 inset-0 overflow-y-auto" 
        initialFocus={cancelButtonRef}
        onClose={closeOnOverlayClick ? onClose : () => {}}
        {...props}
      >
        <div className={`flex min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 ${getPositionClasses()}`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity backdrop-filter backdrop-blur-sm" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className={`inline-block align-bottom overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} sm:w-full`}>
              <motion.div
                variants={getModalVariants()}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`${variants[variant]} rounded-lg overflow-hidden`}
              >
                {title && (
                  <div className={`px-6 py-4 ${variant === 'gradient' ? 'border-b border-white border-opacity-20' : 'border-b border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-medium">
                          {title}
                        </Dialog.Title>
                        {description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {description}
                          </p>
                        )}
                      </div>
                      {withCloseButton && (
                        <button
                          type="button"
                          className={`rounded-md ${
                            variant === 'gradient' || variant === 'dark' 
                              ? 'text-white hover:text-gray-200 focus:ring-white' 
                              : 'text-gray-400 hover:text-gray-500 focus:ring-indigo-500'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                          onClick={onClose}
                        >
                          <span className="sr-only">Close</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="px-6 py-5">
                  {children}
                </div>
                {footer && (
                  <div className={`px-6 py-4 ${variant === 'gradient' ? 'border-t border-white border-opacity-20 bg-black bg-opacity-10' : 'border-t border-gray-200 bg-gray-50'}`}>
                    {footer}
                  </div>
                )}
              </motion.div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;