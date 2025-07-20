import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import config, { API_BASE_URL } from "../../config";

/**
 * Modal component that allows users to request role upgrades
 */
const RoleRequestModal = ({ isOpen, onClose }) => {
  const [requestedRole, setRequestedRole] = useState("2"); // Default to Teacher (2)
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingRequest, setExistingRequest] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if user has an existing role request
  useEffect(() => {
    if (isOpen) {
      checkExistingRequest();
    }
  }, [isOpen]);

  const checkExistingRequest = async () => {
    setCheckingStatus(true);
    try {
      const token = localStorage.getItem("jstoken");
      if (!token) {
        setError("You need to be logged in to request a role upgrade");
        setCheckingStatus(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/role-request-status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });

      const data = await response.json();
      
      if (response.ok && data.hasRequest) {
        setExistingRequest(data.request);
      }
    } catch (error) {
      console.error("Error checking role request status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("jstoken");
      if (!token) {
        setError("You need to be logged in to request a role upgrade");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/request-role-upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          requested_role: requestedRole,
          reason: reason
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.msg || "Your request has been submitted successfully");
        setReason("");
        // Check for the latest request status
        checkExistingRequest();
      } else {
        setError(data.msg || "Failed to submit your request");
      }
    } catch (error) {
      console.error("Error submitting role request:", error);
      setError("An error occurred while submitting your request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Format date for better readability
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get status badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  // Map role number to readable role name
  const getRoleName = (roleNumber) => {
    switch (parseInt(roleNumber)) {
      case 1: return "Admin";
      case 2: return "Teacher";
      case 3: return "Student";
      case 4: return "Guest";
      default: return "Unknown";
    }
  };

  // Render the existing request status view
  const renderExistingRequestView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Role Request</h3>
          {existingRequest.status === "pending" && (
            <button
              onClick={checkExistingRequest}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Refresh
            </button>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(existingRequest.status)}</div>
            </div>
            <div>
              <p className="text-gray-500">Requested Role</p>
              <p className="font-medium">{getRoleName(existingRequest.requested_role)}</p>
            </div>
            <div>
              <p className="text-gray-500">Current Role</p>
              <p className="font-medium">{getRoleName(existingRequest.current_role)}</p>
            </div>
            <div>
              <p className="text-gray-500">Submitted</p>
              <p className="font-medium">{formatDate(existingRequest.created_at)}</p>
            </div>
            {existingRequest.updated_at && (
              <div className="col-span-2">
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium">{formatDate(existingRequest.updated_at)}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-gray-500">Reason</p>
              <p className="italic mt-1">{existingRequest.reason}</p>
            </div>
            {existingRequest.admin_note && (
              <div className="col-span-2 border-t pt-2 mt-2">
                <p className="text-gray-500">Admin Note</p>
                <p className="italic mt-1">{existingRequest.admin_note}</p>
              </div>
            )}
          </div>
        </div>

        {existingRequest.status === "rejected" && (
          <div className="mt-4">
            <button
              onClick={() => setExistingRequest(null)}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Submit New Request
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render the new request form
  const renderRequestForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="requestedRole" className="block text-sm font-medium text-gray-700">
            Requested Role
          </label>
          <select
            id="requestedRole"
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            <option value="2">Teacher</option>
            <option value="3">Student</option>
          </select>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for Request
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
            placeholder="Please explain why you are requesting this role upgrade..."
            required
            minLength={10}
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-500">
            {reason.length}/500 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-indigo-700 text-white flex justify-between items-center">
                <h3 className="text-lg font-semibold">Role Upgrade Request</h3>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition duration-150"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {checkingStatus ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="animate-spin h-8 w-8 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : existingRequest && existingRequest.status !== "rejected" ? (
                  // Show existing request status
                  renderExistingRequestView()
                ) : (
                  // Show new request form
                  renderRequestForm()
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RoleRequestModal;