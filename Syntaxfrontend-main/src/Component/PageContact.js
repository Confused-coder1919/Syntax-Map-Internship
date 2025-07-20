import React, { useState } from "react";
import config from "../config";

const PageContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(prevStatus => ({ ...prevStatus, submitting: true }));

    try {
      // Get the backend URL from config
      const backendUrl = config.backendUrl || "http://localhost:8000";
      
      console.log(`Sending contact form to: ${backendUrl}/contact`);
      
      // Try to send the actual request to the backend
      const res = await fetch(`${backendUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      let data;
      
      // Safely parse the JSON response, handling cases where HTML might be returned instead
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // If we got a non-JSON response (like HTML), create a fallback response object
        console.warn('Received non-JSON response from server');
        data = { 
          success: false,
          msg: res.ok 
            ? "Message sent successfully, but received unexpected response format." 
            : `Server error: ${res.status} ${res.statusText}`
        };
      }
      
      // For now, let's handle both deployed and local responses
      if (res.ok) {
        // If the server response was ok, consider it a success regardless of response format
        setStatus({
          submitted: true,
          submitting: false,
          info: { error: false, msg: data.msg || "Thank you for your message. We'll get back to you soon!" }
        });
        
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        });
      } else {
        // Handle server errors with appropriate messaging
        console.error("Server error response:", data);
        setStatus({
          submitted: false,
          submitting: false,
          info: { 
            error: true, 
            msg: data.msg || `Error ${res.status}: Failed to send message. Please try again later.` 
          }
        });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      
      // Show a friendly error message to the user
      setStatus({
        submitted: false,
        submitting: false,
        info: { 
          error: true, 
          msg: "Network error while contacting server. Please check your internet connection and try again."
        }
      });
    }
  };

  // For development/testing: Let users know if they're using the production backend
  const isUsingProductionBackend = config.backendUrl?.includes('render.com');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Contact Us</h1>
        
        {isUsingProductionBackend && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-100 rounded text-center text-sm">
            <span className="font-medium">Note:</span> Using production backend - {config.backendUrl}
          </div>
        )}
        
        <div className="mb-10 text-center">
          <p className="text-gray-600 mb-4">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <div className="flex justify-center space-x-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">support@syntaxmap.com</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
        
        {status.submitted ? (
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
            <p className="text-green-600">{status.info.msg}</p>
            <button 
              onClick={() => setStatus(prevStatus => ({ ...prevStatus, submitted: false }))}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="johndoe@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How can we help you?"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
                required
              ></textarea>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={status.submitting}
                className={`px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 ${
                  status.submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {status.submitting ? "Sending..." : "Send Message"}
              </button>
              
              {status.info.error && (
                <div className="mt-4 text-red-500">
                  {status.info.msg}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PageContact;