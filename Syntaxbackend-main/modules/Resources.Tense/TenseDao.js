const pool = require("../../config/db_connect");
const Tense = require("./Tense");
const InterfaceDao = require("../InterfaceDao");
const getSyntaxe = require("../../parser/syntaxePostgres");
const { v4: uuidv4 } = require("uuid");

class TenseDao extends InterfaceDao {
  constructor() {
    super();
  }

  INSERT(tense, callback) {
    const tenseId = uuidv4();
    const values = [
      tenseId,
      getSyntaxe(tense.tense_name),
      getSyntaxe(tense.description),
      getSyntaxe(tense.time_group),
      getSyntaxe(tense.subcategory),
      getSyntaxe(tense.grammar_rules),
      getSyntaxe(tense.example_structure),
      getSyntaxe(tense.usage_notes),
      tense.difficulty_level || 3,
      tense.active !== undefined ? tense.active : true
    ];
    const qtext = `INSERT INTO tense_table(
      id, 
      tense_name, 
      tense_description, 
      time_group, 
      subcategory, 
      grammar_rules, 
      example_structure, 
      usage_notes, 
      difficulty_level, 
      active
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
      ${this.dv(values[9])}
    ) RETURNING *`;
    
    pool
      .query(qtext)
      .then((res) => {
        tense.tense_id = tenseId;
        callback(tense);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  UPDATE(tense, callback) {
    // Make sure we have all required fields
    if (!tense.tense_id) {
      return this.ErrorHandling({code: '_2', message: 'Missing tense_id'}, callback);
    }

    console.log("UPDATE: Received tense data:", JSON.stringify(tense, null, 2));

    const values = [
      tense.tense_id,
      getSyntaxe(tense.tense_name),
      // Handle both tense_description and description to make the API more flexible
      getSyntaxe(tense.tense_description || tense.description),
      getSyntaxe(tense.time_group),
      getSyntaxe(tense.subcategory),
      getSyntaxe(tense.grammar_rules),
      getSyntaxe(tense.example_structure),
      getSyntaxe(tense.usage_notes),
      tense.difficulty_level || 3,
      tense.active !== undefined ? tense.active : true
    ];
    
    console.log("UPDATE: Prepared values:", values);
    
    const qtext = `UPDATE tense_table SET 
      tense_name = ${this.dv(values[1])}, 
      tense_description = ${this.dv(values[2])},
      time_group = ${this.dv(values[3])},
      subcategory = ${this.dv(values[4])},
      grammar_rules = ${this.dv(values[5])},
      example_structure = ${this.dv(values[6])},
      usage_notes = ${this.dv(values[7])},
      difficulty_level = ${this.dv(values[8])},
      active = ${this.dv(values[9])}
      WHERE id = ${this.dv(values[0])} RETURNING *`;
    
    console.log("UPDATE: SQL Query:", qtext);
    
    pool
      .query(qtext)
      .then((res) => {
        console.log("UPDATE: Database response:", res.rows);
        if (res.rows && res.rows.length > 0) {
          // Return the updated tense from database
          const updatedTense = new Tense(null, res.rows[0], null);
          callback(updatedTense);
        } else {
          callback(tense);
        }
      })
      .catch((err) => {
        console.error("UPDATE: Database error:", err);
        this.ErrorHandling(err, callback);
      });
  }

  SELECT(criteria, callback) {
    let qtext = `SELECT * FROM tense_table`;
    
    // Basic filtering
    if (criteria.tense_name)
      qtext = this.actq(qtext, "tense_name", criteria.tense_name);
    if (criteria.tense_id)
      qtext = this.actq(qtext, "id", criteria.tense_id);
    if (criteria.time_group)
      qtext = this.actq(qtext, "time_group", criteria.time_group);
    if (criteria.subcategory)
      qtext = this.actq(qtext, "subcategory", criteria.subcategory);
    if (criteria.active !== undefined)
      qtext = this.actq(qtext, "active", criteria.active);
    
    // Advanced filtering - by difficulty range
    if (criteria.min_difficulty && criteria.max_difficulty) {
      if (qtext.includes("WHERE"))
        qtext += ` AND difficulty_level BETWEEN ${parseInt(criteria.min_difficulty)} AND ${parseInt(criteria.max_difficulty)}`;
      else
        qtext += ` WHERE difficulty_level BETWEEN ${parseInt(criteria.min_difficulty)} AND ${parseInt(criteria.max_difficulty)}`;
    } else if (criteria.min_difficulty) {
      if (qtext.includes("WHERE"))
        qtext += ` AND difficulty_level >= ${parseInt(criteria.min_difficulty)}`;
      else
        qtext += ` WHERE difficulty_level >= ${parseInt(criteria.min_difficulty)}`;
    } else if (criteria.max_difficulty) {
      if (qtext.includes("WHERE"))
        qtext += ` AND difficulty_level <= ${parseInt(criteria.max_difficulty)}`;
      else
        qtext += ` WHERE difficulty_level <= ${parseInt(criteria.max_difficulty)}`;
    }
    
    // Add ORDER BY clause if specified
    if (criteria.orderBy) {
      qtext += ` ORDER BY ${criteria.orderBy}`;
      if (criteria.orderDirection) {
        qtext += ` ${criteria.orderDirection}`;
      }
    } else {
      // Default ordering
      qtext += ` ORDER BY time_group ASC, subcategory ASC`;
    }
    
    pool
      .query(qtext)
      .then((res) => {
        const result = res.rows.map((row) => new Tense(null, row, null));
        callback(result);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  DELETE(tense, callback) {
    // Start by deleting from the associated tables
    const deleteQuizQuestionsQuery = `DELETE FROM quiz_table WHERE tense_id = $1`;
    const deleteExamplesQuery = `DELETE FROM example_table WHERE tense_id = $1`;
    const deleteTenseQuery = `DELETE FROM tense_table WHERE id = $1`;

    const values = [tense.tense_id];

    // Begin a transaction to ensure atomicity (all queries succeed or fail together)
    pool
      .query("BEGIN")
      .then(() => {
        // Delete associated quiz questions
        return pool.query(deleteQuizQuestionsQuery, values);
      })
      .then(() => {
        // Delete associated examples
        return pool.query(deleteExamplesQuery, values);
      })
      .then(() => {
        // Delete the tense itself
        return pool.query(deleteTenseQuery, values);
      })
      .then((res) => {
        // Commit the transaction if all queries succeed
        return pool.query("COMMIT");
      })
      .then(() =>
        callback({
          success: true,
          message: "Tense and associated data deleted successfully.",
        })
      )
      .catch((err) => {
        // Rollback the transaction in case of an error
        pool.query("ROLLBACK").then(() => this.ErrorHandling(err, callback));
      });
  }
  
  // Fetch examples for a specific tense
  FETCH_EXAMPLES(tenseId, callback) {
    const qtext = `SELECT * FROM example_table WHERE tense_id = $1`;
    const values = [tenseId];
    pool
      .query(qtext, values)
      .then((res) => {
        callback(res.rows);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  // Fetch quizzes for a specific tense
  FETCH_QUIZZES(tenseId, callback) {
    const qtext = `SELECT * FROM quiz_table WHERE tense_id = $1`;
    const values = [tenseId];
    pool
      .query(qtext, values)
      .then((res) => {
        callback(res.rows);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Get the full tense map structure
  GET_TENSE_MAP(callback) {
    const qtext = `
      SELECT 
        time_group,
        json_agg(
          json_build_object(
            'id', id,
            'tense_name', tense_name,
            'description', tense_description,
            'subcategory', subcategory,
            'difficulty_level', difficulty_level
          ) ORDER BY subcategory
        ) as tenses
      FROM tense_table
      WHERE active = true
      GROUP BY time_group
      ORDER BY 
        CASE 
          WHEN time_group = 'Present' THEN 1
          WHEN time_group = 'Past' THEN 2
          WHEN time_group = 'Future' THEN 3
          ELSE 4
        END
    `;
    
    pool
      .query(qtext)
      .then((res) => {
        callback(res.rows);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Get a full tense with all related examples
  GET_TENSE_WITH_EXAMPLES(tenseId, callback) {
    // First get the tense details
    const tenseQuery = `SELECT * FROM tense_table WHERE id = $1`;
    
    // Then get the examples categorized by type (affirmative, negative, interrogative)
    const examplesQuery = `
      SELECT 
        example_text,
        sentence_type,
        difficulty_level,
        student_submission,
        teacher_reviewed
      FROM example_table
      WHERE tense_id = $1 AND teacher_reviewed = true
      ORDER BY sentence_type, difficulty_level
    `;
    
    const values = [tenseId];
    
    pool.query(tenseQuery, values)
      .then((tenseResult) => {
        if (tenseResult.rows.length === 0) {
          return callback({ error: "Tense not found" });
        }
        
        const tense = new Tense(null, tenseResult.rows[0], null);
        
        // Now get the examples
        return pool.query(examplesQuery, values)
          .then((examplesResult) => {
            // Group examples by sentence type
            const groupedExamples = {
              affirmative: [],
              negative: [],
              interrogative: []
            };
            
            examplesResult.rows.forEach(ex => {
              const type = ex.sentence_type || 'affirmative';
              if (groupedExamples[type]) {
                groupedExamples[type].push(ex);
              } else {
                groupedExamples.affirmative.push(ex);
              }
            });
            
            // Combine tense with examples
            const result = {
              ...tense.toObject(),
              examples: groupedExamples
            };
            
            callback(result);
          });
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }
  
  // Get comprehensive tense statistics for a user
  GET_TENSE_STATS(userId, tenseId, callback) {
    // First try to get data from user_progress table
    const progressQuery = `
      SELECT 
        up.completion_percentage,
        up.quiz_avg_score,
        up.examples_submitted,
        up.examples_correct,
        up.is_completed,
        up.updated_at as last_activity
      FROM user_progress up
      WHERE up.user_id = $1 AND up.tense_id = $2
    `;

    // Fallback query from quiz_performance if user_progress doesn't exist
    const fallbackProgressQuery = `
      SELECT 
        ROUND(AVG(qp.correct_answers * 100.0 / NULLIF(qp.total_questions, 0)), 2) AS quiz_avg_score,
        SUM(qp.correct_answers) AS examples_correct,
        SUM(qp.total_questions) AS examples_submitted,
        MAX(qp.created_at) AS last_activity,
        COUNT(DISTINCT qp.id) AS quiz_count
      FROM quiz_performance qp
      WHERE qp.user_id = $1 AND qp.tense_id = $2
    `;

    const studyTimeQuery = `
      SELECT 
        COALESCE(SUM(ula.total_time_spent), 0) as total_study_time_seconds,
        COUNT(DISTINCT ula.session_date) as study_sessions,
        MAX(ula.session_date) as last_study_date
      FROM user_learning_activity ula
      WHERE ula.user_id = $1 
      AND (
        ula.tenses_practiced::jsonb ? $2 OR
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(ula.tenses_practiced) elem 
          WHERE elem->>'tense_id' = $2
        )
      )
    `;

    const examplesQuery = `
      SELECT 
        COUNT(*) as total_examples,
        COUNT(CASE WHEN user_id = $1 THEN 1 END) as user_examples,
        COUNT(CASE WHEN teacher_reviewed = true THEN 1 END) as approved_examples
      FROM example_table 
      WHERE tense_id = $2
    `;

    const values = [userId, tenseId];
    
    // Try main progress query first
    pool.query(progressQuery, values)
      .then((progressResult) => {
        let progressData = null;
        let useProgressTable = false;

        if (progressResult.rows && progressResult.rows.length > 0) {
          progressData = progressResult.rows[0];
          useProgressTable = true;
        }

        // If no data from user_progress, try quiz_performance fallback
        const finalProgressPromise = useProgressTable 
          ? Promise.resolve(progressData)
          : pool.query(fallbackProgressQuery, values).then((fallbackResult) => {
              if (fallbackResult.rows && fallbackResult.rows.length > 0) {
                const row = fallbackResult.rows[0];
                // Calculate completion percentage from quiz data
                const completionPercentage = Math.min(
                  Math.round((parseFloat(row.quiz_avg_score) || 0) * 0.8 + (parseInt(row.quiz_count) || 0) * 5),
                  100
                );
                
                return {
                  completion_percentage: completionPercentage,
                  quiz_avg_score: parseFloat(row.quiz_avg_score) || 0,
                  examples_submitted: parseInt(row.examples_submitted) || 0,
                  examples_correct: parseInt(row.examples_correct) || 0,
                  is_completed: completionPercentage >= 90,
                  last_activity: row.last_activity
                };
              }
              return {
                completion_percentage: 0,
                quiz_avg_score: 0,
                examples_submitted: 0,
                examples_correct: 0,
                is_completed: false,
                last_activity: null
              };
            });

        // Execute remaining queries in parallel
        return Promise.all([
          finalProgressPromise,
          pool.query(studyTimeQuery, values),
          pool.query(examplesQuery, [userId, tenseId])
        ]);
      })
      .then(([progressData, studyTimeResult, examplesResult]) => {
        const stats = {
          // Completion data
          completion_percentage: progressData.completion_percentage || 0,
          
          // Average score
          average_score: progressData.quiz_avg_score || 0,
          
          // Study time
          total_study_time_seconds: parseInt(studyTimeResult.rows[0]?.total_study_time_seconds) || 0,
          study_sessions: parseInt(studyTimeResult.rows[0]?.study_sessions) || 0,
          last_study_date: studyTimeResult.rows[0]?.last_study_date,
          
          // Examples
          total_examples: parseInt(examplesResult.rows[0]?.total_examples) || 0,
          user_examples: parseInt(examplesResult.rows[0]?.user_examples) || 0,
          approved_examples: parseInt(examplesResult.rows[0]?.approved_examples) || 0,
          examples_submitted: progressData.examples_submitted || 0,
          examples_correct: progressData.examples_correct || 0,
          
          // Additional metadata
          is_completed: progressData.is_completed || false,
          last_activity: progressData.last_activity
        };

        // Format study time for display
        stats.formatted_study_time = this.formatStudyTime(stats.total_study_time_seconds);
        
        callback(stats);
      })
      .catch((err) => {
        console.error("Error fetching tense stats:", err);
        // Return default stats on error
        const defaultStats = {
          completion_percentage: 0,
          average_score: 0,
          total_study_time_seconds: 0,
          study_sessions: 0,
          last_study_date: null,
          total_examples: 0,
          user_examples: 0,
          approved_examples: 0,
          examples_submitted: 0,
          examples_correct: 0,
          is_completed: false,
          last_activity: null,
          formatted_study_time: "0m"
        };
        callback(defaultStats);
      });
  }

  // Helper method to format study time
  formatStudyTime(seconds) {
    if (seconds === 0) return "0m";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

module.exports = TenseDao;
