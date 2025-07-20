import React, { useState } from "react";
import logo from "../../img/LC-1.jpg";
import { useAuth } from "../../hooks/useAuth";

const OtpVerification = ({ email, onComplete, message, onResendOtp }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Use our auth hook
  const { verifyOtp } = useAuth();
  
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value !== "" && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value !== "" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };
  
  const handleKeyDown = (index, e) => {
    // Handle backspace - move to previous input
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    
    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Use our auth hook's verifyOtp function
      const result = await verifyOtp(email, otpCode);

      if (result) {
        setSuccess("Email verified successfully!");
        
        // Wait a bit to show success message before completing
        setTimeout(() => {
          if (onComplete) onComplete(true, otpCode);
        }, 1500);
      } else {
        setError(result.error || "Failed to verify email. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendOtp = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      // Use the onResendOtp function passed from the parent component
      if (onResendOtp) {
        const result = await onResendOtp();
        if (result) {
          setSuccess("Verification code sent! Please check your email.");
        } else {
          setError(result.error || "Failed to resend verification code.");
        }
      } else {
        setError("Cannot resend verification code at this time.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <img className="mx-auto h-24 w-auto" src={logo} alt="SyntaxMap Logo" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            {message || "Please enter the verification code sent to your email"}
          </p>
          <p className="font-medium text-indigo-600">{email}</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="flex items-center justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-8 h-8 text-center text-xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isSubmitting}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
            >
              Resend code
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;