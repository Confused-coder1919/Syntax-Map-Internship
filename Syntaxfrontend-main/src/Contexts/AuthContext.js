import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getCurrentBackendUrl, getBackendUrl } from '../config';
import { getStoredRole } from '../authority'; // Update to only import exported functions

// Create the authentication context
export const AuthContext = createContext();

// Helper function to extract role from JWT token (copied from authority.js since it's not exported)
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
      payload.authorization ||
      (payload.sub && payload.sub.user_role);

    // Normalize role - if it's a string with only digits, convert to number
    if (typeof role === 'string' && /^\d+$/.test(role)) {
      return parseInt(role, 10);
    }
    return role;
  } catch (error) {
    console.error("Error extracting role from token:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendUrl, setBackendUrl] = useState(getCurrentBackendUrl());
  const [authChecked, setAuthChecked] = useState(false); // Flag to track if auth check has completed

  // Initialize the backend URL
  useEffect(() => {
    const initBackend = async () => {
      const url = await getBackendUrl();
      setBackendUrl(url);
    };
    initBackend();
  }, []);

  // Listen for storage changes (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'jstoken') {
        if (!e.newValue) {
          // Token was removed in another tab
          setCurrentUser(null);
        } else if (!localStorage.getItem('jstoken')) {
          // Token was added in another tab
          checkUserLoggedIn();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check if the user is logged in
  const checkUserLoggedIn = async (skipApiCall = false) => {
    try {
      const token = localStorage.getItem('jstoken');
      const userRole = localStorage.getItem('user_role');

      // If no token exists, user is not logged in
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // First try to create a user object from local storage
      // This ensures we have something even if network calls fail
      const localUserData = {
        role: userRole ? parseInt(userRole, 10) : null,
        token: token,
        lastSession: localStorage.getItem('session')
      };

      // Set user from local storage immediately to prevent flickering
      setCurrentUser(localUserData);

      // Skip API validation if requested (during development or for performance)
      if (skipApiCall) {
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // Validate token with server (with retry and timeout)
      try {
        const url = await getBackendUrl();
        setBackendUrl(url);

        // Make request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout

        const response = await axios.get(`${url}/user/me`, {
          headers: {
            Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle successful response
        if (response.data) {
          // Different APIs might have different response structures
          // Check for both formats
          if (response.data.success && response.data.user) {
            // Format: { success: true, user: {...} }
            setCurrentUser({
              ...response.data.user,
              token: token
            });

            // Update localStorage with fresh data
            if (response.data.user.user_role) {
              localStorage.setItem('user_role', response.data.user.user_role.toString());
            }
          } else if (response.data.user_id) {
            // Format: { user_id: "...", user_name: "...", etc }
            setCurrentUser({
              ...response.data,
              token: token
            });

            // Update localStorage with fresh data
            if (response.data.user_role) {
              localStorage.setItem('user_role', response.data.user_role.toString());
            }
          }
          // Keep the user logged in even if response format isn't recognized
        }
      } catch (reqError) {
        console.warn("API validation failed, using local token data:", reqError);

        // Don't log out the user on network errors - the token might still be valid
        // Only clear authentication if the server explicitly rejects the token
        if (reqError.response && reqError.response.status === 401) {
          localStorage.removeItem('jstoken');
          localStorage.removeItem('user_role');
          localStorage.removeItem('session');
          setCurrentUser(null);
        } else {
          // For network errors or timeouts, keep the user logged in with local data
          // We already set currentUser from localStorage above
        }
      }
    } catch (err) {
      console.error("Auth verification error:", err);

      // Try to extract role from token as a last resort
      const token = localStorage.getItem('jstoken');
      if (token) {
        try {
          const role = extractRoleFromToken(token);
          if (role) {
            setCurrentUser({
              role: role,
              token: token
            });
          }
        } catch (tokenErr) {
          console.error("Failed to parse token:", tokenErr);
        }
      }
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  // Run auth check when component mounts
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Login function with retry logic
  const login = async (user_email_address, user_password) => {
    try {
      setLoading(true);

      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);

      const response = await axios.post(`${url}/user/login`, {
        user_email_address,
        user_password
      });

      const data = response.data;

      if (data.jwt) {
        localStorage.setItem('jstoken', data.jwt.token || data.jwt);

        if (data.user_role) {
          localStorage.setItem('user_role', data.user_role.toString());
        }

        if (data.last_session) {
          localStorage.setItem('session', data.last_session);
        }

        setCurrentUser({
          role: data.user_role,
          token: data.jwt.token || data.jwt,
          user_name: data.user_name,
          user_id: data.user_id
        });
        setError(null);

        return {
          success: true,
          user_role: data.user_role
        };
      } else if (data.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          email: data.email
        };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Special handling for network errors
      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
        return {
          success: false,
          error: "Cannot connect to server. Please check your internet connection or try again later."
        };
      }

      setError(err.response?.data?.msg || err.message || "Login failed. Please try again.");
      return {
        success: false,
        error: err.response?.data?.msg || err.message || "Login failed"
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function with improved error handling
  const register = async (userData) => {
    try {
      setLoading(true);

      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);

      const response = await axios.post(`${url}/user/register`, userData);
      console.log('Registration response:', response.data);
      return { success: true, message: response.data.msg };
    } catch (err) {
      if (err.response && err.response.status === 409) {
        try {
          await resendOtp(userData.user_email_address);
          return { success: true, message: "User already exists. OTP has been sent to your email." };
        }
        catch (otpErr) {
          return { success: false, message: otpErr.response?.data?.message || "Failed to send OTP" };
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection or try again later."
        };
      }
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  async function resendOtp(userEmail) {
    try {
      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);

      const response = await fetch(`${url}/user/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email_address: userEmail,
        }),
      });
      const data = await response.json();
      console.log('OTP resend success:', data);
      return data;
    } catch (error) {
      console.error('OTP resend failed:', error.message);
      throw error;  // Re-throw to allow proper error handling in calling function
    }
  }

  async function verifyOtp(userEmail, otpCode) {
    try {
      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);

      const response = await axios.post(`${url}/user/verify-otp/`, {
        user_email_address: userEmail,
        otp_code: otpCode,
      });

      const data = response.data;
      console.log('OTP verification success:', data);

      // Store JWT token correctly
      localStorage.setItem('jstoken', data.jwt?.token || data.jwt);

      // Store user role if available
      if (data.user_role) {
        localStorage.setItem('user_role', data.user_role.toString());
      }

      // Store session if provided
      if (data.last_session) {
        localStorage.setItem('session', data.last_session);
      }

      // Update current user state
      setCurrentUser({
        role: data.user_role,
        token: data.jwt?.token || data.jwt,
        user_name: data.user_name,
        user_id: data.user_id
      });

      setError(null);
      return data;
    } catch (error) {
      console.error('OTP verification failed:', error.message);

      if (error.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
      }

      return null;
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('jstoken');
    localStorage.removeItem('user_role');
    localStorage.removeItem('session');
    setCurrentUser(null);
  };

  // Password recovery function
  const recoverPassword = async (email) => {
    try {
      setLoading(true);

      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);

      const response = await axios.post(`${url}/user/reset-password`, { user_email_address: email });

      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        setError(response.data.message || "Password recovery failed");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Password recovery error:", err);

      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection or try again later."
        };
      }

      setError(err.response?.data?.message || "Password recovery failed. Please try again.");
      return { success: false, message: err.response?.data?.message || "Password recovery failed" };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    console.log(token, password);
    try {
      setLoading(true);

      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);
      const data={
        "token": token,
        "user_password": password
      }
      const response = await axios.post(`${url}/user/resetpassword/`,data );

      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        setError(response.data.message || "Password reset failed");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Password reset error:", err);

      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection or try again later."
        };
      }

      setError(err.response?.data?.message || "Password reset failed. Please try again.");
      return { success: false, message: err.response?.data?.message || "Password reset failed" };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile function
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jstoken');

      // Get the latest backend URL
      const url = await getBackendUrl();
      setBackendUrl(url);

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.put(`${url}/users/profile`, userData, {
        headers: {
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        setCurrentUser({ ...currentUser, ...userData });
        return { success: true, message: response.data.message };
      } else {
        setError(response.data.message || "Profile update failed");
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      console.error("Profile update error:", err);

      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check your internet connection or try again later.");
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection or try again later."
        };
      }

      setError(err.response?.data?.message || "Profile update failed. Please try again.");
      return { success: false, message: err.response?.data?.message || "Profile update failed" };
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided to consumers of this context
  const value = {
    currentUser,
    loading,
    error,
    login,
    resendOtp,
    register,
    logout,
    recoverPassword,
    resetPassword,
    updateProfile,
    verifyOtp,
    backendUrl,
    checkUserLoggedIn,  // Expose this function to allow manual auth checks
    isAuthenticated: !!currentUser, // Convenience boolean
    authChecked        // Flag to indicate auth check has completed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};