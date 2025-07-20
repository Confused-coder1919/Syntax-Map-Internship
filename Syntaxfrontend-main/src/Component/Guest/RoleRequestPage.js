import React, { useState } from 'react';
import GuestLayout from './GuestLayout';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../config';

const RoleRequestPage = () => {
  const [formData, setFormData] = useState({
    requestedRole: '3', // Default to student (3)
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the user's token from localStorage
      const token = localStorage.getItem("jstoken");
      
      if (!token) {
        setSubmitStatus({
          success: false,
          message: "Authentication error. Please try logging out and back in."
        });
        return;
      }
      
      // Make the API request to request a role upgrade
      const response = await fetch(`${API_BASE_URL}/user/request-role-upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          requested_role: parseInt(formData.requestedRole),
          reason: formData.reason
        })
      });
      
      const data = await response.json();
      setFormData({
        requestedRole: '3', // Reset to default after submission
        reason: ''
      });
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: data.msg || "Your role upgrade request has been submitted successfully. An administrator will review your request."
        });
        
      } else {
        throw new Error(data.msg || "Failed to submit request");
      }
      
    } catch (error) {
      console.error('Error submitting role request:', error);
      setSubmitStatus({
        success: false,
        message: error.message || "There was an error submitting your request. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GuestLayout title="Request Role Upgrade">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Request Access as Student or Teacher</h2>
          <p className="mt-2 text-gray-600">
            Fill out this form to request an upgraded role in SyntaxMap. Your request will be reviewed by an administrator.
          </p>
        </div>

        {submitStatus && (
          <div className={`p-4 mb-6 rounded-md ${submitStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <p>{submitStatus.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="requestedRole" className="block text-sm font-medium text-gray-700">
              Requested Role
            </label>
            <select
              name="requestedRole"
              id="requestedRole"
              required
              value={formData.requestedRole}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="3">Student</option>
              <option value="2">Teacher</option>
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              Reason for Request
            </label>
            <textarea
              name="reason"
              id="reason"
              rows={4}
              required
              value={formData.reason}
              onChange={handleChange}
              placeholder={formData.requestedRole === '2' 
                ? "Please explain your teaching background and why you'd like teacher access..." 
                : "Please explain why you're interested in becoming a student..."}
              className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  Submit Request 
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </GuestLayout>
  );
};

export default RoleRequestPage;
