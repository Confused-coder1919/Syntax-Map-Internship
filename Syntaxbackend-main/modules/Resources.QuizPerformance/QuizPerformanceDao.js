// Import database connection
const pool = require('../../config/db_connect');

// Import uuid module
const { v4: uuidv4 } = require('uuid');

// Import model
const QuizPerformance = require('./QuizPerformance.js');

// Import Interface Dao
const InterfaceDao = require('../InterfaceDao.js');

// Import syntax parser
const getSyntaxe = require("../../parser/syntaxePostgres.js");

class QuizPerformanceDao extends InterfaceDao {
  constructor() {
    super();
  }

  INSERT(performance, callback) {
    console.log('QUIZ_PERFORMANCE_DAO - INSERT');
    
    // Generate a UUID if one is not provided
    const performanceId = performance.id || uuidv4();
    
    // Handle JSON data by ensuring it's properly stored as a PostgreSQL JSONB
    let incorrectQuestionData = this.prepareJsonData(performance.incorrect_question_data);
    let missedQuestions = this.prepareJsonData(performance.missed_questions);
    
    const values = [
      performanceId,
      performance.quiz_details_id,
      performance.tense_id,
      performance.user_id,
      performance.total_questions,
      performance.correct_answers,
      performance.incorrect_answers,
      performance.total_time_taken,
      performance.avg_time_per_question
    ];
    
    // Use parameterized query to prevent SQL injection
    const qtext = `
      INSERT INTO quiz_performance(
        id, 
        quiz_details_id, 
        tense_id, 
        user_id, 
        total_questions, 
        correct_answers, 
        incorrect_answers, 
        total_time_taken, 
        avg_time_per_question, 
        incorrect_question_data,
        missed_questions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`;
    
    console.log('SQL Query:', qtext);
    
    // Execute the query
    pool.query(qtext, [...values, incorrectQuestionData, missedQuestions])
      .then(res => {
        console.log('Database response:', res.rows[0]);
        performance.id = performanceId;
        callback(performance);
      })
      .catch(err => {
        console.error('Database error:', err);
        this.ErrorHandling(err, callback);
      });
  }

