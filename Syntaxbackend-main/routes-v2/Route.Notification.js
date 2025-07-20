// import notification resources
const Notification = require('../modules/Ressources.Notification/Notification.js');
const NotificationService = require('../modules/Ressources.Notification/NotificationService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");

// import passport
const passport = require('passport');

module.exports = (app) => {
  const notificationService = new NotificationService();

  // Helper function to extract user ID from token
  const extractUserId = (req) => {
    try {
      if (!req.get('Authorization')) {
        return null;
      }
      
      const token = req.get('Authorization').split(' ')[1];
      const decoded = jwtDecode(token);
      
      return decoded.sub || decoded.user_id;
    } catch (error) {
      console.error('Error extracting user ID:', error);
      return null;
    }
  };

  // Get notifications for the current user
  app.get('/notifications', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    
    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }
    
    // Extract query parameters for filtering and pagination
    const options = {};
    
    if (req.query.type) {
      options.type = req.query.type;
    }
    
    if (req.query.is_read !== undefined) {
      options.is_read = req.query.is_read === 'true';
    }
    
    if (req.query.limit) {
      options.limit = parseInt(req.query.limit);
    }
    
    if (req.query.offset) {
      options.offset = parseInt(req.query.offset);
    }
    
    notificationService.GET_USER_NOTIFICATIONS(userId, options, (notifications) => {
      if (notifications.code) {
        return res.status(500).json({ 
          msg: "Failed to retrieve notifications", 
          error: notifications.errorMessage || "Unknown error" 
        });
      }
      
      const results = notifications.map(notification => notification.toObject());
      return res.status(200).json({ notifications: results });
    });
  });

  // Mark notification as read
  app.patch('/notifications/:id/read', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    const notificationId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }
    
    notificationService.MARK_AS_READ(notificationId, (result) => {
      if (result.code) {
        return res.status(404).json({ 
          msg: "Failed to mark notification as read", 
          error: result.errorMessage || "Unknown error" 
        });
      }
      
      return res.status(200).json({ 
        msg: "Notification marked as read",
        notification: result.toObject() 
      });
    });
  });

  // Mark all notifications as read
  app.patch('/notifications/read-all', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    
    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }
    
    notificationService.MARK_ALL_AS_READ(userId, (result) => {
      if (result.code) {
        return res.status(500).json({ 
          msg: "Failed to mark all notifications as read", 
          error: result.errorMessage || "Unknown error" 
        });
      }
      
      return res.status(200).json({ 
        msg: "All notifications marked as read",
        count: result.count
      });
    });
  });

  // Delete a notification
  app.delete('/notifications/:id', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    const notificationId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }
    
    notificationService.DELETE_NOTIFICATION(notificationId, (result) => {
      if (result.code) {
        return res.status(500).json({ 
          msg: "Failed to delete notification", 
          error: result.errorMessage || "Unknown error" 
        });
      }
      
      if (!result.deleted) {
        return res.status(404).json({ msg: "Notification not found" });
      }
      
      return res.status(200).json({ msg: "Notification deleted successfully" });
    });
  });
};