// import mistakeQuestion ressources
const MistakeQuestion = require('../modules/Ressources.MistakeQuestion/MistakeQuestion.js');
const MistakeQuestionService = require('../modules/Ressources.MistakeQuestion/MistakeQuestionService.js');

// import jwt-decode
const jwtDecode = require("jwt-decode");

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {

  const mistakeQuestionService = new MistakeQuestionService();

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

  // Get all mistakeQuestion (public)
  app.get('/mistakeQuestion', (req, res) => {
    mistakeQuestionService.SELECT({}, (mistakeQuestions) => {
      if (mistakeQuestions.code) {
        res.status(406).end();
      } else {
        const results = mistakeQuestions.map(item => item.toObject(true, true, true));
        res.status(200).json({ mistakeQuestions: results });
      }
    });
  });

  // Get mistakeQuestion for user (protected)
  app.get('/mistakeQuestion/user', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const criteria = { user_id: userId };
    mistakeQuestionService.SELECT(criteria, (mistakeQuestions) => {
      if (mistakeQuestions.code) {
        res.status(406).end();
      } else {
        const results = mistakeQuestions.map(item => item.toObject(true, true, true));
        res.status(200).json({ mistakeQuestions: results });
      }
    });
  });

  // Add a mistakeQuestion (protected)
  app.post('/mistakeQuestion', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const bodyNewMistakeQuestion = new MistakeQuestion(null, null, req.body);
    bodyNewMistakeQuestion.user_id = userId;

    mistakeQuestionService.INSERT(bodyNewMistakeQuestion, (newMistakeQuestion) => {
      if (newMistakeQuestion.code) {
        res.statusMessage = newMistakeQuestion.errorMessage;
        res.status(newMistakeQuestion.code).end();
      } else {
        res.status(200).json({ mistake_id: newMistakeQuestion.id });
      }
    });
  });

  // Delete a mistakeQuestion (protected)
  app.delete('/mistakeQuestion/:id', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const mistakeQuestion = { mistakeQuestion_id: req.params.id };
    mistakeQuestionService.DELETE(mistakeQuestion, (mistakeQuestions) => {
      res.status(200).json({ mistakeQuestions });
    });
  });
};
