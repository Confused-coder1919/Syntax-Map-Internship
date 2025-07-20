import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaceSmileIcon as EmojiHappyIcon,
  FaceFrownIcon as EmojiSadIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  HandThumbUpIcon as ThumbUpIcon,
  HandThumbDownIcon as ThumbDownIcon,
  LightBulbIcon,
  ExclamationTriangleIcon as ExclamationIcon,
  TagIcon
} from "@heroicons/react/24/outline";


const Feedback = () => {
  const [formData, setFormData] = useState({
    type: "",
    rating: 0,
    comment: "",
    email: "",
    tags: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  const feedbackTypes = [
    { id: "general", label: "General Feedback", icon: <LightBulbIcon className="h-5 w-5" /> },
    { id: "bug", label: "Report a Bug", icon: <ExclamationIcon className="h-5 w-5" /> },
    { id: "feature", label: "Feature Request", icon: <ThumbUpIcon className="h-5 w-5" /> },
    { id: "content", label: "Content Improvement", icon: <TagIcon className="h-5 w-5" /> }
  ];
  
  const availableTags = [
    "UI/UX", "Performance", "Mobile App", "Exercises", "Grammar Map", 
    "Progress Tracking", "Account", "Subscription", "Language Content"
  ];
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.type) {
      newErrors.type = "Please select a feedback type";
    }
    
    if (formData.rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    
    if (!formData.comment.trim()) {
      newErrors.comment = "Please provide some details";
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = "Your feedback is too short (minimum 10 characters)";
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleTypeSelect = (type) => {
    setFormData({
      ...formData,
      type
    });
    
    if (errors.type) {
      setErrors({
        ...errors,
        type: ""
      });
    }
  };

  const handleRatingSelect = (rating) => {
    setFormData({
      ...formData,
      rating
    });
    
    if (errors.rating) {
      setErrors({
        ...errors,
        rating: ""
      });
    }
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) {
        return {
          ...prev,
          tags: prev.tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...prev.tags, tag]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      setIsSubmitting(true);
      setSubmitError("");
      
      // Simulate API request
      try {
        // Replace with actual API call in production
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          type: "",
          rating: 0,
          comment: "",
          email: "",
          tags: []
        });
      } catch (error) {
        console.error("Error submitting feedback:", error);
        setSubmitError("An error occurred while sending your feedback. Please try again later.");
        setIsSubmitting(false);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Feedback Matters</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us improve SyntaxMap by sharing your thoughts, suggestions, or reporting issues.
            Your feedback directly influences our development roadmap.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center"
            >
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You For Your Feedback!</h2>
              <p className="text-gray-600 mb-6">
                Your insights help us improve SyntaxMap for everyone. We've recorded your feedback and our team will review it.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
              >
                Submit Another Feedback
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible" 
              className="bg-white rounded-xl shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Feedback</h2>
              
              {submitError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{submitError}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Feedback Type */}
                <motion.div variants={itemVariants} className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of feedback would you like to share? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {feedbackTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleTypeSelect(type.id)}
                        className={`flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                          formData.type === type.id
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                  {errors.type && (
                    <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                  )}
                </motion.div>
                
                {/* Rating */}
                <motion.div variants={itemVariants} className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you rate your experience with SyntaxMap? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleRatingSelect(rating)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            formData.rating >= rating
                              ? 'bg-orange-100 text-orange-500'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          aria-label={`Rate ${rating} out of 5`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={formData.rating >= rating ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={formData.rating >= rating ? 0 : 1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="ml-4 flex items-center text-gray-500">
                      {formData.rating > 0 && (
                        <>
                          {formData.rating <= 2 ? (
                            <EmojiSadIcon className="h-6 w-6 text-orange-500 mr-2" />
                          ) : (
                            <EmojiHappyIcon className="h-6 w-6 text-orange-500 mr-2" />
                          )}
                          <span>
                            {formData.rating <= 2 
                              ? "We'll do better" 
                              : formData.rating === 3 
                                ? "It's okay" 
                                : "Thank you!"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.rating && (
                    <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
                  )}
                </motion.div>
                
                {/* Tags */}
                <motion.div variants={itemVariants} className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What aspects of SyntaxMap does your feedback relate to? <span className="text-gray-500">(Optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
                
                {/* Comment */}
                <motion.div variants={itemVariants} className="mb-8">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={6}
                    value={formData.comment}
                    onChange={handleChange}
                    placeholder="Please share your thoughts, suggestions, or report an issue in detail..."
                    className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.comment ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.comment ? (
                    <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.comment.length}/1000 characters
                    </p>
                  )}
                </motion.div>
                
                {/* Email (Optional) */}
                <motion.div variants={itemVariants} className="mb-8">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="We'll contact you if we need more information"
                  />
                  {errors.email ? (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      We'll never share your email with anyone else
                    </p>
                  )}
                </motion.div>
                
                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                      isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          )}
          
          {/* User Voice Banner */}
          <div className="mt-10 bg-gray-900 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Join Our User Voice Program</h3>
                <p className="text-gray-300">
                  Get early access to new features and help shape the future of SyntaxMap.
                </p>
              </div>
              <button className="mt-4 md:mt-0 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;