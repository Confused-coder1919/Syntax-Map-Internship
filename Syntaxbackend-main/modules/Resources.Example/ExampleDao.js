const pool = require("../../config/db_connect");
const Example = require("./Example");
const InterfaceDao = require("../InterfaceDao");
const getSyntaxe = require("../../parser/syntaxePostgres");
const { v4: uuidv4 } = require("uuid");

class ExampleDao extends InterfaceDao {
  constructor() {
    super();
  }

  INSERT(example, callback) {
    const exampleId = example.example_id || uuidv4();
    const values = [
      exampleId,
      getSyntaxe(example.example_text),
      example.tense_id,
      example.difficulty_level || 2,
      example.student_submission || false,
      example.teacher_reviewed || false,
      example.reviewer_id || null,
      example.review_date || null,
      example.submitter_id || example.user_id || null,
      example.submitted_date || new Date().toISOString(),
      example.user_id || null,
      example.shared_with_teacher || false,
      example.sentence_type || 'affirmative',
      example.teacher_feedback || null,
      example.created_at || new Date().toISOString()
    ];
    const qtext = `INSERT INTO example_table(
      id, 
      example_text, 
      tense_id, 
      difficulty_level, 
      student_submission, 
      teacher_reviewed, 
      reviewer_id, 
      review_date,
      submitter_id,
      submitted_date,
      user_id,
      shared_with_teacher,
      sentence_type,
      teacher_feedback,
      created_at
    ) VALUES (
      ${this.dv(values[0])}, 
      ${this.dv(values[1])}, 
      ${this.dv(values[2])}, 
      ${this.dv(values[3])}, 
      ${this.dv(values[4])}, 
      ${this.dv(values[5])}, 
      ${this.dv(values[6])}, 
      ${this.dv(values[7])},
      ${this.dv(values[8])},
      ${this.dv(values[9])},
      ${this.dv(values[10])},
      ${this.dv(values[11])},
      ${this.dv(values[12])},
      ${this.dv(values[13])},
      ${this.dv(values[14])}
    ) RETURNING *`;
    pool
      .query(qtext)
      .then((res) => {
        example.example_id = exampleId;
        callback(example);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  UPDATE(example, callback) {
    const values = [
      example.example_id,
      getSyntaxe(example.example_text),
      example.tense_id,
      example.difficulty_level,
      example.student_submission,
      example.teacher_reviewed,
      example.reviewer_id,
      example.review_date,
      example.submitter_id || example.user_id,
      example.user_id,
      example.shared_with_teacher !== undefined ? example.shared_with_teacher : false,
      example.sentence_type || 'affirmative',
      example.teacher_feedback
    ];
    const qtext = `UPDATE example_table SET 
      example_text = ${this.dv(values[1])}, 
      tense_id = ${this.dv(values[2])},
      difficulty_level = ${this.dv(values[3])}, 
      student_submission = ${this.dv(values[4])}, 
      teacher_reviewed = ${this.dv(values[5])}, 
      reviewer_id = ${this.dv(values[6])}, 
      review_date = ${this.dv(values[7])},
      submitter_id = ${this.dv(values[8])},
      user_id = ${this.dv(values[9])},
      shared_with_teacher = ${this.dv(values[10])},
      sentence_type = ${this.dv(values[11])},
      teacher_feedback = ${this.dv(values[12])}
      WHERE id = ${this.dv(values[0])}`;
    pool
      .query(qtext)
      .then((res) => callback(example))
      .catch((err) => this.ErrorHandling(err, callback));
  }

  SELECT(criteria, callback) {
    let qtext = `SELECT * FROM example_table`;
    if (criteria.id || criteria.example_id)
      qtext = this.actq(qtext, "id", criteria.id || criteria.example_id);
    if (criteria.tense_id)
      qtext = this.actq(qtext, "tense_id", criteria.tense_id);
    if (criteria.difficulty_level)
      qtext = this.actq(qtext, "difficulty_level", criteria.difficulty_level);
    if (criteria.student_submission !== undefined)
      qtext = this.actq(qtext, "student_submission", criteria.student_submission);
    if (criteria.teacher_reviewed !== undefined)
      qtext = this.actq(qtext, "teacher_reviewed", criteria.teacher_reviewed);
    if (criteria.submitter_id)
      qtext = this.actq(qtext, "submitter_id", criteria.submitter_id);
    if (criteria.user_id)
      qtext = this.actq(qtext, "user_id", criteria.user_id);
    if (criteria.shared_with_teacher !== undefined)
      qtext = this.actq(qtext, "shared_with_teacher", criteria.shared_with_teacher);
    if (criteria.sentence_type)
      qtext = this.actq(qtext, "sentence_type", criteria.sentence_type);
      
    // Add support for filtering by multiple difficulty levels
    if (criteria.difficulty_levels && Array.isArray(criteria.difficulty_levels) && criteria.difficulty_levels.length > 0) {
      if (qtext.includes("WHERE"))
        qtext += ` AND difficulty_level IN (${criteria.difficulty_levels.join(',')})`;
      else
        qtext += ` WHERE difficulty_level IN (${criteria.difficulty_levels.join(',')})`;
    }
    
    // Add ORDER BY clause if specified
    if (criteria.orderBy) {
      qtext += ` ORDER BY ${criteria.orderBy}`;
      if (criteria.orderDirection) {
        qtext += ` ${criteria.orderDirection}`;
      }
    } else {
      // Default ordering
      qtext += ` ORDER BY created_at DESC`;
    }
    
    pool
      .query(qtext)
      .then((res) => {
        const result = res.rows.map((row) => new Example(null, row, null));
        callback(result);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  DELETE(criteria, callback) {
    let qtext = `DELETE FROM example_table`;
    if (criteria.id || criteria.example_id) {
      qtext += ` WHERE id = $1`;
      const values = [criteria.id || criteria.example_id];
      pool
        .query(qtext, values)
        .then((res) => callback({ success: true, deleted: true, id: criteria.id || criteria.example_id }))
        .catch((err) => this.ErrorHandling(err, callback));
    } else if (criteria.user_id && criteria.tense_id) {
      qtext += ` WHERE user_id = $1 AND tense_id = $2`;
      const values = [criteria.user_id, criteria.tense_id];
      pool
        .query(qtext, values)
        .then((res) => callback({ success: true, deleted: true, count: res.rowCount }))
        .catch((err) => this.ErrorHandling(err, callback));
    } else {
      this.ErrorHandling({ message: "DELETE requires either id or both user_id and tense_id" }, callback);
    }
  }
  
  // New method to get examples pending teacher review
  GET_PENDING_REVIEWS(callback) {
    const qtext = `
      SELECT e.*, u.user_name as submitter_name 
      FROM example_table e
      LEFT JOIN user_table u ON e.submitter_id = u.user_id OR e.user_id = u.user_id
      WHERE e.student_submission = true 
      AND e.teacher_reviewed = false 
      ORDER BY e.submitted_date DESC
    `;
    pool
      .query(qtext)
      .then((res) => {
        const result = res.rows.map((row) => {
          const example = new Example(null, row, null);
          // Add submitter name as a separate property
          example.submitter_name = row.submitter_name;
          return example;
        });
        callback(result);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Get shared examples with teacher
  GET_SHARED_EXAMPLES(callback) {
    const qtext = `
      SELECT e.*, u.user_name as submitter_name, t.tense_name
      FROM example_table e
      LEFT JOIN user_table u ON e.user_id = u.user_id OR e.submitter_id = u.user_id
      LEFT JOIN tense_table t ON e.tense_id = t.tense_id
      WHERE e.shared_with_teacher = true 
      ORDER BY e.created_at DESC
    `;
    pool
      .query(qtext)
      .then((res) => {
        const result = res.rows.map((row) => {
          const example = new Example(null, row, null);
          // Add submitter name and tense name as separate properties
          example.submitter_name = row.submitter_name;
          example.tense_name = row.tense_name;
          return example;
        });
        callback(result);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Review a student example
  REVIEW_EXAMPLE(exampleId, reviewerId, approved, feedback, callback) {
    const now = new Date().toISOString();
    
    const qtext = `
      UPDATE example_table SET
      teacher_reviewed = true,
      reviewer_id = $1,
      review_date = $2,
      teacher_feedback = $3
      WHERE id = $4
      RETURNING *
    `;
    const values = [reviewerId, now, feedback || null, exampleId];
    
    pool
      .query(qtext, values)
      .then((res) => {
        if (res.rows.length > 0) {
          const example = new Example(null, res.rows[0], null);
          callback(example);
        } else {
          this.ErrorHandling({ message: "Example not found" }, callback);
        }
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Share/unshare example with teachers
  TOGGLE_SHARE_WITH_TEACHER(exampleId, isShared, callback) {
    const qtext = `
      UPDATE example_table SET
      shared_with_teacher = $1
      WHERE id = $2
      RETURNING *
    `;
    const values = [isShared, exampleId];
    
    pool
      .query(qtext, values)
      .then((res) => {
        if (res.rows.length > 0) {
          const example = new Example(null, res.rows[0], null);
          callback(example);
        } else {
          this.ErrorHandling({ message: "Example not found" }, callback);
        }
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Get statistics about examples for teacher/admin dashboard
  GET_STATISTICS(callback) {
    const query = `
      SELECT 
        COUNT(*) as total_examples,
        SUM(CASE WHEN student_submission = true THEN 1 ELSE 0 END) as student_submissions,
        SUM(CASE WHEN student_submission = true AND teacher_reviewed = true THEN 1 ELSE 0 END) as approved_student_submissions,
        SUM(CASE WHEN student_submission = true AND teacher_reviewed = false THEN 1 ELSE 0 END) as pending_reviews,
        SUM(CASE WHEN shared_with_teacher = true THEN 1 ELSE 0 END) as shared_with_teachers,
        COUNT(DISTINCT tense_id) as tenses_covered,
        COUNT(DISTINCT COALESCE(user_id, submitter_id)) as unique_student_contributors,
        AVG(difficulty_level) as average_difficulty
      FROM example_table
    `;
    
    pool
      .query(query)
      .then((res) => {
        callback(res.rows[0]);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
}

module.exports = ExampleDao;
