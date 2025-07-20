const express = require("express");
const router = express.Router();
const getSyntaxe = require("../parser/syntaxePostgres.js");
const pool = require('../config/db_connect.js');

// Get all users upload
router.get('/userupload', (req, res) => {
  pool.query('SELECT * FROM user_upload')
    .then(result => {
      console.log(result.rows);
      res.json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Get upload from a user
router.get('/userupload/user/:username', (req, res) => {
  const { username } = req.params;
  pool.query('SELECT * FROM user_upload WHERE user_name = $1', [username])
    .then(result => {
      console.log(result.rows);
      res.json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Get upload from a user for a course (by course title) - legacy route, keep if needed
router.get('/userupload/user/:username/:course', (req, res) => {
  const { username, course } = req.params;
  pool.query(
    `SELECT * FROM user_upload 
     WHERE user_name = $1 AND course_id = (SELECT course_id FROM course_table WHERE course_title = $2)`,
    [username, course]
  )
    .then(result => {
      console.log(result.rows);
      res.json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// New safer route: Get uploads from a user for a course by course_id
router.get('/userupload/user/:username/course/:course_id', (req, res) => {
  const { username, course_id } = req.params;
  pool.query('SELECT * FROM user_upload WHERE user_name = $1 AND course_id = $2', [username, course_id])
    .then(result => {
      console.log(result.rows);
      res.json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Get an upload from its id
router.get('/userupload/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM user_upload WHERE id_upload = $1', [id])
    .then(result => {
      console.log(result.rows);
      res.json(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Add a Post
router.post('/userupload', (req, res) => {
  try {
    req.body.sentence = getSyntaxe(req.body.sentence);
  } catch(e) {
    console.error("Syntaxe processing error:", e);
    req.body.sentence = req.body.sentence || "";
  }
  
  const { sentence, img, course_id, user_name } = req.body;

  pool.query(
    'INSERT INTO user_upload (sentence, img, course_id, created_at, user_name) VALUES ($1, $2, $3, DEFAULT, $4)',
    [sentence, img, course_id, user_name]
  )
    .then(result => {
      console.log(result);
      res.json({ success: true });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Modify an upload
router.put('/userupload/:id', (req, res) => {
  const { id } = req.params;
  const { sentence, img } = req.body;

  pool.query(
    'UPDATE user_upload SET sentence = $1, img = $2 WHERE id_upload = $3',
    [sentence, img, id]
  )
    .then(result => {
      console.log(result);
      res.json({ success: true });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

// Delete an upload
router.delete('/userupload/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM user_upload WHERE id_upload = $1', [id])
    .then(result => {
      console.log(result.rows);
      res.json({ success: true });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server error');
    });
});

module.exports = router;
