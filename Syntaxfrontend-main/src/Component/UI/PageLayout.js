import React from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

/**
 * PageLayout component for consistent page structure with professional design
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {string} props.className - Additional classes
 * @param {React.ReactNode} props.headerContent - Optional content for the header area
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.variant - basic, centered, full, minimal, dashboard
 * @param {string} props.background - white, gray, gradient, pattern
 * @param {string} props.width - sm, md, lg, xl, 2xl, full, screen
 * @param {boolean} props.backLink - Show back link
 * @param {string} props.backLinkTo - URL for back link
 * @param {string} props.backLinkText - Text for back link
 * @param {Array} props.breadcrumbs - Array of breadcrumb objects { label, href }
 * @param {boolean} props.withAnimation - Enable page animations
 * @param {string} props.animationType - fade, slide-up, zoom
 * @param {boolean} props.withContainer - Add container for max width
 */
const PageLayout = ({ 
  title,
  subtitle,
  className = "",
  headerContent,
  children,
  variant = "basic",
  background = "white",
  width = "2xl",
  backLink = false,
  backLinkTo = "/",
  backLinkText = "Back",
  breadcrumbs = [],
  withAnimation = true,
  animationType = "fade",
  withContainer = true,
  ...props
}) => {
  // Background variants
  const backgrounds = {
    white: "bg-white",
    gray: "bg-gray-50",
    light: "bg-gray-100",
    dark: "bg-gray-900 text-white",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white",
    pattern: "bg-gray-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOGg2djZoLTZ2NmwtNiA2IDYgNnY2aDZ2LTZsNi02LTYtNnoiIGZpbGw9IiNlZWUiLz48L2c+PC9zdmc+')] bg-repeat"
  };

  // Width variants
  const widths = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full",
    screen: "max-w-screen-2xl"
  };

  // Animation variants based on type
  const getAnimationVariants = () => {
    switch (animationType) {
      case "slide-up":
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
              }
            }
          },
          item: {
            hidden: { opacity: 0, y: 30 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { duration: 0.4, ease: "easeOut" } 
            }
          }
        };
      case "zoom":
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
              }
            }
          },
          item: {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { 
              opacity: 1, 
              scale: 1, 
              transition: { duration: 0.4, ease: "easeOut" } 
            }
          }
        };
      case "fade":
      default:
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.3
              }
            }
          },
          item: {
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0, 
              transition: { duration: 0.4, ease: "easeOut" } 
            }
          }
        };
    }
  };

  const animationVariants = getAnimationVariants();

  // Render page header based on variant
  const renderHeader = () => {
    if (!title && !subtitle && !headerContent && !backLink && breadcrumbs.length === 0) {
      return null;
    }

    // Determine header background and text colors
    const headerBg = variant === 'minimal' ? '' : 
                     background === 'dark' || background === 'gradient' ? 'bg-gray-800 border-gray-700' :
                     'bg-white shadow border-b border-gray-200';
    
    const textColor = background === 'dark' || background === 'gradient' ? 'text-white' : 'text-gray-900';
    const subtitleColor = background === 'dark' || background === 'gradient' ? 'text-gray-200' : 'text-gray-500';

    return (
      <div className={`${headerBg} ${variant === 'dashboard' ? 'sticky top-0 z-10' : ''}`}>
        <div className={`${withContainer ? widths[width] + ' mx-auto' : ''} py-6 px-4 sm:px-6 lg:px-8`}>
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <motion.nav 
              variants={animationVariants.item}
              className="flex mb-4" 
              aria-label="Breadcrumb"
            >
              <ol className="flex items-center space-x-1 text-sm">
                <li>
                  <Link to="/" className={`${background === 'dark' || background === 'gradient' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    <HomeIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Home</span>
                  </Link>
                </li>
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    <ChevronLeftIcon 
                      className={`h-4 w-4 ${background === 'dark' || background === 'gradient' ? 'text-gray-500' : 'text-gray-400'} rotate-180`} 
                      aria-hidden="true" 
                    />
                    {index === breadcrumbs.length - 1 ? (
                      <span className={`ml-1 ${background === 'dark' || background === 'gradient' ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        to={crumb.href}
                        className={`ml-1 ${background === 'dark' || background === 'gradient' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </motion.nav>
          )}

          {/* Back link */}
          {backLink && (
            <motion.div 
              variants={animationVariants.item}
              className="mb-4"
            >
              <Link
                to={backLinkTo}
                className={`inline-flex items-center ${
                  background === 'dark' || background === 'gradient' 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                } text-sm`}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                {backLinkText}
              </Link>
            </motion.div>
          )}

          <div className={`flex flex-col ${variant !== 'centered' ? 'sm:flex-row sm:items-center sm:justify-between' : 'items-center text-center'}`}>
            <div>
              {title && (
                <motion.h1 
                  variants={animationVariants.item}
                  className={`text-2xl sm:text-3xl font-bold ${textColor}`}
                >
                  {title}
                </motion.h1>
              )}
              {subtitle && (
                <motion.p 
                  variants={animationVariants.item}
                  className={`mt-1 text-sm ${subtitleColor} ${variant === 'centered' ? 'max-w-2xl mx-auto' : ''}`}
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
            
            {headerContent && (
              <motion.div 
                variants={animationVariants.item} 
                className={`${variant === 'centered' ? 'mt-6' : 'mt-4 sm:mt-0'}`}
              >
                {headerContent}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render page content based on variant
  const renderContent = () => {
    // Content wrapper classes based on variant
    const contentWrapperClasses = variant === 'minimal' ? 'py-4' : 
                                 variant === 'centered' ? 'py-8 sm:py-12' : 
                                 variant === 'dashboard' ? 'py-4' : 
                                 'py-6 sm:py-10';
    
    // Content inner classes
    const contentInnerClasses = variant === 'centered' ? 'text-center' : '';
    
    return (
      <main className={backgrounds[background]}>
        <div className={`${withContainer ? widths[width] + ' mx-auto' : ''} ${contentWrapperClasses} px-4 sm:px-6 lg:px-8`}>
          <motion.div
            variants={animationVariants.item}
            className={contentInnerClasses}
          >
            {children}
          </motion.div>
        </div>
      </main>
    );
  };

  return (
    <motion.div
      initial={withAnimation ? "hidden" : "visible"}
      animate="visible"
      variants={animationVariants.container}
      className={`min-h-screen ${variant === 'full' ? backgrounds[background] : ''} ${className}`}
      {...props}
    >
      {renderHeader()}
      {renderContent()}
    </motion.div>
  );
};

export default PageLayout;