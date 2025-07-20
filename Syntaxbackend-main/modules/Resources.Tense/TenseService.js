const TenseDao = require("./TenseDao");
const ExampleDao = require("../Resources.Example/ExampleDao");
const QuizDao = require("../Resources.Quiz/QuizDao");
const { v4: uuidv4 } = require("uuid");

class TenseService {
  #tenseDao = new TenseDao();
  #exampleDao = new ExampleDao();
  #quizDao = new QuizDao();

  INSERT(bodyNewTense, callback) {
    if (bodyNewTense) {
      this.#tenseDao.INSERT(bodyNewTense, callback);
    } else {
      this.#tenseDao.ErrorHandling({ code: null }, callback);
    }
  }

  UPDATE(tense, callback) {
    console.log("🔄 TenseService UPDATE: Received tense data:", JSON.stringify(tense, null, 2));
    
    // First update the tense itself
    this.#tenseDao.UPDATE(tense, (updatedTense) => {
      console.log("✅ TenseService UPDATE: DAO response:", updatedTense);
      
      // If there was an error updating the tense, return immediately
      if (updatedTense.error || updatedTense.code) {
        console.error("❌ TenseService UPDATE: Error from DAO:", updatedTense);
        return callback(updatedTense);
      }

      // Track pending operations
      let pendingOperations = 0;
      let operationComplete = () => {
        pendingOperations--;
        console.log("TenseService UPDATE: Operation completed, pending:", pendingOperations);
        if (pendingOperations === 0) {
          // All operations completed, return the updated tense
          console.log("TenseService UPDATE: All operations completed, returning:", updatedTense);
          callback(updatedTense);
        }
      };

      // If examples are provided, update them
      if (tense.examples && Array.isArray(tense.examples)) {
        console.log("TenseService UPDATE: Updating examples, count:", tense.examples.length);
        pendingOperations++;
        // First delete existing examples
        this.#deleteExamplesForTense(tense.tense_id, () => {
          // Then insert new examples
          this.#insertExamplesForTense(tense.tense_id, tense.examples, () => {
            console.log("TenseService UPDATE: Examples update completed");
            operationComplete();
          });
        });
      }

      // If quizzes are provided, update them
      if (tense.quizzes && Array.isArray(tense.quizzes)) {
        console.log("TenseService UPDATE: Updating quizzes, count:", tense.quizzes.length);
        pendingOperations++;
        // First delete existing quizzes
        this.#deleteQuizzesForTense(tense.tense_id, () => {
          // Then insert new quizzes
          this.#insertQuizzesForTense(tense.tense_id, tense.quizzes, () => {
            console.log("TenseService UPDATE: Quizzes update completed");
            operationComplete();
          });
        });
      }

      // If no examples or quizzes to update, return immediately
      if (pendingOperations === 0) {
        console.log("TenseService UPDATE: No additional operations needed, returning immediately");
        callback(updatedTense);
      }
    });
  }

  // Helper method to delete all examples for a tense
  #deleteExamplesForTense(tenseId, callback) {
    const query = `DELETE FROM example_table WHERE tense_id = $1`;
    const pool = require("../../config/db_connect");
    pool
      .query(query, [tenseId])
      .then(() => callback())
      .catch((err) => {
        console.error("Error deleting examples:", err);
        callback();
      });
  }

  // Helper method to insert examples for a tense
  #insertExamplesForTense(tenseId, examples, callback) {
    let completed = 0;
    const total = examples.length;
    
    // If no examples to insert, just return
    if (total === 0) {
      return callback();
    }

    examples.forEach(example => {
      // Check if the example is a string or an object
      const exampleObj = typeof example === 'object' ? {
        // If it's an object, extract the example_text and other properties
        example_text: example.example_text || '',
        difficulty_level: example.difficulty_level || 3,
        tense_id: tenseId,
        student_submission: false,
        teacher_reviewed: true
        // Removed sentence_type since it doesn't exist in your database
      } : {
        // If it's a string, use it directly as example_text
        example_text: example,
        difficulty_level: 3, // Default difficulty
        tense_id: tenseId,
        student_submission: false,
        teacher_reviewed: true
        // Removed sentence_type since it doesn't exist in your database
      };
      
      // Insert the properly formatted example
      this.#exampleDao.INSERT(exampleObj, () => {
        completed++;
        if (completed === total) {
          callback();
        }
      });
    });
  }

  // Helper method to delete all quizzes for a tense
  #deleteQuizzesForTense(tenseId, callback) {
    const query = `DELETE FROM quiz_table WHERE tense_id = $1`;
    const pool = require("../../config/db_connect");
    pool
      .query(query, [tenseId])
      .then(() => callback())
      .catch((err) => {
        console.error("Error deleting quizzes:", err);
        callback();
      });
  }

  // Helper method to insert quizzes for a tense
  #insertQuizzesForTense(tenseId, quizzes, callback) {
    let completed = 0;
    const total = quizzes.length;
    
    // If no quizzes to insert, just return
    if (total === 0) {
      return callback();
    }

    quizzes.forEach(quiz => {
      // Create a new quiz object with proper tense_id
      const quizObj = {
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.correct_answer,
        question_type: quiz.question_type || 'mcq', // Add question_type if provided
        tense_id: tenseId  // Explicitly set tense_id here
      };
      
      this.#quizDao.INSERT(quizObj, (result) => {
        completed++;
        if (completed === total) {
          callback();
        }
      });
    });
  }

  SELECT(criteria, callback) {
    if (criteria) {
      this.#tenseDao.SELECT(criteria, callback);
    } else {
      this.#tenseDao.ErrorHandling({ code: null }, callback);
    }
  }

  DELETE(tense, callback) {
    this.#tenseDao.DELETE(tense, callback);
  }

  // Fetch examples for a specific tense
  FETCH_EXAMPLES(tenseId, callback) {
    if (tenseId) {
      this.#tenseDao.FETCH_EXAMPLES(tenseId, callback);
    } else {
      this.#tenseDao.ErrorHandling({ code: null }, callback);
    }
  }

  // Fetch quizzes for a specific tense
  FETCH_QUIZZES(tenseId, callback) {
    if (tenseId) {
      this.#tenseDao.FETCH_QUIZZES(tenseId, callback);
    } else {
      this.#tenseDao.ErrorHandling({ code: null }, callback);
    }
  }
  
  // Get the tense map with role-based filtering
  GET_TENSE_MAP(userRole, callback) {
    // All user roles can access the tense map
    this.#tenseDao.GET_TENSE_MAP((tenseMap) => {
      if (!tenseMap) {
        return callback([]);
      }
      
      // For Guest users (role 4), limit the amount of information returned
      if (userRole === 4) {
        // Remove detailed information and only keep basic data
        const limitedTenseMap = tenseMap.map(group => {
          // For each group, filter the tenses to show only basics
          const filteredTenses = group.tenses.map(tense => ({
            id: tense.id,
            tense_name: tense.tense_name,
            subcategory: tense.subcategory
          }));
          
          return {
            time_group: group.time_group,
            tenses: filteredTenses
          };
        });
        
        callback(limitedTenseMap);
      } else {
        // For registered users, return the full tense map
        callback(tenseMap);
      }
    });
  }
  
  // Get a tense with examples with role-based access control
  GET_TENSE_WITH_EXAMPLES(tenseId, userRole, callback) {
    if (!tenseId) {
      return this.#tenseDao.ErrorHandling({
        code: 'INVALID_REQUEST',
        message: 'Tense ID is required'
      }, callback);
    }
    
    this.#tenseDao.GET_TENSE_WITH_EXAMPLES(tenseId, (result) => {
      // If error or tense not found, return directly
      if (result.error) {
        return callback(result);
      }
      
      // For Guest users (role 4), limit the information
      if (userRole === 4) {
        // Remove certain fields that are only for registered users
        const limitedResult = {
          tense_id: result.tense_id,
          tense_name: result.tense_name,
          time_group: result.time_group,
          subcategory: result.subcategory,
          description: result.description,
          // Limited examples - only show 2 of each type
          examples: {
            affirmative: result.examples.affirmative.slice(0, 2),
            negative: result.examples.negative.slice(0, 2),
            interrogative: result.examples.interrogative.slice(0, 2)
          }
        };
        
        return callback(limitedResult);
      } else {
        // Return full data for registered users
        return callback(result);
      }
    });
  }
  
  // Admin-only: Toggle tense active status
  TOGGLE_TENSE_ACTIVE_STATUS(tenseId, active, userRole, callback) {
    // Only allow admins to toggle active status
    if (userRole !== 1) {
      return this.#tenseDao.ErrorHandling({
        code: 'UNAUTHORIZED',
        message: 'Only admins can change tense active status'
      }, callback);
    }
    
    if (!tenseId) {
      return this.#tenseDao.ErrorHandling({
        code: 'INVALID_REQUEST',
        message: 'Tense ID is required'
      }, callback);
    }
    
    // First get the tense
    this.#tenseDao.SELECT({ tense_id: tenseId }, (tenses) => {
      if (!tenses || tenses.length === 0) {
        return callback({ error: "Tense not found" });
      }
      
      const tense = tenses[0];
      // Update the active status
      tense.active = active;
      
      // Save the updated tense
      this.#tenseDao.UPDATE(tense, callback);
    });
  }
  
  // Get all tenses for admin dashboard with stats
  GET_ADMIN_TENSE_DASHBOARD(userRole, callback) {
    // Only allow admins and teachers to access this
    if (userRole !== 1 && userRole !== 2) {
      return this.#tenseDao.ErrorHandling({
        code: 'UNAUTHORIZED',
        message: 'Only admins and teachers can access this data'
      }, callback);
    }
    
    // Get all tenses
    this.#tenseDao.SELECT({}, (tenses) => {
      if (!tenses) {
        return callback([]);
      }
      
      // For each tense, get the count of examples and quizzes
      let completed = 0;
      const results = [];
      
      tenses.forEach(tense => {
        const tenseId = tense.tense_id;
        
        // Get examples count
        this.#tenseDao.FETCH_EXAMPLES(tenseId, (examples) => {
          // Get quizzes count
          this.#tenseDao.FETCH_QUIZZES(tenseId, (quizzes) => {
            // Add stats to the tense object
            const tenseWithStats = {
              ...tense.toObject(),
              examples_count: examples ? examples.length : 0,
              quizzes_count: quizzes ? quizzes.length : 0
            };
            
            results.push(tenseWithStats);
            
            completed++;
            if (completed === tenses.length) {
              // All tenses processed, return the results
              callback(results);
            }
          });
        });
      });
    });
  }
  
  // Get comprehensive tense statistics for a user
  GET_TENSE_STATS(userId, tenseId, callback) {
    if (!userId || !tenseId) {
      return this.#tenseDao.ErrorHandling({
        code: 'INVALID_REQUEST',
        message: 'User ID and Tense ID are required'
      }, callback);
    }

    this.#tenseDao.GET_TENSE_STATS(userId, tenseId, (stats) => {
      if (stats.error || stats.code) {
        return callback(stats);
      }

      // Add calculated fields
      if (stats.examples_submitted > 0) {
        stats.examples_accuracy = Math.round((stats.examples_correct / stats.examples_submitted) * 100);
      } else {
        stats.examples_accuracy = 0;
      }

      // Calculate proficiency level based on completion and average score
      let proficiency_level = "Beginner";
      if (stats.completion_percentage >= 90 && stats.average_score >= 8) {
        proficiency_level = "Advanced";
      } else if (stats.completion_percentage >= 70 && stats.average_score >= 6) {
        proficiency_level = "Intermediate";
      } else if (stats.completion_percentage >= 30 && stats.average_score >= 4) {
        proficiency_level = "Developing";
      }
      
      stats.proficiency_level = proficiency_level;

      callback(stats);
    });
  }
}

module.exports = TenseService;
