import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import config from '../../config';
import AdminLayout from './AdminLayout';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const AdminAnalyticsContent = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    inactiveUsers: 0,
    newUsersLast30Days: 0,
    totalQuizzes: 0,
    achievementStats: [],
    dataTimestamp: null,
    usersByRole: {
      admin: 0,
      teacher: 0,
      student: 0,
      guest: 0
    }
  });
  
  const [popularTenses, setPopularTenses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.backendUrl}/dashboard/admin/analytics`, {
        headers: { 'Authorization': localStorage.getItem('jstoken') }
      });

      if (response.ok) {
        const analyticsData = await response.json();        
        
        if (analyticsData && analyticsData.success && analyticsData.data) {
          const data = analyticsData.data;
          
          // Calculate total quizzes from achievement stats
          const quizRelatedAchievements = data.achievement_stats.filter(stat => 
            stat.achievement_type.includes('quiz') || 
            stat.achievement_type === 'perfect_score'
          );
          
          const totalQuizzes = quizRelatedAchievements.reduce((sum, stat) => sum + stat.count, 0);
          
          // Set all the analytics stats
          setStats({
            activeUsers: data.active_users || 0,
            totalUsers: parseInt(data.total_users) || 0,
            inactiveUsers: data.inactive_users || 0,
            newUsersLast30Days: data.new_users_last_30_days || 0,
            totalQuizzes,
            achievementStats: data.achievement_stats || [],
            dataTimestamp: data.data_timestamp,
            usersByRole: data.users_by_role || { admin: 0, teacher: 0, student: 0, guest: 0 }
          });
          
          // Set popular tenses data
          setPopularTenses(data.popular_tenses || []);
          
          // Set recent activity data
          setRecentActivity(data.recent_activity || []);
          
          // Set top performers data
          setTopPerformers(data.top_performers || []);
        }
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <AdminLayout title="Admin Analytics">
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Analytics Dashboard</h3>
            <p className="text-gray-600">Fetching the latest platform analytics data...</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout title="Admin Analytics">
      <motion.div
        className="p-6 bg-gray-50"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >        {error && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-red-800">Error Loading Analytics</p>
                    <button 
                      onClick={() => fetchAnalyticsData()} 
                      className="ml-3 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Retry
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <p className="mt-1 text-xs text-red-600">Note: Analytics data shown may be stale or incomplete.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Platform Analytics</h1>
          <p className="text-gray-600">Last updated: {new Date(stats.dataTimestamp).toLocaleString()}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">          {/* Active Users Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.activeUsers}</h2>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Users: {stats.totalUsers}</span>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                  {stats.inactiveUsers} inactive
                </span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">New users (30d):</span>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stats.newUsersLast30Days}
                </span>
              </div>
            </div>
          </div>

          {/* Quizzes Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Quizzes Completed</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalQuizzes}</h2>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <AcademicCapIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Perfect Scores</span>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stats.achievementStats.find(stat => stat.achievement_type === 'perfect_score')?.count || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quiz Master Progress */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Quiz Masters</p>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.achievementStats.find(stat => stat.achievement_type === 'quiz_master')?.count || 0}
                </h2>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Daily Streaks</span>
                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {stats.achievementStats.find(stat => stat.achievement_type === 'daily_streak')?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Platform Usage</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Registered Users:</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Active Users:</span>
                    <span className="font-medium">{stats.activeUsers}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Inactive Users:</span>
                    <span className="font-medium">{stats.totalUsers - stats.activeUsers}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">New Users (Last 30 Days):</span>
                    <span className="font-medium">{stats.newUsersLast30Days}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Activity Metrics</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Most Popular Tense:</span>
                    <span className="font-medium">{popularTenses.length > 0 ? popularTenses[0].name : 'N/A'}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Achievement Count:</span>
                    <span className="font-medium">
                      {stats.achievementStats.reduce((sum, stat) => sum + stat.count, 0)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Avg. Daily Active Users (7 days):</span>
                    <span className="font-medium">
                      {recentActivity.length > 0 
                        ? Math.round(recentActivity.reduce((sum, item) => sum + item.unique_users, 0) / recentActivity.length) 
                        : 0}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Time on Platform (7 days):</span>
                    <span className="font-medium">
                      {recentActivity.length > 0 
                        ? Math.round(recentActivity.reduce((sum, item) => sum + item.total_time_spent, 0) / 3600) 
                        : 0} hours
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User Role Distribution Chart */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Doughnut 
                  data={{
                    labels: Object.keys(stats.usersByRole).map(
                      role => role.charAt(0).toUpperCase() + role.slice(1)
                    ),
                    datasets: [
                      {
                        data: Object.values(stats.usersByRole),
                        backgroundColor: [
                          'rgba(239, 68, 68, 0.7)',   // admin - red
                          'rgba(59, 130, 246, 0.7)',  // teacher - blue
                          'rgba(16, 185, 129, 0.7)',  // student - green
                          'rgba(245, 158, 11, 0.7)'   // guest - amber
                        ],
                        borderColor: [
                          'rgba(239, 68, 68, 1)',
                          'rgba(59, 130, 246, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(245, 158, 11, 1)'
                        ],
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <span className="w-3 h-3 inline-block rounded-full bg-red-500 mr-2"></span>
                      Admin Users
                    </span>
                    <span className="font-medium">{stats.usersByRole.admin}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <span className="w-3 h-3 inline-block rounded-full bg-blue-500 mr-2"></span>
                      Teacher Users
                    </span>
                    <span className="font-medium">{stats.usersByRole.teacher}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <span className="w-3 h-3 inline-block rounded-full bg-green-500 mr-2"></span>
                      Student Users
                    </span>
                    <span className="font-medium">{stats.usersByRole.student}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center">
                      <span className="w-3 h-3 inline-block rounded-full bg-amber-500 mr-2"></span>
                      Guest Users
                    </span>
                    <span className="font-medium">{stats.usersByRole.guest}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Popular Tenses Chart */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Tenses Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Bar 
                  data={{
                    labels: popularTenses.map(tense => tense.name),
                    datasets: [
                      {
                        label: 'Usage Count',
                        data: popularTenses.map(tense => tense.usage_count),
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.7)',  // blue
                          'rgba(16, 185, 129, 0.7)',  // green
                          'rgba(245, 158, 11, 0.7)',  // amber
                          'rgba(139, 92, 246, 0.7)',  // purple
                          'rgba(236, 72, 153, 0.7)',  // pink
                        ],
                        borderColor: [
                          'rgba(59, 130, 246, 1)',
                          'rgba(16, 185, 129, 1)',
                          'rgba(245, 158, 11, 1)',
                          'rgba(139, 92, 246, 1)',
                          'rgba(236, 72, 153, 1)',
                        ],
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: true,
                        text: 'Most Frequently Used Tenses'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  {popularTenses.map((tense, index) => (
                    <div key={tense.tense_id} className="flex justify-between items-center">
                      <span className="flex items-center">
                        <span className={`w-3 h-3 inline-block rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-amber-500' : 
                          index === 3 ? 'bg-purple-500' : 
                          'bg-pink-500'
                        } mr-2`}></span>
                        {tense.name}
                      </span>
                      <span className="font-medium">{tense.usage_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      {/* Achievement Stats Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Achievement Statistics</h3>
            <span className="text-sm text-gray-500">
              Total: {stats.achievementStats.reduce((sum, stat) => sum + stat.count, 0)} achievements earned
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.achievementStats.map((stat, index) => {
              // Calculate percentage for progress bar (relative to highest achievement count)
              const maxCount = Math.max(...stats.achievementStats.map(s => s.count));
              const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
              
              // Define color based on achievement type
              const getColor = (type) => {
                if (type.includes('streak')) return 'bg-blue-500';
                if (type.includes('quiz')) return 'bg-green-500';
                if (type.includes('vocab')) return 'bg-purple-500';
                if (type.includes('perfect')) return 'bg-yellow-500';
                return 'bg-orange-500';
              };
              
              return (
                <div key={stat.achievement_type} className="px-6 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${getColor(stat.achievement_type)} mr-2`}></div>
                      <div className="text-sm font-medium text-gray-900">
                        {stat.achievement_type
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{stat.count}</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getColor(stat.achievement_type)} h-2 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
};

// Error boundary class for catching render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in AdminAnalytics component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AdminLayout title="Admin Analytics">
          <div className="p-6">
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-red-800">
                    Error Loading Analytics
                  </h3>
                  <p className="mt-2 text-red-600">
                    An error occurred while trying to load the analytics dashboard. Please try refreshing the page.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      );
    }

    return this.props.children;
  }
}

// Wrap the component with error boundary
const AdminAnalytics = () => (
  <ErrorBoundary>
    <AdminAnalyticsContent />
  </ErrorBoundary>
);

export default AdminAnalytics;