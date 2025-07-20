import React, { useState, useEffect, useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getStoredRole } from './authority';
import { AuthContext } from './Contexts/AuthContext';

// Protected route component that checks if the user is authorized before allowing access
const ProtectedRoute = ({ component: Component, userTypes = [], ...rest }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, loading, authChecked, checkUserLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for the initial auth check to complete
        if (!authChecked) {
          return;
        }
        
        // If no user, not authorized
        if (!currentUser) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
        
        // Get user role from context or localStorage as fallback
        const userRole = currentUser.role || getStoredRole();
        
        // Check if role is a number
        let normalizedRole;
        if (typeof userRole === 'number') {
          // Role is already numeric
          normalizedRole = userRole;
        } else if (typeof userRole === 'string' && /^\d+$/.test(userRole)) {
          // Role is a numeric string, convert to number
          normalizedRole = parseInt(userRole, 10);
        } else {
          // Role is a string like "admin", "teacher", etc.
          normalizedRole = userRole;
        }
        
        // Check if user role matches any of the allowed types
        if (userTypes.length === 0) {
          // No specific role required, just need to be authenticated
          setIsAuthorized(true);
        } else {
          // For numeric role values
          if (typeof normalizedRole === 'number') {
            const authorized = userTypes.some(type => {
              if (type === 1 || type === "admin") return normalizedRole === 1;
              if (type === 2 || type === "teacher") return normalizedRole === 2;
              if (type === 3 || type === "student") return normalizedRole === 3;
              if (type === 4 || type === "guest") return normalizedRole === 4;
              return false;
            });
            setIsAuthorized(authorized);
          } else {
            // For string role values
            setIsAuthorized(userTypes.includes(normalizedRole));
          }
        }
        
        // Set loading to false after authorization check
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [currentUser, authChecked, userTypes]);
  
  // Handle route access when auth state changes
  useEffect(() => {
    // If we've determined the user is not authorized, try refreshing their auth state
    // This helps in case their token was valid but had network issues on initial load
    if (isAuthorized === false && !loading && authChecked) {
      // Try to revalidate authentication once
      checkUserLoggedIn();
    }
  }, [isAuthorized, loading, authChecked]);

  if (isLoading || !authChecked || loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="ml-2">Loading...</p>
    </div>;
  }

  return (
    <Route
      {...rest}
      render={props => {
        if (isAuthorized) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login_register",
                state: {
                  from: props.location
                }
              }}
            />
          );
        }
      }}
    />
  );
};

export default ProtectedRoute;

