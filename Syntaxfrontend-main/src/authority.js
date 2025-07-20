import { getCurrentBackendUrl } from './config';
import config from './config';

// Cache mechanism to avoid multiple identical role requests
let cachedRole = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 300000; // 5 minutes (300000ms) cache duration

// Helper function to normalize roles (convert strings to numbers if needed)
const normalizeRole = (role) => {
  if (role === null || role === undefined) return null;
  
  // If role is a boolean 'true' value, try to use stored role
  if (role === true) {
    const storedRole = localStorage.getItem("user_role");
    if (storedRole) {
      console.log("Converting boolean 'true' role to stored role:", storedRole);
      return normalizeRole(storedRole); // Recursively normalize the stored role
    }
    return 4; // Default to guest if no stored role
  }
  
  // If role is a string that contains only digits, convert to number
  if (typeof role === 'string' && /^\d+$/.test(role)) {
    return parseInt(role, 10);
  }
  
  // If role is already a number or other string, return as is
  return role;
};

const fetchRole = async () => {
  try {
    // IMPORTANT: First explicitly check for admin role in localStorage 
    // This is to prioritize admin status over potentially conflicting database values
    const storedRole = localStorage.getItem("user_role");
    if (storedRole === "1" || storedRole === 1) {
      console.log("Found admin role in localStorage, prioritizing this over other checks");
      cachedRole = 1;
      cacheTimestamp = Date.now();
      return 1;
    }
    
    // Check if there's a valid cached role
    const now = Date.now();
    if (cachedRole && now - cacheTimestamp < CACHE_DURATION) {
      console.log("Using cached role:", cachedRole);
      return cachedRole;
    }
    
    // Get the token directly from jstoken
    const jwtToken = localStorage.getItem("jstoken");
    
    // Make sure we have a valid token before proceeding
    if (!jwtToken || jwtToken === '') {
      console.warn("No valid token found in localStorage");
      return null;
    }
    
    // Try to extract role from token first before making API calls
    try {
      const extractedRole = extractRoleFromToken(jwtToken);
      if (extractedRole !== null) {
        console.log("Extracted role from token:", extractedRole);
        
        // CRITICAL: Always prioritize admin role if found
        if (extractedRole === 1 || extractedRole === "1") {
          console.log("Admin role found in token, prioritizing");
          localStorage.setItem("user_role", "1");  // Ensure the role is stored
          cachedRole = 1;
          cacheTimestamp = now;
          return 1; 
        }
        
        // Update the cache
        cachedRole = extractedRole;
        cacheTimestamp = now;
        return extractedRole;
      }
    } catch (error) {
      console.warn("Unable to extract role from token:", error);
    }

    // First try with production backend directly - more reliable
    try {
      console.log("Trying production backend for role");
      const response = await fetch(`${config.prodBackendUrl}/user/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": jwtToken.startsWith("Bearer ") ? jwtToken : `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ token: jwtToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Role data received from production:", data);
        
        // CRITICAL: Always prioritize admin role if found
        if (data.role === 1 || data.role === "1") {
          console.log("Admin role found from API, prioritizing");
          localStorage.setItem("user_role", "1");
          cachedRole = 1;
          cacheTimestamp = now;
          return 1;
        }
        
        // Update the cache
        cachedRole = normalizeRole(data.role);
        cacheTimestamp = now;
        
        // Also store in localStorage
        if (data.role) {
          localStorage.setItem("user_role", data.role);
        }
        
        return cachedRole;
      } else {
        console.warn("Production API returned error:", response.status);
      }
    } catch (prodError) {
      console.warn("Production API failed:", prodError.message);
    }

    // If production fails, try local backend
    try {
      console.log("Trying local backend for role");
      const response = await fetch(`${config.backendUrl}/user/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": jwtToken.startsWith("Bearer ") ? jwtToken : `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ token: jwtToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Role data received from local:", data);
        
        // CRITICAL: Always prioritize admin role if found 
        if (data.role === 1 || data.role === "1") {
          console.log("Admin role found from local API, prioritizing");
          localStorage.setItem("user_role", "1");
          cachedRole = 1;
          cacheTimestamp = now;
          return 1;
        }
        
        // Update the cache
        cachedRole = normalizeRole(data.role);
        cacheTimestamp = now;
        
        // Also store in localStorage
        if (data.role) {
          localStorage.setItem("user_role", data.role);
        }
        
        return cachedRole;
      } else {
        console.warn("Local API returned error:", response.status);
      }
    } catch (error) {
      console.warn("Local API failed:", error.message);
    }
    
    // If API calls fail, fall back to stored role
    console.log("Using fallback stored role:", storedRole);
    return normalizeRole(storedRole);
  } catch (error) {
    console.error("Unexpected error in fetchRole:", error);
    // Fall back to stored role as last resort
    const storedRole = localStorage.getItem("user_role");
    return normalizeRole(storedRole);
  }
};

// Helper function to extract role from JWT token
const extractRoleFromToken = (token) => {
  try {
    if (!token) return null;
    
    // Remove Bearer prefix if present
    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const tokenParts = actualToken.split('.');
    
    if (tokenParts.length !== 3) return null;
    
    // Base64 decode and parse the payload
    const payload = JSON.parse(atob(tokenParts[1]));
    
    // Extract the role using all possible field names
    const role = payload.user_role || payload.role || payload.userRole || 
                 (payload.sub && payload.sub.user_role);
    
    if (role) {
      // Save it for future use
      localStorage.setItem("user_role", role);
    }
    
    return normalizeRole(role);
  } catch (error) {
    console.error("Error extracting role from token:", error);
    return null;
  }
};

export const checkAuthorization = async (requiredRole = null) => {
  // First check if we have a token at all
  const token = localStorage.getItem("jstoken");
  if (!token || token === '') {
    console.warn("No authentication token found");
    return false;
  }
  
  // Get the user's role
  const role = await fetchRole();
  console.log("User role for authorization check:", role);
  
  // If no specific role is required, just check if user is authenticated
  if (!requiredRole) {
    return !!role;
  }
  
  // Handle numeric comparison correctly
  if (typeof requiredRole === 'number' && typeof role === 'number') {
    return role === requiredRole;
  }
  
  // Handle string or mixed comparison
  return String(role) === String(requiredRole);
};

// Utility function to check if user is logged in (synchronous, for quick checks)
export const isAuthenticated = () => {
  const token = localStorage.getItem("jstoken");
  return !!token && token !== '';
};

// Utility function to get stored role without an API call
export const getStoredRole = () => {
  // Check specifically for admin role first
  const storedRole = localStorage.getItem("user_role");
  if (storedRole === "1" || storedRole === 1) {
    console.log("Admin role found in localStorage");
    return 1;
  }
  
  // Try to get the role from local storage
  let role = normalizeRole(storedRole);
  
  console.log("Retrieved role from storage:", role);
  
  // If we have a JWT token but no role, try to parse the JWT to get role information
  if (!role && localStorage.getItem("jstoken")) {
    const token = localStorage.getItem("jstoken");
    role = extractRoleFromToken(token);
  }
  
  return role;
};

// Utility function to clear authentication data (for logout)
export const clearAuth = () => {
  localStorage.removeItem("jstoken");
  localStorage.removeItem("user_role");
  localStorage.removeItem("session");
  cachedRole = null;
  cacheTimestamp = 0;
  
  // Trigger storage event to notify other components
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'jstoken',
    newValue: null
  }));
};
