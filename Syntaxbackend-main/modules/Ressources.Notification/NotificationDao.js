const InterfaceDao = require('../InterfaceDao');
const Notification = require('./Notification');
const pool = require('../../config/db_connect').pool;

class NotificationDao extends InterfaceDao {
  constructor() {
    super();
  }

  // Insert a new notification
  INSERT(notification, callback) {
    pool.connect()
      .then(client => {
        const query = `
          INSERT INTO notification_table (
            notification_id, user_id, message, type, created_at, is_read
          ) VALUES ($1, $2, $3, $4, NOW(), $5)
          RETURNING *
        `;

        const values = [
          notification.notification_id,
          notification.user_id,
          notification.message,
          notification.type,
          notification.is_read || false
        ];

        client.query(query, values)
          .then(result => {
            client.release();
            if (result.rows.length > 0) {
              callback(new Notification(null, result.rows[0], null));
            } else {
              callback({
                code: 'INSERT_FAILED',
                errorMessage: 'Failed to insert notification'
              });
            }
          })
          .catch(err => {
            client.release();
            this.ErrorHandling(err, callback);
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  // Get notifications
  SELECT(criteria, callback) {
    pool.connect()
      .then(client => {
        let query = 'SELECT * FROM notification_table WHERE 1=1';
        const values = [];
        let index = 1;

        if (criteria.user_id) {
          query += ` AND user_id = $${index++}`;
          values.push(criteria.user_id);
        }

        if (criteria.notification_id) {
          query += ` AND notification_id = $${index++}`;
          values.push(criteria.notification_id);
        }

        if (criteria.type) {
          query += ` AND type = $${index++}`;
          values.push(criteria.type);
        }

        if (criteria.is_read !== undefined) {
          query += ` AND is_read = $${index++}`;
          values.push(criteria.is_read);
        }

        // Add sorting and pagination
        query += ' ORDER BY created_at DESC';
        
        if (criteria.limit) {
          query += ` LIMIT $${index++}`;
          values.push(criteria.limit);
          
          if (criteria.offset) {
            query += ` OFFSET $${index++}`;
            values.push(criteria.offset);
          }
        }

        client.query(query, values)
          .then(result => {
            client.release();
            const notifications = [];
            result.rows.forEach(row => {
              notifications.push(new Notification(null, row, null));
            });
            callback(notifications);
          })
          .catch(err => {
            client.release();
            this.ErrorHandling(err, callback);
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  // Update notification read status
  UPDATE_READ_STATUS(notificationId, isRead, callback) {
    pool.connect()
      .then(client => {
        const query = `
          UPDATE notification_table 
          SET is_read = $1 
          WHERE notification_id = $2
          RETURNING *
        `;

        client.query(query, [isRead, notificationId])
          .then(result => {
            client.release();
            if (result.rows.length > 0) {
              callback(new Notification(null, result.rows[0], null));
            } else {
              callback({
                code: 'UPDATE_FAILED',
                errorMessage: 'No notification found with that ID'
              });
            }
          })
          .catch(err => {
            client.release();
            this.ErrorHandling(err, callback);
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  // Mark all notifications as read for a user
  UPDATE_ALL_READ_STATUS(userId, isRead, callback) {
    pool.connect()
      .then(client => {
        const query = `
          UPDATE notification_table 
          SET is_read = $1 
          WHERE user_id = $2
          RETURNING *
        `;

        client.query(query, [isRead, userId])
          .then(result => {
            client.release();
            callback({ 
              success: true,
              count: result.rowCount
            });
          })
          .catch(err => {
            client.release();
            this.ErrorHandling(err, callback);
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  // Delete a notification
  DELETE(notificationId, callback) {
    pool.connect()
      .then(client => {
        const query = 'DELETE FROM notification_table WHERE notification_id = $1';

        client.query(query, [notificationId])
          .then(result => {
            client.release();
            callback({ 
              success: true, 
              deleted: result.rowCount > 0 
            });
          })
          .catch(err => {
            client.release();
            this.ErrorHandling(err, callback);
          });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }
}

module.exports = NotificationDao;