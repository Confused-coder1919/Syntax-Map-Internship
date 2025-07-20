import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * Section component with scroll animations and advanced styling options
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Section subtitle
 * @param {React.ReactNode} props.titleAddon - Additional element to be rendered next to title
 * @param {string} props.className - Additional classes
 * @param {string} props.contentClassName - Additional classes for content container
 * @param {boolean} props.centered - Center the content
 * @param {boolean} props.animate - Enable animation
 * @param {string} props.animationType - fade, slide-up, slide-down, slide-left, slide-right
 * @param {string} props.background - white, gray, gradient, image, pattern
 * @param {string} props.backgroundImage - URL for background image
 * @param {string} props.padding - sm, md, lg, xl, none
 * @param {string} props.titleSize - sm, md, lg, xl, 2xl
 * @param {boolean} props.divider - Show divider below title
 * @param {React.ReactNode} props.children - Section content
 * @param {string} props.id - Section ID for navigation purposes
 */
const Section = ({ 
  title,
  subtitle,
  titleAddon,
  className = "",
  contentClassName = "",
  centered = false,
  animate = true,
  animationType = "fade",
  background = "white",
  backgroundImage,
  padding = "lg",
  titleSize = "lg",
  divider = false,
  children,
  id,
  ...props
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Background variants
  const backgrounds = {
    white: "bg-white",
    gray: "bg-gray-50",
    light: "bg-gray-100",
    dark: "bg-gray-900 text-white",
    primary: "bg-indigo-50",
    secondary: "bg-blue-50",
    success: "bg-emerald-50",
    warning: "bg-amber-50",
    danger: "bg-red-50",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-600 text-white",
    pattern: "bg-gray-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOGg2djZoLTZ2NmwtNiA2IDYgNnY2aDZ2LTZsNi02LTYtNnoiIGZpbGw9IiNlZWUiLz48L2c+PC9zdmc+')] bg-repeat"
  };

  // Padding variants
  const paddings = {
    none: "py-0",
    sm: "py-4 sm:py-6",
    md: "py-6 sm:py-8",
    lg: "py-12 sm:py-14",
    xl: "py-16 sm:py-20",
    "2xl": "py-20 sm:py-24"
  };

  // Title size variants
  const titleSizes = {
    sm: "text-xl font-bold sm:text-2xl",
    md: "text-2xl font-bold sm:text-3xl",
    lg: "text-3xl font-bold sm:text-4xl",
    xl: "text-4xl font-bold sm:text-5xl",
    "2xl": "text-5xl font-bold sm:text-6xl"
  };

  // Animation variants based on animation type
  const getAnimationVariants = () => {
    switch (animationType) {
      case "slide-up":
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                duration: 0.6,
                staggerChildren: 0.2
              }
            }
          },
          item: {
            hidden: { opacity: 0, y: 40 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5, ease: "easeOut" }
            }
          }
        };
      case "slide-down":
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                duration: 0.6,
                staggerChildren: 0.2
              }
            }
          },
          item: {
            hidden: { opacity: 0, y: -40 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5, ease: "easeOut" }
            }
          }
        };
      case "slide-left":
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                duration: 0.6,
                staggerChildren: 0.2
              }
            }
          },
          item: {
            hidden: { opacity: 0, x: 40 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.5, ease: "easeOut" }
            }
          }
        };
      case "slide-right":
        return {
          container: {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                duration: 0.6,
                staggerChildren: 0.2
              }
            }
          },
          item: {
            hidden: { opacity: 0, x: -40 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.5, ease: "easeOut" }
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
                duration: 0.6,
                staggerChildren: 0.2
              }
            }
          },
          item: {
            hidden: { opacity: 0, scale: 0.9 },
            visible: { 
              opacity: 1, 
              scale: 1,
              transition: { duration: 0.5, ease: "easeOut" }
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
                duration: 0.6,
                staggerChildren: 0.2
              }
            }
          },
          item: {
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.5, ease: "easeOut" }
            }
          }
        };
    }
  };

  const animationVariants = getAnimationVariants();

  // Get background style with optional image
  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {};
  };

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={animate ? "hidden" : "visible"}
      animate={inView && animate ? "visible" : undefined}
      variants={animationVariants.container}
      className={`${backgrounds[background]} ${paddings[padding]} ${className}`}
      style={getBackgroundStyle()}
      {...props}
    >
      <div className={`container mx-auto px-4 ${contentClassName}`}>
        {(title || subtitle) && (
          <div className={`mb-10 ${centered ? 'text-center' : ''}`}>
            <div className="flex items-center justify-between flex-col sm:flex-row">
              {title && (
                <motion.h2 
                  variants={animationVariants.item}
                  className={`${titleSizes[titleSize]} ${background === 'dark' || background === 'gradient' ? 'text-white' : 'text-gray-900'} mb-4 ${titleAddon ? 'mb-0 sm:mb-0' : ''}`}
                >
                  {title}
                </motion.h2>
              )}
              
              {titleAddon && (
                <motion.div 
                  variants={animationVariants.item}
                  className="mt-3 sm:mt-0"
                >
                  {titleAddon}
                </motion.div>
              )}
            </div>
            
            {subtitle && (
              <motion.p 
                variants={animationVariants.item}
                className={`text-xl ${background === 'dark' || background === 'gradient' ? 'text-gray-200' : 'text-gray-600'} max-w-3xl ${centered ? 'mx-auto' : ''}`}
              >
                {subtitle}
              </motion.p>
            )}
            
            {divider && (
              <motion.div 
                variants={animationVariants.item}
                className={`h-1 w-20 rounded-full my-6 ${background === 'dark' || background === 'gradient' ? 'bg-white bg-opacity-30' : 'bg-indigo-500'} ${centered ? 'mx-auto' : ''}`}
              />
            )}
          </div>
        )}
        
        <motion.div 
          variants={animationVariants.item}
          className={`${centered ? 'text-center' : ''}`}
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Section;