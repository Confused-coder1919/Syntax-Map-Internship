const { v4: uuidv4 } = require('uuid');
const NotificationDao = require('./NotificationDao');

class NotificationService {
  #notificationDao = new NotificationDao();

  constructor() {}

  // Create a new notification
  CREATE_NOTIFICATION(userId, message, type, callback) {
    if (!userId || !message || !type) {
      return this.#notificationDao.ErrorHandling({
        'code': 'INVALID_REQUEST',
        'message': 'User ID, message and type are required'
      }, callback);
    }

    const notificationId = uuidv4();
    const notification = {
      notification_id: notificationId,
      user_id: userId,
      message: message,
      type: type,
      is_read: false
    };

    this.#notificationDao.INSERT(notification, callback);
  }

  // Get all notifications for a user
  GET_USER_NOTIFICATIONS(userId, options, callback) {
    if (!userId) {
      return this.#notificationDao.ErrorHandling({
        'code': 'INVALID_REQUEST',
        'message': 'User ID is required'
      }, callback);
    }

    const criteria = {
      user_id: userId,
      ...options
    };

    this.#notificationDao.SELECT(criteria, callback);
  }

  // Mark notification as read
  MARK_AS_READ(notificationId, callback) {
    if (!notificationId) {
      return this.#notificationDao.ErrorHandling({
        'code': 'INVALID_REQUEST',
        'message': 'Notification ID is required'
      }, callback);
    }

    this.#notificationDao.UPDATE_READ_STATUS(notificationId, true, callback);
  }

  // Mark all notifications as read for a user
  MARK_ALL_AS_READ(userId, callback) {
    if (!userId) {
      return this.#notificationDao.ErrorHandling({
        'code': 'INVALID_REQUEST',
        'message': 'User ID is required'
      }, callback);
    }

    this.#notificationDao.UPDATE_ALL_READ_STATUS(userId, true, callback);
  }

  // Delete a notification
  DELETE_NOTIFICATION(notificationId, callback) {
    if (!notificationId) {
      return this.#notificationDao.ErrorHandling({
        'code': 'INVALID_REQUEST',
        'message': 'Notification ID is required'
      }, callback);
    }

    this.#notificationDao.DELETE(notificationId, callback);
  }
}

module.exports = NotificationService;