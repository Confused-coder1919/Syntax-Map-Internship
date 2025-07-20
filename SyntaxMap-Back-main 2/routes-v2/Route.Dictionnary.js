// import dictionnary ressources
const Dictionnary = require('../modules/Ressources.Dictionnary/Dictionnary.js');
const DictionnaryService = require('../modules/Ressources.Dictionnary/DictionnaryService.js');

// import jwt-decode
const jwtDecode = require("jwt-decode");

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {

  const dictionnaryService = new DictionnaryService();

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

  // Get all dictionnary entries (public)
  app.get('/dictionnary', (req, res) => {
    dictionnaryService.SELECT({}, (dictionnarys) => {
      if (dictionnarys.code) {
        res.status(406).end();
      } else {
        const results = dictionnarys.map(item => item.toObject(true, true, true));
        res.status(200).json({ dictionnary: results });
      }
    });
  });

  // Get dictionnary entries for a user (protected)
  app.get('/dictionnary/user', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const criteria = { user_id: userId };
    dictionnaryService.SELECT(criteria, (dictionnarys) => {
      if (dictionnarys.code) {
        res.status(406).end();
      } else {
        const results = dictionnarys.map(item => item.toObject(true, true, true));
        res.status(200).json({ dictionnary: results });
      }
    });
  });

  // Add a dictionnary entry (protected)
  app.post('/dictionnary', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const bodyNewDictionnary = new Dictionnary(null, null, req.body);
    bodyNewDictionnary.user_id = userId;
    dictionnaryService.INSERT(bodyNewDictionnary, (newDictionnary) => {
      if (newDictionnary.code) {
        res.statusMessage = newDictionnary.errorMessage;
        res.status(newDictionnary.code).end();
      } else {
        res.status(200).send(newDictionnary.id);
      }
    });
  });

  // Delete a dictionnary entry (protected)
  app.delete('/dictionnary/:id', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const dictionnary = { dictionnary_id: req.params.id };
    dictionnaryService.DELETE(dictionnary, (dictionnarys) => {
      res.status(200).json({ dictionnary: dictionnarys });
    });
  });

};
