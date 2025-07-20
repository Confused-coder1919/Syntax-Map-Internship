import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import config from "../../config";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const AdminRoleRequests = () => {
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  // Role mapping for display
  const roleMap = {
    1: "Admin",
    2: "Teacher",
    3: "Student",
    4: "Guest",
  };

  // Fetch role requests on component mount
  useEffect(() => {
    fetchRoleRequests();
  }, [filterStatus]);

  const fetchRoleRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem("jstoken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Prepare authorization header
      const authHeader = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // Fetch role requests from API
      const response = await fetch(
        `${config.backendUrl}/admin/role-requests?status=${filterStatus}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch role requests: ${response.status}`);
      }

      const data = await response.json();
      setRoleRequests(data.requests || []);
    } catch (err) {
      console.error("Error fetching role requests:", err);
      setError(err.message || "Failed to load role requests");
    } finally {
      setLoading(false);
    }
  };

  // Process a role request (approve or reject)
  const processRequest = async (requestId, approved, notes) => {
    try {
      setLoading(true);

      // Get token from localStorage
      const token = localStorage.getItem("jstoken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Prepare authorization header
      const authHeader = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      // Update the role request status
      const response = await fetch(
        `${config.backendUrl}/admin/role-requests/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            status: approved ? "approved" : "rejected",
            admin_notes: notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to process request: ${response.status}`);
      }
      fetchRoleRequests();
      // Update the local state


      // Show success message
      toast.success(
        `Request ${approved ? "approved" : "rejected"} successfully`
      );

      // If we approved, update user's role directly if possible
      if (approved && selectedRequest) {
        await updateUserRole(selectedRequest.user_id, selectedRequest.requested_role);
      }

      // Close the modal
      setShowModal(false);
    } catch (err) {
      console.error("Error processing role request:", err);
      toast.error(err.message || "Failed to process request");
      
      // For demo purposes, update the UI anyway in development
      if (process.env.NODE_ENV !== "production") {
        setRoleRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? { ...req, status: approved ? "approved" : "rejected", admin_notes: notes }
              : req
          )
        );
        setShowModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update user's role in the user database
  const updateUserRole = async (userId, newRole) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("jstoken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Prepare authorization header and raw token
      const authHeader = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      
      const rawToken = token.startsWith("Bearer ")
        ? token.substring(7)
        : token;

      // Update the user's role
      const response = await fetch(`${config.backendUrl}/user/update-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          user_id: userId,
          user_role: parseInt(newRole),
          admin_token: rawToken
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.status}`);
      }

      toast.success("User role updated successfully");
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error(
        "Failed to update user role. Please update it manually in User Management."
      );
    }
  };

  // Open modal for processing a request
  const openRequestModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  // Filter requests based on search term
  const filteredRequests = roleRequests.filter((request) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      request.user_name?.toLowerCase().includes(searchTermLower) ||
      request.user_email?.toLowerCase().includes(searchTermLower) ||
      request.justification?.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get CSS classes for status badge
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
      >
        <div className="px-4 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Role Change Requests</h1>
              <p className="mt-1 text-sm text-gray-600">
                Review and manage user role change requests
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 mb-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium leading-6 text-gray-900">
                  Filter Requests
                </h2>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700"
                >
                  Search
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-10 sm:text-sm border p-2 border-gray-300 rounded-md"
                    placeholder="Search by name, email or reason"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Role Requests
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
                {filterStatus !== "all" ? ` with status "${filterStatus}"` : ""}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="spinner inline-block w-8 h-8 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Loading role requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No requests found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search term."
                    : "There are no role change requests matching your filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Request
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Justification
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="font-medium text-indigo-800">
                                  {request.user_name?.charAt(0) || "?"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.user_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.user_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {roleMap[request.current_role] || "Unknown"} →{" "}
                            {roleMap[request.requested_role] || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(request.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">
                            {request.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                              request.status
                            )}`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          {request.admin_notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              Note: {request.admin_notes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === "pending" ? (
                            <button
                              onClick={() => openRequestModal(request)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Review
                            </button>
                          ) : (
                            <span className="text-gray-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal for processing requests */}
      {showModal && selectedRequest && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setShowModal(false)}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Review Role Change Request
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-500">User:</span>
                          <span className="ml-2 text-sm text-gray-900">
                            {selectedRequest.user_name} ({selectedRequest.user_email})
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-500">
                            Current Role:
                          </span>
                          <span className="ml-2 text-sm text-gray-900">
                            {roleMap[selectedRequest.current_role] || "Unknown"}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-500">
                            Requested Role:
                          </span>
                          <span className="ml-2 text-sm text-gray-900">
                            {roleMap[selectedRequest.requested_role] || "Unknown"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">
                            Justification:
                          </span>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedRequest.reason || ""}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="admin-notes"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Admin Notes (optional)
                        </label>
                        <textarea
                          id="admin-notes"
                          rows="3"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Add notes about your decision (visible to the user)"
                          defaultValue={selectedRequest.admin_notes || ""}
                          ref={(textarea) => {
                            if (textarea) textarea.focus();
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => processRequest(
                    selectedRequest.request_id,
                    true,
                    document.getElementById("admin-notes").value
                  )}
                  disabled={loading}
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
                    "Approve"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => processRequest(
                    selectedRequest.id,
                    false,
                    document.getElementById("admin-notes").value
                  )}
                  disabled={loading}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminRoleRequests;