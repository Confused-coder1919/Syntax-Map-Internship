// import course ressources
const Course = require('../modules/Ressources.Course/Course.js');
const CourseService = require('../modules/Ressources.Course/CourseService.js');

// import jwt-decode safely
const jwtDecode = require("jwt-decode");

//import ErrorObject
const ErrorObject = require('../modules/error/ErrorObject.js');

module.exports = (app) => {

  const courseService = new CourseService();

  // Helper to get JWT subject safely
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

  // Get all courses (public)
  app.get('/course', (req, res) => {
    courseService.SELECT({}, (courses) => {
      if (courses.code) {
        res.status(406).end();
      } else {
        const results = courses.map(item => item.toObject(true, true, true));
        res.status(200).json({ courses: results });
      }
    });
  });

  // Get a course by title (public)
  app.get('/course/:title', (req, res) => {
    const criteria = { course_title: req.params.title };
    courseService.SELECT(criteria, (courses) => {
      if (courses.code) {
        res.status(406).end();
      } else {
        const results = courses.map(item => item.toObject(true, true, true));
        res.status(200).json({ courses: results });
      }
    });
  });

  // Add a course (protected)
  app.post('/course', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return; // response already sent

    const bodyNewCourse = new Course(null, null, req.body);
    // Optionally associate with user ID or do additional checks here
    courseService.INSERT(bodyNewCourse, (newCourse) => {
      if (newCourse.code) {
        res.statusMessage = newCourse.errorMessage;
        res.status(newCourse.code).end();
      } else {
        res.status(200).json({ course: newCourse });
      }
    });
  });

  // Modify a course (protected)
  app.put('/course/:id', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const course = {
      course_id: req.params.id,
      course_title: req.body.course_title,
      course_image: req.body.course_image,
      course_data: req.body.course_data,
      course_item: req.body.course_item,
      hide: req.body.hide
    };

    courseService.UPDATE(course, (courses) => {
      if (courses.code) {
        res.status(406).end();
      } else {
        res.status(200).json({ courses });
      }
    });
  });

  // Delete a course (protected)
  app.delete('/course/:id', (req, res) => {
    const userId = getUserIdFromAuthHeader(req, res);
    if (!userId) return;

    const course = { course_id: req.params.id };
    courseService.DELETE(course, (courses) => {
      res.status(200).json({ courses });
    });
  });
};
