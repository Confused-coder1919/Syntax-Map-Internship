import React, { useState, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../../Contexts/AuthContext";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import OtpVerification from "../OtpVerification";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [activationMessage, setActivationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const { register, verifyOtp, resendOtp } = useContext(AuthContext);
  const history = useHistory();

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e) => {
    const password = e.target.value;

    // Check password strength
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Calculate strength score (0-4)
    const criteria = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar];
    const score = criteria.filter(Boolean).length;

    setPassword(password);
    setPasswordStrength({
      score,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Form validation
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const userData = {
        user_name: username,
        user_email_address: email,
        user_password: password,
      };

      const result = await register(userData);

      if (result.success) {
        // Registration successful - show OTP verification
        setIsSubmitting(false);
        setShowOtpVerification(true);
        setError("");
        setActivationMessage(result.message || "Please verify your email to complete registration.");
      } else {
        // Registration failed
        setIsSubmitting(false);
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      setError(error.message || "An error occurred during registration. Please try again.");
    }
  };

  // Handle OTP verification completion
  const handleOtpVerificationComplete = async (success, verificationCode) => {
    if (success) {
      try {
        // Use our auth hook's verifyOtp function
        const result = await verifyOtp(email, verificationCode);

        if (result) {
          // Navigate based on user role
          if (result.user_role === 1) { // Admin
            history.push("/admincontrolpanel");
          } else if (result.user_role === 2) { // Teacher
            history.push("/professor");
          } else if (result.user_role === 3) { // Teacher
            history.push("/dashboard");
          } else { // Student or default
            history.push("/");
          }
        } else {
          setShowOtpVerification(false);
          setError("Email verification failed. Please try again.");
        }
      } catch (error) {
        setShowOtpVerification(false);
        setError("Email verification failed. Please try again.");
      }
    } else {
      // Return to registration form if verification fails
      setShowOtpVerification(false);
      setError("Email verification failed. Please register again.");
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await resendOtp(email);
      console.log("Resend OTP result:", result);
      return result;
    } catch (error) {
      console.log("Resend OTP error:", error);
      return { success: false, error: error.message };
    }
  };

  const renderPasswordStrengthMeter = () => {
    const { score } = passwordStrength;

    // Define colors for different strength levels
    const colors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    return (
      <div className="mt-1">
        <div className="flex gap-1 mb-1" style={{fontSize:"4px"}}>
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1 w-1/4 rounded-sm transition-colors duration-300 ${level <= score ? colors[score] : 'bg-gray-200'}`}
            />
          ))}
        </div>
        {score > 0 && (
          <p className={`text-xs ${score === 1 ? 'text-red-600' : score === 2 ? 'text-orange-600' : score === 3 ? 'text-yellow-600' : 'text-green-600'}`} style={{fontSize:"12px"}}>
            {labels[score]}
          </p>
        )}
      </div>
    );
  };

  const renderPasswordCriteria = () => {
    const criteriaItems = [
      { key: 'hasMinLength', text: 'At least 8 characters' },
      { key: 'hasUppercase', text: 'At least one uppercase letter' },
      { key: 'hasLowercase', text: 'At least one lowercase letter' },
      { key: 'hasNumber', text: 'At least one number' },
      { key: 'hasSpecialChar', text: 'At least one special character' },
    ];

    return (
      <div className="mt-2 space-y-1">
        {criteriaItems.map(item => (
          <div key={item.key} className="flex items-center">
            {passwordStrength[item.key] ? (
              <CheckBadgeIcon className="h-3.5 w-3.5 text-green-500 mr-1.5" />
            ) : (
              <div className="h-3.5 w-3.5 border border-gray-300 rounded-full mr-1.5" />
            )}
            <span className={`text-xs ${passwordStrength[item.key] ? 'text-green-700' : 'text-gray-500'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderRegistrationForm = () => {
    // Animation variants
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          when: "beforeChildren",
          staggerChildren: 0.1
        }
      }
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      }
    };

    return (
      <div className="w-full max-w-md" >
        <div className="text-center mb-4">
          <p className="mt-1 text-sm text-gray-600">
            Create an account to start your language learning journey
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

        <motion.form
          className="space-y-5"
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none pl-10 block w-full px-2 py-2 border ${focusedField === 'username' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 sm:text-sm`}
                placeholder="John Doe"
                onChange={handleUsername}
                value={username}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none pl-10 block w-full px-2 py-2 border ${focusedField === 'email' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 sm:text-sm`}
                placeholder="name@example.com"
                onChange={handleEmail}
                value={email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none pl-10 block w-full px-2 py-2 border ${focusedField === 'password' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 sm:text-sm`}
                placeholder="••••••••"
                onChange={handlePassword}
                value={password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            {password && renderPasswordStrengthMeter()}
            {focusedField === 'password' && password && renderPasswordCriteria()}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none pl-10 block w-full px-2 py-2 border ${focusedField === 'confirmPassword' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 sm:text-sm`}
                placeholder="••••••••"
                onChange={handleConfirmPassword}
                value={confirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              {confirmPassword && password === confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="pt-1">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300`}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  };

  if (showOtpVerification) {
    return (
          <OtpVerification
            email={email}
            message={activationMessage}
            onComplete={handleOtpVerificationComplete}
            onResendOtp={handleResendOtp}
          />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        {renderRegistrationForm()}
      </div>
    </div>
  );
};

export default Register;