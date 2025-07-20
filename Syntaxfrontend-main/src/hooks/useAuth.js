import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Custom hook for user authentication
 * Demonstrates how to use the API client for auth operations
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('jstoken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Verify token validity by checking user role
        const roleData = await api.auth.checkRole();
        
        if (roleData && roleData.role) {
          setUser({
            token,
            role: roleData.role,
            lastSession: localStorage.getItem('session')
          });
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('jstoken');
          localStorage.removeItem('user_role');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setError('Session verification failed');
        
        // Clear potentially invalid tokens
        localStorage.removeItem('jstoken');
        localStorage.removeItem('user_role');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.auth.login(email, password);
      
      if (data.jwt) {
        localStorage.setItem('jstoken', data.jwt.token || data.jwt);
        
        if (data.user_role) {
          localStorage.setItem('user_role', data.user_role.toString());
        }
        
        if (data.last_session) {
          localStorage.setItem('session', data.last_session);
        }
        
        setUser({
          token: data.jwt.token || data.jwt,
          role: data.user_role,
          lastSession: data.last_session
        });
        
        return data;
      } else if (data.needsVerification) {
        return { 
          success: false, 
          needsVerification: true,
          email: data.email
        };
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.auth.register(userData);
      return {
        success: true,
        userId: data.userId,
        email: data.email,
        message: data.msg
      };
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verify OTP code
   * @param {string} email - User email
   * @param {string} otpCode - OTP code
   */
  const verifyOtp = useCallback(async (email, otpCode) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.auth.verifyOtp(email, otpCode);
      
      if (data.jwt) {
        localStorage.setItem('jstoken', data.jwt.token || data.jwt);
        
        if (data.user_role) {
          localStorage.setItem('user_role', data.user_role.toString());
        }
        
        if (data.last_session) {
          localStorage.setItem('session', data.last_session);
        }
        
        setUser({
          token: data.jwt.token || data.jwt,
          role: data.user_role,
          lastSession: data.last_session
        });
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Resend OTP code
   * @param {string} email - User email
   */
  const resendOtp = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.auth.resendOtp(email);
      return { success: true, message: data.msg };
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    localStorage.removeItem('jstoken');
    localStorage.removeItem('user_role');
    localStorage.removeItem('session');
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    verifyOtp,
    resendOtp,
    isAuthenticated: !!user
  };
};

export default useAuth;