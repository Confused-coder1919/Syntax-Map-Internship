const pool = require("../../config/db_connect");
const Quiz = require("./Quiz");
const InterfaceDao = require("../InterfaceDao");
const getSyntaxe = require("../../parser/syntaxePostgres");
const { v4: uuidv4 } = require("uuid");

class QuizDao extends InterfaceDao {
  constructor() {
    super();
  }

  INSERT(quiz, callback) {
    const quizId = uuidv4();
    
    // Handle both structures: full quiz objects or simple question objects
    const question = quiz.question || (typeof quiz === 'object' ? quiz : {});
    
    // Make sure we have the required fields
    if (!quiz.tense_id) {
      return this.ErrorHandling({code: '_2', message: 'Missing tense_id for quiz'}, callback);
    }
    
    const values = [
      quizId,
      quiz.tense_id,
      getSyntaxe(question.question || quiz.question || ''),
      getSyntaxe(JSON.stringify(question.options || quiz.options || [])),
      getSyntaxe(question.correct_answer || quiz.correct_answer || ''),
    ];
    
    const qtext = `INSERT INTO quiz_table(id, tense_id, question, options, correct_answer) VALUES (${this.dv(
      values[0]
    )}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])}, ${this.dv(values[4])})`;
    
    pool
      .query(qtext)
      .then((res) => {
        quiz.quiz_id = quizId;
        callback(quiz);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  UPDATE(quiz, callback) {
    const values = [
      quiz.quiz_id,
      getSyntaxe(quiz.quiz_name),
      getSyntaxe(quiz.questions),
    ];
    const qtext = `UPDATE quiz_table SET quiz_name = ${this.dv(
      values[1]
    )}, questions = ${this.dv(values[2])} WHERE id = ${this.dv(
      values[0]
    )}`;
    pool
      .query(qtext)
      .then((res) => callback(quiz))
      .catch((err) => this.ErrorHandling(err, callback));
  }

  SELECT(criteria, callback) {
    let qtext = `SELECT * FROM quiz_table`;
    
    // Add filter for tense_id if provided
    if (criteria.tense_id) {
      qtext = this.actq(qtext, "tense_id", criteria.tense_id);
    }
    
    // Add filter for quiz_name if provided
    if (criteria.quiz_name) {
      qtext = this.actq(qtext, "quiz_name", criteria.quiz_name);
    }

    // Add ordering if needed
    qtext += ` ORDER BY id ASC`;
    
    pool
      .query(qtext)
      .then((res) => {
        const result = res.rows.map((row) => new Quiz(null, row, null));
        callback(result);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  DELETE(quiz, callback) {
    const qtext = `DELETE FROM quiz_table WHERE id = $1`;
    const values = [quiz.quiz_id];
    pool
      .query(qtext, values)
      .then((res) => callback(res))
      .catch((err) => this.ErrorHandling(err, callback));
  }
}

module.exports = QuizDao;
