import React from "react";

/**
 * Skeleton component for displaying loading placeholders
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - text, circle, rectangle, avatar, card, list, table
 * @param {string} props.width - Width of the skeleton (CSS value)
 * @param {string} props.height - Height of the skeleton (CSS value)
 * @param {number} props.count - Number of skeleton items to render
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional classes
 * @param {string} props.baseColor - Base color of the skeleton
 * @param {string} props.highlightColor - Highlight color for animation
 */
const Skeleton = ({ 
  variant = "text",
  width,
  height,
  count = 1,
  animated = true,
  className = "",
  baseColor = "#e5e7eb",
  highlightColor = "#f3f4f6",
  ...props
}) => {
  // Create multiple skeletons based on count
  const skeletons = [];
  
  // Get classes based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case "circle":
        return "rounded-full";
      case "avatar":
        return "rounded-full h-10 w-10";
      case "rectangle":
        return "rounded-md";
      case "card":
        return "rounded-lg h-40";
      case "button":
        return "rounded-md h-10";
      case "table":
        return "rounded-md h-6";
      case "text":
      default:
        return "rounded h-4";
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    return animated ? "animate-pulse" : "";
  };

  // Get style based on width and height
  const getStyle = () => {
    const style = { backgroundColor: baseColor };
    
    if (width) style.width = width;
    if (height) style.height = height;
    
    return style;
  };

  // Create the specified number of skeleton elements
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div
        key={i}
        className={`${getVariantClasses()} ${getAnimationClasses()} ${className}`}
        style={getStyle()}
        {...props}
      />
    );
  }
  
  // If count > 1, wrap in a container with spacing
  if (count > 1) {
    return (
      <div className="flex flex-col space-y-2">
        {skeletons}
      </div>
    );
  }
  
  // Otherwise, return just the single skeleton
  return skeletons[0];
};

/**
 * Text skeleton component for displaying paragraph loading placeholders
 * 
 * @param {Object} props - Component props
 * @param {number} props.lines - Number of lines to render
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional classes
 * @param {string} props.lastLineWidth - Width of the last line (CSS value)
 */
export const TextSkeleton = ({ 
  lines = 3, 
  animated = true,
  className = "",
  lastLineWidth = "75%",
  ...props 
}) => {
  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="text"
          animated={animated}
          className={className}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          {...props}
        />
      ))}
    </div>
  );
};

/**
 * Card skeleton component for displaying card loading placeholders
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.header - Whether to include a header
 * @param {boolean} props.footer - Whether to include a footer
 * @param {number} props.lines - Number of content lines
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional classes
 */
export const CardSkeleton = ({
  header = true,
  footer = false,
  lines = 3,
  animated = true,
  className = "",
  ...props
}) => {
  return (
    <div className={`overflow-hidden border border-gray-200 rounded-lg ${className}`}>
      {header && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <Skeleton 
              variant="avatar" 
              animated={animated} 
              {...props} 
            />
            <div className="space-y-2 flex-1">
              <Skeleton 
                variant="text" 
                animated={animated} 
                width="40%" 
                {...props} 
              />
              <Skeleton 
                variant="text" 
                animated={animated} 
                width="30%" 
                height="10px"
                {...props} 
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <TextSkeleton 
          lines={lines} 
          animated={animated} 
          {...props} 
        />
      </div>
      
      {footer && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-between">
            <Skeleton 
              variant="text" 
              animated={animated} 
              width="30%" 
              {...props} 
            />
            <Skeleton 
              variant="text" 
              animated={animated} 
              width="15%" 
              {...props} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Table skeleton component for displaying table loading placeholders
 * 
 * @param {Object} props - Component props
 * @param {number} props.rows - Number of rows
 * @param {number} props.columns - Number of columns
 * @param {boolean} props.header - Whether to include a header
 * @param {boolean} props.animated - Whether to animate the skeleton
 * @param {string} props.className - Additional classes
 */
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  header = true,
  animated = true,
  className = "",
  ...props
}) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`}>
      <div className="min-w-full divide-y divide-gray-200">
        {header && (
          <div className="bg-gray-50">
            <div className="grid grid-cols-1 divide-x divide-gray-200" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, index) => (
                <div key={index} className="px-4 py-3">
                  <Skeleton 
                    variant="table" 
                    animated={animated} 
                    width="60%" 
                    height="18px"
                    className="bg-gray-300"
                    {...props} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-1 divide-x divide-gray-200" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="px-4 py-3">
                  <Skeleton 
                    variant="table" 
                    animated={animated} 
                    width={`${Math.floor(Math.random() * 40) + 40}%`} 
                    {...props} 
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;