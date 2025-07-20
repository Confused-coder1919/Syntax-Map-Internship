import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AdminLayout from "./AdminLayout";
import { getBackendUrl } from "../../config";
import { toast } from "react-hot-toast";

const AdminControlPanel = () => {
  const [recentUsers, setRecentUsers] = useState([]);
    const [systemStats, setSystemStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    totalQuizzes: 0,
    completedQuizzes: 0,
    pendingVerifications: 0,
    analytics: {
      popularTenses: [],
      achievements: [],
      recentActivity: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    // Fetch data from API when component mounts
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const backendUrl = await getBackendUrl();
        const token = localStorage.getItem('jstoken');
        
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          toast.error("Please log in again to access admin features");
          return;
        }

        // Fetch user data
        const userResponse = await fetch(`${backendUrl}/user`, {
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch users: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        if (userData && userData.users) {
          // Get the most recent users (based on last activity)
          const sortedUsers = userData.users
            .sort((a, b) => new Date(b.user_last_login || 0) - new Date(a.user_last_login || 0))
            .slice(0, 5)
            .map(user => ({
              id: user.user_id,
              name: user.user_name || 'Unknown User',
              email: user.user_email_address,
              role: getRoleName(user.user_role),
              lastActive: user.user_last_login || new Date().toISOString()
            }));
          setRecentUsers(sortedUsers);
        }

        // Fetch analytics data from the new endpoint
        const analyticsResponse = await fetch(`${backendUrl}/dashboard/admin/analytics`, {
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          if (analyticsData && analyticsData.success && analyticsData.data) {
            const data = analyticsData.data;
            
            
            // Process achievement stats to count total quizzes completed
            const achievementStats = data.achievement_stats || [];
            const quizMasterCount = achievementStats.find(a => a.achievement_type === "quiz_master")?.count || 0;
            const perfectScoreCount = achievementStats.find(a => a.achievement_type === "perfect_score")?.count || 0;
            
            // Get the top 3 achievements
            const top3Achievements = [...achievementStats]
              .sort((a, b) => b.count - a.count)
              .slice(0, 3)
              .map(a => ({
                type: a.achievement_type,
                count: a.count,
                formattedType: a.achievement_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              }));
            
            // Get the top 3 popular tenses
            const top3Tenses = (data.popular_tenses || []).slice(0, 3);
            
            // Calculate active users from analytics data
            const activeUsers = data.active_users || 0;
            const totalUsers = parseInt(data.total_users) || 0;
            const inactiveUsers = data.inactive_users || 0;
            
            // Process recent activity data
            const recentActivity = data.recent_activity || [];
            
            // Get role verification requests (keeping existing logic for pending verifications)
            const rolesResponse = await fetch(`${backendUrl}/admin/role-requests?status=pending`, {
              headers: { "Authorization": token }
            });
            
            let pendingVerifications = 0;
            if (rolesResponse.ok) {
              const rolesData = await rolesResponse.json();
              pendingVerifications = rolesData?.requests?.length || 0;
            }
            
            // Calculate total time spent (in hours) from recent activity
            const totalTimeSpent = recentActivity.reduce((sum, day) => sum + day.total_time_spent, 0);
            const totalHours = Math.round(totalTimeSpent / 3600);
            
            setSystemStats({
              activeUsers,
              totalUsers,

              totalQuizzes: quizMasterCount + perfectScoreCount, // Quiz achievements as a proxy for completed quizzes
              completedQuizzes: quizMasterCount, // Just quiz master achievement count
              pendingVerifications,
              analytics: {
                popularTenses: top3Tenses,
                achievements: top3Achievements,
                recentActivity: recentActivity,
                totalTimeSpent: totalHours
              }
            });
          } else {
            throw new Error("Invalid data structure in analytics API response");
          }
        } else {
          console.log("Analytics endpoint not available, falling back to individual sources");
          
          // Calculate stats from other endpoints
          const [quizzesResponse, rolesResponse] = await Promise.all([
            fetch(`${backendUrl}/quiz`, {
              headers: { "Authorization": token }
            }),
            fetch(`${backendUrl}/admin/role-requests?status=pending`, {
              headers: { "Authorization": token }
            })
          ]);

          // Process quiz data if available
          let totalQuizzes = 0;
          let completedQuizzes = 0;
          if (quizzesResponse.ok) {
            const quizData = await quizzesResponse.json();
            totalQuizzes = quizData?.questions?.length || 0;
            // We might need another endpoint to get completed quizzes count
          }

          // Process pending role requests if available
          let pendingVerifications = 0;
          if (rolesResponse.ok) {
            const rolesData = await rolesResponse.json();
            pendingVerifications = rolesData?.requests?.length || 0;
          }

          // Calculate active users (those logged in within last 30 days)
          const activeUsers = userData?.users?.filter(user => {
            if (!user.user_last_login) return false;
            const lastLogin = new Date(user.user_last_login);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastLogin >= thirtyDaysAgo;
          }).length || 0;

          setSystemStats({
            activeUsers,
            totalQuizzes,
            completedQuizzes,
            pendingVerifications
          });
        }      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        toast.error("Failed to load dashboard data");
          // Set default values for stats if we couldn't get them
        setSystemStats({
          activeUsers: 0,
          totalUsers: 0,
          totalQuizzes: 0,
          completedQuizzes: 0,
          pendingVerifications: 0,
          analytics: {
            popularTenses: [],
            achievements: [],
            recentActivity: [],
            totalTimeSpent: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to convert role ID to role name
  const getRoleName = (roleId) => {
    switch (parseInt(roleId)) {
      case 1: return 'Admin';
      case 2: return 'Teacher';
      case 3: return 'Student';
      default: return 'Guest';
    }
  };

  const modules = [
    {
      title: "Tense Management",
      description: "Add, edit, or delete tense categories and manage grammar rules",
      path: "/admintensemap",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bgColor: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600"
    },
    {
      title: "Quiz Builder",
      description: "Create and manage quizzes, questions, and difficulty levels",
      path: "/quizbuilder",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "User Management",
      description: "View and manage user accounts, permissions, and roles",
      path: "/adminusers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgColor: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "Role Requests",
      description: "Review and approve user role change requests",
      path: "/adminrolerequests",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-amber-500",
      hoverColor: "hover:bg-amber-600"
    },
    {
      title: "Analytics",
      description: "View user engagement metrics and learning statistics",
      path: "/adminanalytics",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome back! Here's an overview of your SyntaxMap application
              </p>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 transition-all hover:shadow">
              <div className="px-4 py-6 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="mt-1">
                        <div className="text-lg font-medium text-gray-900">{systemStats.activeUsers}</div>
                        <div className="text-xs text-gray-500">
                          of {systemStats.totalUsers} total users 
                          ({systemStats.totalUsers > 0 
                            ? Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100) 
                            : 0}%)
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 transition-all hover:shadow">
              <div className="px-4 py-6 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Tense Usage</dt>
                      <dd className="mt-1">
                        <div className="text-lg font-medium text-gray-900">
                          {systemStats.analytics.popularTenses && systemStats.analytics.popularTenses.length > 0 
                            ? systemStats.analytics.popularTenses[0]?.usage_count || 0 
                            : 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          Most popular: {systemStats.analytics.popularTenses && systemStats.analytics.popularTenses.length > 0 
                            ? systemStats.analytics.popularTenses[0]?.name || 'None' 
                            : 'None'}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 transition-all hover:shadow">
              <div className="px-4 py-6 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Quiz Achievements</dt>
                      <dd className="mt-1">
                        <div className="text-lg font-medium text-gray-900">{systemStats.completedQuizzes}</div>
                        <div className="text-xs text-gray-500">
                          Completed with quiz mastery
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 transition-all hover:shadow">
              <div className="px-4 py-6 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-amber-500 rounded-md p-3 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Verifications</dt>
                      <dd className="mt-1">
                        <div className="text-lg font-medium text-gray-900">{systemStats.pendingVerifications}</div>
                        <div className="text-xs text-gray-500">
                          Role requests awaiting approval
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>        </div>

        {/* Analytics Overview */}
        <div className="mb-8 bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics Overview</h3>
              <p className="mt-1 text-sm text-gray-500">
                Platform performance and user engagement metrics
              </p>
            </div>
            <Link
              to="/adminanalytics"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View detailed analytics
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">            {/* Popular Tenses */}
            <div>
              <h4 className="text-base font-medium text-gray-800 mb-3">Popular Tenses</h4>
              <div className="space-y-2">
                {systemStats.analytics.popularTenses.length > 0 ? (
                  systemStats.analytics.popularTenses.map((tense, index) => {
                    // Define different colors for each tense
                    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={tense.tense_id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 ${color} rounded-full mr-2`}></span>
                          <span className="text-sm">{tense.name}</span>
                        </div>
                        <span className="text-sm font-medium">{tense.usage_count} uses</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No tense usage data available</p>
                )}
              </div>
            </div>
            
            {/* Achievement Stats */}
            <div>
              <h4 className="text-base font-medium text-gray-800 mb-3">Achievement Stats</h4>
              <div className="space-y-2">
                {systemStats.analytics.achievements.length > 0 ? (
                  systemStats.analytics.achievements.map((achievement, index) => {
                    // Define different colors for each achievement type
                    const colors = ['bg-yellow-500', 'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500'];
                    const color = colors[index % colors.length];
                    
                    return (
                      <div key={achievement.type} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 ${color} rounded-full mr-2`}></span>
                          <span className="text-sm">{achievement.formattedType}</span>
                        </div>
                        <span className="text-sm font-medium">{achievement.count} achieved</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No achievement data available</p>
                )}
              </div>
            </div>          </div>
          
          {/* Add user engagement metrics panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 pt-0">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-base font-medium text-gray-800 mb-3">User Engagement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total users:</span>
                  <span className="text-sm font-medium">{systemStats.totalUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active users:</span>
                  <span className="text-sm font-medium">{systemStats.activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inactive users:</span>
                  <span className="text-sm font-medium">{systemStats.totalUsers - systemStats.activeUsers}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {systemStats.totalUsers > 0 
                      ? Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100) 
                      : 0}% active
                  </p>
                </div>
              </div>
            </div>
            
            {/* Recent activity summary */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-base font-medium text-gray-800 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                {systemStats.analytics.recentActivity && systemStats.analytics.recentActivity.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Today's active users:</span>
                      <span className="text-sm font-medium">
                        {systemStats.analytics.recentActivity[0]?.unique_users || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Time spent today:</span>
                      <span className="text-sm font-medium">
                        {systemStats.analytics.recentActivity[0]?.total_time_spent 
                          ? Math.round(systemStats.analytics.recentActivity[0].total_time_spent / 60) + ' min'
                          : '0 min'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Weekly active users:</span>
                      <span className="text-sm font-medium">
                        {systemStats.analytics.recentActivity.reduce((sum, day) => sum + day.unique_users, 0)}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Activity trend (last 7 days)</p>
                      <div className="flex items-end justify-between h-12 mt-2 space-x-1">
                        {systemStats.analytics.recentActivity.slice().reverse().map((day, i) => {
                          const maxValue = Math.max(...systemStats.analytics.recentActivity.map(d => d.unique_users));
                          const height = maxValue > 0 ? (day.unique_users / maxValue) * 100 : 0;
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <div 
                                className="bg-blue-400 rounded-t w-4" 
                                style={{ height: `${height}%` }}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main modules */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className="block bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow transition-all duration-200"
            >
              <div className="px-5 py-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${module.bgColor} rounded-md p-3.5 text-white shadow-sm`}>
                    {module.icon}
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                    <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{module.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent users table */}
        <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-5 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Users</h3>
              <p className="mt-1 text-sm text-gray-500">
                Latest user activities
              </p>
            </div>
            <Link
              to="/adminusers"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View all users
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? (
                  recentUsers.map((user, idx) => (
                    <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{user.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'Teacher' ? 'bg-green-100 text-green-800' : 
                          user.role === 'Student' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.lastActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/adminusers/${user.id}`} className="text-indigo-600 hover:text-indigo-700">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System information */}
        <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              System status and recent activities
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  System Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
              <div className="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Last Maintenance
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))}
                </dd>
              </div>
              <div className="bg-gray-50 px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Database Status
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Connected
                  </span>
                </dd>
              </div>
              <div className="bg-white px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Server Version
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  2.5.0
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminControlPanel;