// Configuration file for API endpoints

// Check if we're running locally by examining the hostname
// const isLocalHost = 
//   window.location.hostname === 'localhost' || 
//   window.location.hostname === '127.0.0.1';

  const isLocalHost = false

// Create a singleton configuration
const config = {
  // Backend API URL with fallback mechanism
  // In development or localhost, try local backend first, with production as fallback
  backendUrl: isLocalHost 
    ? 'http://localhost:8000' 
    : 'https://syntaxbackend.onrender.com',
  
  // Production backend URL (used as fallback)
  prodBackendUrl: 'https://syntaxbackend.onrender.com',
  
  // Keep track of whether we're using fallback
  usingFallbackBackend: false,
  
  // Flag to track if we've already checked backend availability
  hasCheckedBackend: false,
  
  // Flag to reduce console warnings
  hasWarnedAboutBackend: false,
  
  // Frontend URL
  frontendUrl: isLocalHost
    ? 'http://localhost:3000'
    : 'https://syntaxfrontend.vercel.app',
    
  // Other API configurations can be added here
  dictionaryApi: 'https://api.dictionaryapi.dev/api/v2/entries/en/'
};

// Helper function to check if the local backend is available
export const checkBackendAvailability = async () => {
  // If we've already checked or we're not on localhost, don't check again
  if (config.hasCheckedBackend || !isLocalHost) {
    return config.usingFallbackBackend ? false : true;
  }
  
  try {
    // Try to reach the local backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // Reduced timeout for faster feedback
    
    const response = await fetch(`${config.backendUrl}/health-check`, { 
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    config.hasCheckedBackend = true;
    return response.ok;
  } catch (error) {
    // Only warn once
    if (!config.hasWarnedAboutBackend) {
      console.warn('Local backend not available, using production instead');
      config.hasWarnedAboutBackend = true;
    }
    
    // Update config to use production backend
    config.backendUrl = config.prodBackendUrl;
    config.usingFallbackBackend = true;
    config.hasCheckedBackend = true;
    return false;
  }
};

// Enhanced function to get backend URL with automatic fallback
export const getBackendUrl = async () => {
  // If not on localhost or already using fallback, return current backendUrl immediately
  if (!isLocalHost || config.usingFallbackBackend) {
    return config.backendUrl;
  }

  // If we've already checked backend availability, use the current setting
  if (config.hasCheckedBackend) {
    return config.backendUrl;
  }
  
  // Try local first, then fallback to production if needed
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // Reduced timeout for faster feedback
    
    await fetch(`${config.backendUrl}/health-check`, { 
      signal: controller.signal,
      method: 'HEAD'
    });
    
    clearTimeout(timeoutId);
    config.hasCheckedBackend = true;
    return config.backendUrl;
  } catch (error) {
    // Only warn once
    if (!config.hasWarnedAboutBackend) {
      console.warn('Local backend connection failed, using production backend');
      config.hasWarnedAboutBackend = true;
    }
    
    config.backendUrl = config.prodBackendUrl;
    config.usingFallbackBackend = true;
    config.hasCheckedBackend = true;
    return config.prodBackendUrl;
  }
};

// Export a synchronous URL getter that doesn't do availability checking
// Use this for non-critical UI elements where an async function would be inconvenient
export const getCurrentBackendUrl = () => {
  // If already using fallback or already checked, return current URL
  if (config.usingFallbackBackend || config.hasCheckedBackend) {
    return config.backendUrl;
  }
  
  // If on localhost but haven't checked yet, we'll assume we need production
  // This avoids UI glitches while the async check is happening
  if (isLocalHost) {
    return config.prodBackendUrl;
  }
  
  // Otherwise return the configured URL
  return config.backendUrl;
};

// Try to verify backend availability when loaded
// Use setTimeout to avoid blocking the initial render
if (isLocalHost) {
  setTimeout(() => {
    checkBackendAvailability().then(isAvailable => {
      if (!isAvailable) {
        // This runs after the initial check, so we don't need to log again
        config.backendUrl = config.prodBackendUrl;
        config.usingFallbackBackend = true;
      }
    });
  }, 0);
}

export default config;

// API URL Configuration - Use the same dynamic backend URL as the rest of the app
export const API_BASE_URL = isLocalHost 
  ? 'http://localhost:8000' 
  : 'https://syntaxbackend.onrender.com';
// export const API_BASE_URL = "https://flying-raven-gladly.ngrok-free.app"

// Other app-wide configurations
export const APP_NAME = 'SyntaxMap';
export const APP_VERSION = '1.0.0';

// Routes configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PASSWORD_RECOVERY: '/password-recovery',
  PROFILE: '/profile',
  TENSES: '/tenses',
  TENSE_DETAILS: '/tenses/:id',
  PRACTICE: '/practice',
  QUIZ: '/quiz',
  RESOURCES: '/resources',
  PROGRESS: '/progress',
  NOTIFICATIONS: '/notifications',
  NOT_FOUND: '*'
};