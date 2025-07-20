import React, { useState, useEffect } from "react";
import config, { getBackendUrl } from "../../config";
import AdminLayout from "./AdminLayout";
import { getStoredRole } from "../../authority";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [token, setToken] = useState(null);

  // Role mapping for display
  const roleMap = {
    1: "Admin",
    2: "Teacher",
    3: "Student",
    4: "Guest"
  };

  // Get and validate token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("jstoken");
    
    // Make sure token is in the correct format for API calls
    if (storedToken) {
      // Strip 'Bearer ' prefix if it exists, then add it back consistently
      const formattedToken = storedToken.startsWith("Bearer ") 
        ? storedToken 
        : `Bearer ${storedToken}`;
      
      setToken(formattedToken);
      
      // Double-check admin role
      const role = getStoredRole();
    } else {
      console.error("No authentication token found in localStorage");
    }
  }, []);

  // Fetch users whenever token changes or refresh is triggered
  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setError("You need to be logged in to access this page");
      setLoading(false);
    }
  }, [token, refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Ensure we have a token
      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        setLoading(false);
        return;
      }

      // Use the async getBackendUrl function instead of direct property access
      const backendUrl = await getBackendUrl();
      
      console.log("Fetching users from:", backendUrl);
      const response = await fetch(`${backendUrl}/user`, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Authorization": token
        }
      });

      // Handle unauthorized response
      if (response.status === 401) {
        console.error("Authentication failed. Token might be invalid or expired.");
        
        // Try refreshing the page to get a fresh token via full authentication flow
        const confirmRefresh = window.confirm("Your session appears to have expired. Would you like to refresh the page to log in again?");
        if (confirmRefresh) {
          window.location.reload();
          return;
        }
        
        // If user cancels refresh, show error
        localStorage.removeItem("jstoken");
        setError("Your session has expired. Please log in again.");
        setToken(null);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.users) {
        console.log(`Retrieved ${data.users.length} users:`, data.users);
        
        // Since we're working with production backend that doesn't include IDs,
        // use email as the unique identifier for each user
        const processedUsers = data.users.map((user) => ({
          ...user,
          // If user_id doesn't exist, use email as unique identifier
          synthetic_id: user.user_id || `email:${user.user_email_address}`
        }));
        
        setUsers(processedUsers);
        
        // Log user identifiers for debugging
        processedUsers.forEach(user => {
          const idType = user.user_id ? "database ID" : "email-based ID";
          console.log(`User ${user.user_name} (${user.user_email_address}) has ${idType}: ${user.synthetic_id}`);
        });
      } else {
        console.error("Failed to fetch users:", data);
        setError(data.msg || "Could not fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred while fetching users. The backend server might be offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userIdentifier, newRole) => {
    try {
      // Validate that we have a valid user identifier
      if (!userIdentifier) {
        setError("Cannot update role: Missing user identifier");
        return;
      }

      if (!token) {
        setError("Authentication token is missing. Please log in again.");
        return;
      }

      setLoading(true);
      setError("");
      setSuccess("");

      // Use the async getBackendUrl function
      const backendUrl = await getBackendUrl();
      
      // Extract the raw token without the Bearer prefix for the admin_token field
      const rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
      
      // Check if we're using an email-based identifier or a real user ID
      let userId, userEmail;
      
      if (userIdentifier.startsWith('email:')) {
        // We're using email as identifier
        userEmail = userIdentifier.replace('email:', '');
        
        // Find the user by email
        const user = users.find(u => u.user_email_address === userEmail);
        if (!user) {
          setError(`User with email ${userEmail} not found`);
          setLoading(false);
          return;
        }
        
        console.log(`Updating role for user with email ${userEmail} to ${newRole} (${roleMap[newRole]})`);
        
        // Skip the failing endpoint and directly use the working endpoint for render.com
        const response = await fetch(`${backendUrl}/admin/direct-update-role-by-email`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            user_email: userEmail,
            user_role: parseInt(newRole),
            admin_token: rawToken // Send raw token without Bearer prefix
          })
        });
        
        // Handle unauthorized response
        if (response.status === 401) {
          console.error("Authentication failed. Token might be invalid or expired.");
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
          setSuccess(`User role updated successfully to ${roleMap[newRole]}`);
          // Update the local state with the new role
          setUsers(users.map(user =>
            user.user_email_address === userEmail ? { ...user, user_role: parseInt(newRole) } : user
          ));
        } else {
          setError(data.msg || "Failed to update user role");
        }
      } else {
        // We have a real user ID
        userId = userIdentifier;
        
        console.log(`Updating role for user with ID ${userId} to ${newRole} (${roleMap[newRole]})`);
        
        // Original approach with user IDs
        const response = await fetch(`${backendUrl}/user/update-role`, {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": token
          },
          body: JSON.stringify({
            user_id: userId,
            user_role: parseInt(newRole)
          })
        });
        
        // Handle unauthorized response
        if (response.status === 401) {
          console.error("Authentication failed. Token might be invalid or expired.");
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log("Role update response:", data);
        
        if (response.ok) {
          setSuccess(`User role updated successfully to ${roleMap[newRole]}`);
          // Update the local state with the new role
          setUsers(users.map(user =>
            user.user_id === userId ? { ...user, user_role: parseInt(newRole) } : user
          ));
        } else {
          setError(data.msg || "Failed to update user role");
        }
      }
      
      // Refresh the user list to ensure we have the latest data
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 2000);
      
    } catch (error) {
      console.error("Error updating role:", error);
      setError("An error occurred while updating the role. The backend server might be offline.");
    } finally {
      setLoading(false);
    }
  };

  const refreshUsersList = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AdminLayout title="Admin Control Panel">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <button
              onClick={refreshUsersList}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh Users
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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
            <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.synthetic_id || user.user_email_address}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.user_name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.user_email_address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.user_email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {user.user_email_verified ? 'Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {roleMap[user.user_role] || `Unknown (${user.user_role})`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <select
                                value={user.user_role || 4}
                                onChange={(e) => handleRoleChange(user.synthetic_id, e.target.value)}
                                disabled={loading}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                <option value="1">Admin</option>
                                <option value="2">Teacher</option>
                                <option value="3">Student</option>
                                <option value="4">Guest</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            No users found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagement;