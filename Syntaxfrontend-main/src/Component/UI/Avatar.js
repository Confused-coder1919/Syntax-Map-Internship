import React from "react";

/**
 * Avatar component with various styles and sizes
 * 
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alternative text for the image
 * @param {string} props.name - Name to use for generating initials
 * @param {string} props.size - xs, sm, md, lg, xl, 2xl
 * @param {string} props.shape - circle, square, rounded
 * @param {string} props.variant - image, initial, icon
 * @param {string} props.status - online, offline, away, busy, none
 * @param {string} props.statusPosition - top-right, top-left, bottom-right, bottom-left
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.bgColor - Background color for initial or icon variants
 * @param {string} props.textColor - Text color for initials
 * @param {string} props.className - Additional classes
 * @param {boolean} props.bordered - Whether to show a border
 * @param {string} props.borderColor - Border color
 * @param {React.ReactNode} props.badge - Badge content
 */
const Avatar = ({ 
  src,
  alt = "",
  name,
  size = "md",
  shape = "circle",
  variant = "image",
  status = "none",
  statusPosition = "bottom-right",
  icon,
  bgColor,
  textColor,
  className = "",
  bordered = false,
  borderColor = "white",
  badge,
  ...props
}) => {
  // Size variants
  const sizes = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
    "2xl": "h-20 w-20 text-xl",
    "3xl": "h-24 w-24 text-2xl",
  };
  
  // Shape variants
  const shapes = {
    circle: "rounded-full",
    square: "rounded-none",
    rounded: "rounded-md"
  };

  // Status colors
  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-gray-400",
    away: "bg-amber-500",
    busy: "bg-red-500"
  };

  // Status position classes
  const statusPositions = {
    "top-right": "-top-1 -right-1",
    "top-left": "-top-1 -left-1",
    "bottom-right": "-bottom-1 -right-1",
    "bottom-left": "-bottom-1 -left-1"
  };

  // Status dot sizes based on avatar size
  const statusSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
    xl: "h-3.5 w-3.5",
    "2xl": "h-4 w-4",
    "3xl": "h-5 w-5",
  };

  // Get background color based on name (for initial variant)
  const getBackgroundColor = () => {
    if (bgColor) return bgColor;
    
    // If no bgColor is provided, generate one based on the name
    if (name) {
      const colors = [
        "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500", 
        "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", 
        "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500", 
        "bg-cyan-500", "bg-sky-500"
      ];
      
      // Get a consistent color based on the name
      const hashCode = name.split('').reduce(
        (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0
      );
      return colors[Math.abs(hashCode) % colors.length];
    }
    
    // Default fallback color
    return "bg-gray-500";
  };

  // Generate initials from name
  const getInitials = () => {
    if (!name) return "";
    
    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Base classes for all avatars
  const baseClasses = `
    inline-flex items-center justify-center
    ${sizes[size]} 
    ${shapes[shape]} 
    ${bordered ? `ring-2 ring-${borderColor}` : ''}
    ${className}
  `;

  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      case "initial":
        return (
          <div
            className={`${baseClasses} ${getBackgroundColor()} text-${textColor || 'white'} font-medium`}
            {...props}
          >
            {getInitials()}
          </div>
        );
      case "icon":
        return (
          <div
            className={`${baseClasses} ${bgColor || 'bg-gray-200'} text-${textColor || 'gray-700'}`}
            {...props}
          >
            {icon}
          </div>
        );
      case "image":
      default:
        return (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className={`${baseClasses} object-cover`}
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              e.target.parentNode.classList.add(getBackgroundColor());
              e.target.parentNode.classList.add(`text-${textColor || 'white'}`);
              e.target.parentNode.classList.add('font-medium');
              
              // Create and append text with initials
              const textNode = document.createElement('span');
              textNode.innerText = getInitials();
              e.target.parentNode.appendChild(textNode);
            }}
            {...props}
          />
        );
    }
  };

  return (
    <div className="relative inline-flex">
      {renderContent()}
      
      {/* Status indicator */}
      {status !== "none" && (
        <span 
          className={`absolute ${statusPositions[statusPosition]} ${statusColors[status]} ${statusSizes[size]} border-2 border-white rounded-full`}
        />
      )}
      
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 -right-2">
          {badge}
        </div>
      )}
    </div>
  );
};

/**
 * AvatarGroup component for displaying a group of avatars
 * 
 * @param {Object} props - Component props
 * @param {Array} props.avatars - Array of avatar props objects
 * @param {number} props.max - Maximum number of avatars to display
 * @param {string} props.size - Avatar size (xs, sm, md, lg, xl, 2xl)
 * @param {string} props.shape - Avatar shape (circle, square, rounded)
 * @param {string} props.spacing - Spacing between avatars (-8, -4, -2, 0)
 * @param {string} props.className - Additional classes
 */
export const AvatarGroup = ({
  avatars = [],
  max,
  size = "md",
  shape = "circle",
  spacing = "-4",
  className = "",
  ...props
}) => {
  if (!avatars.length) return null;
  
  // If max is set, limit the avatars
  const displayAvatars = max && avatars.length > max
    ? avatars.slice(0, max)
    : avatars;
  
  // Determine if we need to show +X more 
  const remaining = max && avatars.length > max
    ? avatars.length - max
    : 0;
  
  // Spacing classes
  const spacingClasses = {
    "-8": "-ml-8",
    "-6": "-ml-6",
    "-4": "-ml-4",
    "-2": "-ml-2",
    "0": "ml-0"
  };

  return (
    <div className={`flex ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div 
          key={index} 
          className={`${index !== 0 ? spacingClasses[spacing] : ''} relative`}
          style={{ zIndex: 10 - index }}
        >
          <Avatar
            size={size}
            shape={shape}
            bordered
            {...avatar}
          />
        </div>
      ))}
      
      {remaining > 0 && (
        <div 
          className={`${spacingClasses[spacing]} relative`}
          style={{ zIndex: 10 - displayAvatars.length }}
        >
          <Avatar
            size={size}
            shape={shape}
            bordered
            variant="initial"
            name={`+${remaining}`}
            bgColor="bg-gray-400"
          />
        </div>
      )}
    </div>
  );
};

export default Avatar;