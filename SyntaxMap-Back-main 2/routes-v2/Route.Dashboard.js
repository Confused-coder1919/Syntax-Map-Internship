// import dashboard ressources
const Dashboard = require('../modules/Ressources.Dashboard/Dashboard.js');
const DashboardService = require('../modules/Ressources.Dashboard/DashboardService.js');

// import jwt-decode
const jwtDecode = require("jwt-decode");

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {

  const dashboardService = new DashboardService();

  // Helper to safely get user ID from Authorization header
  function getUserIdFromAuthHeader(req, res) {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid Authorization header format' });
      return null;
    }
    try {
      const decoded = jwtDecode(parts[1]);
      return decoded.sub.toString();
    } catch (e) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return null;
    }
  }

  // Get all dashboards (public)
  app.get('/dashboard', (req, res) => {
    dashboardService.SELECT({}, (dashboards) => {
      if (dashboards.code) {
        res.status(406).end();
      } else {
        const results = dashboards.map(item => item.toObject(true, true, true));
        res.status(200).json({ dashboard: results });
      }
    });
  });

  // Get dashboards for a user (protected)
  app.get('/dashboard/user', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return; // response already sent on error

    const criteria = { user_id: userId };
    dashboardService.SELECT(criteria, (dashboards) => {
      if (dashboards.code) {
        res.status(406).end();
      } else {
        const results = dashboards.map(item => item.toObject(true, true, true));
        res.status(200).json({ dashboard: results });
      }
    });
  });

  // Add a dashboard (protected)
  app.post('/dashboard', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const bodyNewDashboard = new Dashboard(null, null, req.body);
    bodyNewDashboard.user_id = userId;
    dashboardService.INSERT(bodyNewDashboard, (newDashboard) => {
      if (newDashboard.code) {
        res.statusMessage = newDashboard.errorMessage;
        res.status(newDashboard.code).end();
      } else {
        res.status(200).json({ report_id: newDashboard.id });
      }
    });
  });

  // Delete a dashboard (protected)
  app.delete('/dashboard/:id', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const dashboard = { dashboard_id: req.params.id };
    dashboardService.DELETE(dashboard, (dashboards) => {
      res.status(200).json({ dashboard: dashboards });
    });
  });

};
