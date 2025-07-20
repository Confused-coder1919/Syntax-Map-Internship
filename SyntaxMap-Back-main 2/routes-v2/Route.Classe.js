// import classe ressources
const Classe = require('../modules/Ressources.Classe/Classe.js');
const ClasseService = require('../modules/Ressources.Classe/ClasseService.js');

// import decoder jwt
const jwtDecode = require("jwt-decode");

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

// Helper function to safely extract professor ID from JWT token in Authorization header
function getProfessorIdFromToken(req) {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.sub) return null;
    return decoded.sub.toString();
  } catch (error) {
    console.error('Invalid token:', error.message);
    return null;
  }
}

module.exports = (app) => {
  
  var classeService = new ClasseService();

  // Get all classes
  app.get('/classe', (req, res) =>{
    classeService.SELECT({}, (classes) => {
      if (!classes) {
        res.status(406).end();
        return;
      } else {
        let results = [];
        classes.forEach(item => { results.push(item.toObject(true, true, true)); })
        res.status(200).json({'classes': results});
      }
    });
  });

  // Get classes for a professor (user) from token
  app.get('/classe/user', (req, res) =>{
    const professorId = getProfessorIdFromToken(req);
    if (!professorId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }
    let criteria = { professor_id: professorId };
    classeService.SELECT(criteria, (classes) => {
      if (!classes) {
        res.status(406).end();
        return;
      } else {
        let results = [];
        classes.forEach(item => { results.push(item.toObject(true, true, true)); })
        res.status(200).json({'classes': results});
      }
    });
  });

  // Add a classe
  app.post('/classe', (req, res) =>{
    const professorId = getProfessorIdFromToken(req);
    if (!professorId) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }
    let bodyNewClasse = new Classe(null, null, req.body);
    bodyNewClasse.professor_id = professorId;
    classeService.INSERT(bodyNewClasse, (newClasse) => {
      console.log(newClasse);
      if (newClasse.code) {
        res.statusMessage = newClasse.errorMessage;
        res.status(newClasse.code).end();
        return;
      } else {
        res.status(200).send(newClasse.id);
      }
    });
  });

  // Modify a classe
  app.put('/classe/:id', (req, res) =>{
    let classe = {
      classe_id: req.params.id,
      classe_name: req.body.classe_name,
      students_id: req.body.students_id,
      professor_id: req.body.professor_id
    };
    console.log(req.body);
    classeService.UPDATE(classe, (classes) => {
      if (!classes) {
        res.status(406).end();
        return;
      } else {
        res.status(200).json({'classes': classes});
      }
    });
  });

  // Delete a classe
  app.delete('/classe/:id', (req, res)=> {
    let classe = {
      classe_id: req.params.id
    }
    classeService.DELETE(classe, (classes) => {
      res.status(200).json({'classes': classes});
    });
  });
}
