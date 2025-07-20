import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChatAlt2Icon, 
  MailIcon, 
  PhoneIcon,
  LocationMarkerIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from "@heroicons/react/outline";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const contactTypes = [
    { id: "general", label: "General Inquiry", icon: <ChatAlt2Icon className="h-4 w-4" /> },
    { id: "technical", label: "Technical Support", icon: <ChatAlt2Icon className="h-4 w-4" /> },
    { id: "billing", label: "Billing Question", icon: <ChatAlt2Icon className="h-4 w-4" /> },
    { id: "feedback", label: "Feedback", icon: <ChatAlt2Icon className="h-4 w-4" /> },
    { id: "bug", label: "Report a Bug", icon: <ChatAlt2Icon className="h-4 w-4" /> },
  ];

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message is too short (minimum 10 characters)";
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

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type
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
          name: "",
          email: "",
          subject: "",
          message: "",
          type: "general"
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmitError("An error occurred while sending your message. Please try again later.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or need assistance? Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-sm border border-green-100 p-8 text-center"
                >
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
                  <p className="text-gray-600 mb-6">
                    Your message has been sent successfully. Our team will review it and get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                  
                  {submitError && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-sm text-red-700">{submitError}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    {/* Contact Type Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        What can we help you with?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {contactTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => handleTypeChange(type.id)}
                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              formData.type === type.id
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                            }`}
                          >
                            <span className="mr-1.5">{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      {/* Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>
                      
                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
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
                          placeholder="john.doe@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Subject Field */}
                    <div className="mb-6">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.subject ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Brief description of your inquiry"
                      />
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                      )}
                    </div>
                    
                    {/* Message Field */}
                    <div className="mb-6">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className={`block w-full px-4 py-3 border rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.message ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Please provide details about your inquiry..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                      )}
                    </div>
                    
                    {/* Submit Button */}
                    <div>
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
                            Sending...
                          </span>
                        ) : (
                          "Send Message"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <MailIcon className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      <p className="mt-1 text-gray-600">
                        <a href="mailto:support@syntaxmap.com" className="text-orange-600 hover:text-orange-800">support@syntaxmap.com</a>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">24-hour response time</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <PhoneIcon className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                      <p className="mt-1 text-gray-600">
                        <a href="tel:+18005551234" className="text-orange-600 hover:text-orange-800">+1 (800) 555-1234</a>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">Mon-Fri, 9am-5pm EST</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <LocationMarkerIcon className="h-5 w-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Office</h3>
                      <p className="mt-1 text-gray-600">
                        123 Learning Lane<br />
                        Suite 500<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white p-8">
                <h3 className="text-xl font-bold mb-4">Live Chat Support</h3>
                <p className="mb-6 text-orange-50">
                  Need immediate assistance? Connect with our support team through live chat.
                </p>
                <button className="w-full px-4 py-3 border border-white text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-600 focus:ring-white">
                  Start Live Chat
                </button>
                <p className="mt-3 text-sm text-orange-100 text-center">
                  Available Monday - Friday, 9am - 5pm EST
                </p>
              </div>
            </div>
          </div>
          
          {/* FAQ Preview */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Find quick answers to common questions about SyntaxMap's features, account management, and more.
            </p>
            <a 
              href="/faq" 
              className="inline-flex items-center px-6 py-3 border border-orange-600 rounded-md shadow-sm text-base font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Visit our FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;