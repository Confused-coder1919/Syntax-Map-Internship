import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Contexts/AuthContext';
import { API_BASE_URL } from '../../config';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Only fetch notifications if user is logged in
    if (currentUser) {
      fetchNotifications();
    } else {
      setLoading(false);
      setNotifications([]);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (response.data && response.data.success) {
        setNotifications(response.data.notifications || []);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error loading notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.success) {
        // Update the notification in the state
        setNotifications(notifications.map(notification => 
          notification.notification_id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        ));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_BASE_URL}/api/notifications/mark-all-read`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.success) {
        // Update all notifications in state as read
        setNotifications(notifications.map(notification => ({
          ...notification,
          is_read: true
        })));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `${API_BASE_URL}/api/notifications/${notificationId}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data && response.data.success) {
        // Remove the deleted notification from state
        setNotifications(notifications.filter(
          notification => notification.notification_id !== notificationId
        ));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Get notification type icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return (
          <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
            <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
            <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="flex-shrink-0 bg-gray-100 rounded-full p-2">
            <svg className="h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications</h2>
        <p className="text-gray-500">Please log in to view your notifications.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-center text-gray-500 py-8">No notifications to display.</p>
      )}

      <div className="space-y-4">
        {notifications.map(notification => (
          <div 
            key={notification.notification_id}
            className={`flex items-start p-4 rounded-lg ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}
          >
            {getNotificationIcon(notification.type)}
            
            <div className="ml-4 flex-1">
              <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.notification_id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.notification_id)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;