  UPDATE(performance, callback) {
    console.log('QUIZ_PERFORMANCE_DAO - UPDATE');
    
    // Handle JSON data
    let incorrectQuestionData = this.prepareJsonData(performance.incorrect_question_data);
    let missedQuestions = this.prepareJsonData(performance.missed_questions);
    
    const values = [
      performance.id,
      performance.quiz_details_id,
      performance.tense_id,
      performance.user_id,
      performance.total_questions,
      performance.correct_answers,
      performance.incorrect_answers,
      performance.total_time_taken,
      performance.avg_time_per_question,
      incorrectQuestionData,
      missedQuestions
    ];
    
    const qtext = `
      UPDATE quiz_performance SET 
        quiz_details_id = $2,
        tense_id = $3,
        user_id = $4,
        total_questions = $5,
        correct_answers = $6,
        incorrect_answers = $7,
        total_time_taken = $8,
        avg_time_per_question = $9,
        incorrect_question_data = $10,
        missed_questions = $11,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *`;
    
    console.log('SQL Query:', qtext);
    
    pool.query(qtext, values)
      .then(res => {
        if (res.rowCount === 0) {
          this.ErrorHandling({
            'code': '_1',
            'id': performance.id
          }, callback);
          return;
        }
        callback(performance);
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  SELECT(criteria, callback) {
    console.log('QUIZ_PERFORMANCE_DAO - SELECT');
    
    let queryParams = [];
    let whereConditions = [];
    let paramIndex = 1;
    
    // Build dynamic query based on criteria
    if (criteria.id) {
      whereConditions.push(`id = $${paramIndex++}`);
      queryParams.push(criteria.id);
    }
    if (criteria.quiz_details_id) {
      whereConditions.push(`quiz_details_id = $${paramIndex++}`);
      queryParams.push(criteria.quiz_details_id);
    }
    if (criteria.tense_id) {
      whereConditions.push(`tense_id = $${paramIndex++}`);
      queryParams.push(criteria.tense_id);
    }
    if (criteria.user_id) {
      whereConditions.push(`user_id = $${paramIndex++}`);
      queryParams.push(criteria.user_id);
    }

    // Construct the WHERE clause if conditions exist
    let whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Base query with all fields
    let qtext = `
      SELECT * FROM quiz_performance
      ${whereClause}
      ORDER BY created_at DESC`;
    
    // Apply limit if specified
    if (criteria.limit) {
      qtext += ` LIMIT $${paramIndex++}`;
      queryParams.push(parseInt(criteria.limit));
    }
    
    console.log('SQL Query:', qtext);
    console.log('Query params:', queryParams);
    
    pool.query(qtext, queryParams)
      .then(res => {
        let performances = [];
        res.rows.forEach(item => 
          performances.push(new QuizPerformance(null, item, null))
        );
        callback(performances);
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  DELETE(performance, callback) {
    console.log('QUIZ_PERFORMANCE_DAO - DELETE');
    
    const qtext = `DELETE FROM quiz_performance WHERE id = $1 RETURNING *`;
    
    pool.query(qtext, [performance.id])
      .then(res => {
        if (res.rowCount === 0) {
          this.ErrorHandling({
            'code': '_1',
            'id': performance.id
          }, callback);
          return;
        }
        callback({ success: true, message: `Quiz performance with ID ${performance.id} deleted successfully` });
      })
      .catch(err => {
        this.ErrorHandling(err, callback);
      });
  }

  // Get statistics about quiz performances for a specific user
  GET_USER_STATS(userId, callback) {
    console.log('QUIZ_PERFORMANCE_DAO - GET_USER_STATS');
    
    const qtext = `
      SELECT 
        user_id,
        COUNT(*)::integer as total_quizzes,
        SUM(total_questions)::integer as total_questions,
        SUM(correct_answers)::integer as total_correct,
        SUM(incorrect_answers)::integer as total_incorrect,
        ROUND(AVG(correct_answers * 100.0 / nullif(total_questions, 0))::numeric, 2) as avg_score_percentage,
        ROUND(AVG(avg_time_per_question)::numeric, 2) as avg_time_per_question,
        ROUND(AVG(total_time_taken)::numeric, 2) as avg_time_per_quiz
      FROM quiz_performance 
      WHERE user_id = $1
      GROUP BY user_id`;
    
    pool.query(qtext, [userId])
      .then(res => {
        const result = res.rows[0] || { 
          user_id: userId, 
          total_quizzes: 0,
          total_questions: 0,
          total_correct: 0,
          total_incorrect: 0,
          avg_score_percentage: 0,
          avg_time_per_question: 0,
          avg_time_per_quiz: 0
        };
        
        // Ensure numeric fields are returned as numbers, not strings
        if (result) {
          result.total_quizzes = parseInt(result.total_quizzes);
          result.total_questions = parseInt(result.total_questions);
          result.total_correct = parseInt(result.total_correct);
          result.total_incorrect = parseInt(result.total_incorrect);
          result.avg_score_percentage = parseFloat(result.avg_score_percentage);
          result.avg_time_per_question = parseFloat(result.avg_time_per_question);
          result.avg_time_per_quiz = parseFloat(result.avg_time_per_quiz);
        }
        
        callback(result);
      })
      .catch(err => {
        console.error('Error in GET_USER_STATS:', err);
        this.ErrorHandling(err, callback);
      });
  }

  // Get statistics by tense for a specific user
  GET_USER_TENSE_STATS(userId, callback) {
    console.log('QUIZ_PERFORMANCE_DAO - GET_USER_TENSE_STATS');
    
    const qtext = `
      SELECT 
        qp.user_id,
        qp.tense_id,
        t.tense_name,
        COUNT(*)::integer as quizzes_taken,
        SUM(qp.total_questions)::integer as total_questions,
        SUM(qp.correct_answers)::integer as total_correct,
        SUM(qp.incorrect_answers)::integer as total_incorrect,
        ROUND(AVG(qp.correct_answers * 100.0 / nullif(qp.total_questions, 0))::numeric, 2) as avg_score_percentage,
        ROUND(AVG(qp.avg_time_per_question)::numeric, 2) as avg_time_per_question
      FROM quiz_performance qp
      JOIN tense_table t ON qp.tense_id = t.id
      WHERE qp.user_id = $1
      GROUP BY qp.user_id, qp.tense_id, t.tense_name
      ORDER BY avg_score_percentage DESC`;
    
    pool.query(qtext, [userId])
      .then(res => {
        // Ensure numeric fields are returned as numbers, not strings
        const results = res.rows.map(row => {
          return {
            ...row,
            quizzes_taken: parseInt(row.quizzes_taken),
            total_questions: parseInt(row.total_questions),
            total_correct: parseInt(row.total_correct),
            total_incorrect: parseInt(row.total_incorrect),
            avg_score_percentage: parseFloat(row.avg_score_percentage),
            avg_time_per_question: parseFloat(row.avg_time_per_question)
          };
        });
        callback(results);
      })
      .catch(err => {
        console.error('Error in GET_USER_TENSE_STATS:', err);
        this.ErrorHandling(err, callback);
      });
  }

  // Helper function to prepare JSON data for PostgreSQL
  prepareJsonData(data) {
    if (!data) return '[]';
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }
}

module.exports = QuizPerformanceDao;