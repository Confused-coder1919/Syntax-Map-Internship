import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useHistory } from "react-router-dom";
import config from "../../../config";
import OtpVerification from "../OtpVerification";
import { useAuth } from "../../../hooks/useAuth";
import { AuthContext } from "../../../Contexts/AuthContext";
import { useContext } from "react";
import {
  LockClosedIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [success, setSuccess] = useState("");
  const history = useHistory();
  const { loading, authChecked, checkUserLoggedIn } = useContext(AuthContext);


  // Use our custom auth hook
  const { login, verifyOtp } = useAuth();

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleRememberMe = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Updated endpoint to match backend API structure
      const response = await fetch(`${config.backendUrl}/user/reset-password`, {
        method: "POST",
        body: JSON.stringify({
          user_email_address: email,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 404) {
          throw new Error("Reset password service is not available");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const res = await response.json();

      if (res.success) {
        setForgotPassword(false);
        setIsSubmitting(false);
        setError("");
        setSuccess("Password reset email sent. Please check your inbox.");
      } else {
        setError(res.msg || "Error sending password reset email. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError("An error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Use our auth hook to handle login
      const result = await login(email, password);

      if (result) {
        console.log("Login successful:", result.user_role);
        await checkUserLoggedIn()
        // Redirect based on user role
        setTimeout(() => {
          switch (result.user_role) {
            case 1: // Admin
              history.push("/admincontrolpanel");
              break;
            case 2: // Teacher
              history.push("/professor");
              break;
            case 3: // Student
              history.push("/dashboard");
              break;
            case 4: // Guest or Notepad User
              history.push("/guest");
            default:
              setIsSubmitting(false);
              break;
          }
        }, 1000);
        setIsSubmitting(false);
      } else {
        // Login failed
        setError(result.error || "Invalid email or password");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Invalid email or password. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification completion
  const handleOtpVerificationComplete = async (success, verificationCode) => {
    if (success) {
      try {
        // Use our auth hook to verify OTP
        const result = await verifyOtp(email, verificationCode);

        if (result.success) {
          await checkUserLoggedIn()
          const userRole = parseInt(localStorage.getItem("user_role"));

          switch (userRole) {
            case 1: // Admin
              history.push("/admincontrolpanel");
              break;
            case 2: // Teacher
              history.push("/professor");
              break;
            case 3: // Student
              history.push("/dashboard");
              break;
            case 4: // Guest or Notepad User
              history.push("/guest");
            default:
              setIsSubmitting(false);
              break;
          }
        } else {
          setNeedsVerification(false);
          setError("Email verification failed. Please try again.");
        }
      } catch (error) {
        setNeedsVerification(false);
        setError("Email verification failed. Please try again.");
      }
    } else {
      // Return to login form if verification fails
      setNeedsVerification(false);
      setError("Email verification failed. Please try again.");
    }
  };

  const renderForgotPasswordForm = () => {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
          >
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={sendPasswordResetEmail}>
          <div>
            <label htmlFor="email-reset" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-reset"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 sm:text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmail}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setForgotPassword(false)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline transition-colors duration-300"
            >
              Back to login
            </button>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2.5 rounded-lg text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </motion.button>
          </div>
        </form>
      </div>
    );
  };

  const renderLoginForm = () => {
    return (
      <div className="w-full max-w-md" style={{ backgroundColor: "white" }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue your learning journey
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md"
          >
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </motion.div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email-address" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 sm:text-sm"
                placeholder="name@example.com"
                value={email}
                onChange={handleEmail}
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none pl-10 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={handlePassword}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="login-remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-200"
                checked={rememberMe}
                onChange={handleRememberMe}
              />
              <label htmlFor="login-remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline transition-colors duration-300"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300`}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </div>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Register now
            </Link>
          </p>
        </div> */}
      </div>
    );
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
          <OtpVerification
            email={email}
            message="Your email needs to be verified before you can log in. Please enter the verification code sent to your email."
            onComplete={handleOtpVerificationComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        {forgotPassword ? renderForgotPasswordForm() : renderLoginForm()}
      </div>
    </div>
  );
};

export default Login;