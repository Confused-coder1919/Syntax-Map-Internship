const express = require("express");
const router = express.Router();
const getSyntaxe = require("../parser/syntaxePostgres.js");
const pool = require('../config/db_connect.js');

// Get all questions
router.get('/quiz', (req, res) => {
  pool.query('SELECT * FROM question_table')
    .then(result => {
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Get x questions from their theme (GET version with query param)
router.get('/quiz/:course', (req, res) => {
  const course = req.params.course;
  const nb_questions = parseInt(req.query.nb_questions) || 5; // default to 5 if not specified

  const sql = `
    SELECT * FROM question_table
    WHERE online_exam_id = (
      SELECT course_id FROM course_table WHERE course_title = $1
    )
    ORDER BY random()
    LIMIT $2
  `;

  pool.query(sql, [course, nb_questions])
    .then(result => {
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// Create a question
router.post('/quiz', (req, res) => {
  var tmp = req.body.quiz_data[0];
  const shuffledArray = req.body.quiz_data.sort((a, b) => 0.5 - Math.random());
  req.body.quiz_title = getSyntaxe(req.body.quiz_title);
  console.log(req.body);

  const sql = `
    INSERT INTO question_table
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, 10, $8, default, $9
    )
  `;

  const values = [
    req.body.course_ids[0],
    req.body.quiz_title,
    shuffledArray[0],
    shuffledArray[1],
    shuffledArray[2],
    shuffledArray[3],
    String.fromCharCode(97 + shuffledArray.indexOf(tmp)),
    req.body.difficulty,
    `{${req.body.course_ids}}`
  ];

  pool.query(sql, values)
    .then(result => {
      console.log(result);
      res.send(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Modify a question by ID
router.put('/quiz/:id', (req, res) => {
  const sql = `
    UPDATE question_table SET
      question_title = $1,
      answer_title_a = $2,
      answer_title_b = $3,
      answer_title_c = $4,
      answer_title_d = $5,
      right_answer = $6
    WHERE id_question = $7
  `;

  const values = [
    req.body.title,
    req.body.answer_title_a,
    req.body.answer_title_b,
    req.body.answer_title_c,
    req.body.answer_title_d,
    req.body.right_answer,
    req.params.id
  ];

  pool.query(sql, values)
    .then(result => {
      console.log(result.rows);
      res.send(result.rows);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = router;
