const { v4: uuidv4 } = require('uuid');
const jwtDecode = require("jwt-decode");
const passport = require('passport');
const ProgressService = require('../modules/Resources.Progress/ProgressService');

module.exports = (app) => {
  // Initialize service
  const progressService = new ProgressService();

  // Helper function to extract user ID from authorization token
  const extractUserId = (req) => {
    try {
      if (!req.get('Authorization')) {
        return null;
      }

      const token = req.get('Authorization').split(' ')[1];
      const decoded = jwtDecode(token);

      return decoded.sub || decoded.user_id;
    } catch (error) {
      console.error('Error extracting user ID:', error);
      return null;
    }
  };  // Helper function to extract user role from token
  const extractUserRole = (req) => {
    try {
      if (!req.get('Authorization')) {
        console.log('⚠️ No Authorization header found');
        return 4; // Default to guest role (4)
      }
      
      const token = req.get('Authorization').split(' ')[1];
      const decoded = jwtDecode(token);
      console.log('🔑 Token decoded:', JSON.stringify(decoded));
      
      // First check 'authorization' field which is in new token format
      if (decoded.authorization !== undefined) {
        const role = parseInt(decoded.authorization, 10);
        console.log(`👤 Role from authorization field: ${role}`);
        return role;
      }
      
      // Then check if user_role is available (older token format)
      if (decoded.user_role !== undefined) {
        const role = parseInt(decoded.user_role, 10);
        console.log(`👤 Role from user_role field: ${role}`);
        return role;
      }
      
      console.log('⚠️ No role found in token data:', decoded);
      return 4; // Default to guest if role not in token
    } catch (error) {
      console.error('Error extracting user role:', error);
      return 4; // Default to guest on error
    }
  };

  // Calculate stats for student progress
  const calculateProgressStats = (progressData) => {
    // Handle null or undefined progressData
    const progress = Array.isArray(progressData) ? progressData : [];
    
    // Default stats object
    const stats = {
      overall_completion: 0,
      tenses_started: 0,
      tenses_completed: 0,
      quiz_avg_score: 0,
      examples_submitted: 0,
      examples_correct: 0,
      accuracy_percentage: 0,
      last_activity: null,
      recent_tenses: []
    };
    
    if (progress.length === 0) {
      return stats;
    }
    
    // Count tenses
    stats.tenses_started = progress.length;
    stats.tenses_completed = progress.filter(item => item.is_completed).length;
    
    // Calculate overall completion percentage
    const totalCompletion = progress.reduce((sum, item) => sum + (item.completion_percentage || 0), 0);
    stats.overall_completion = progress.length > 0 ? Math.round(totalCompletion / progress.length) : 0;
    
    // Calculate quiz average
    const validQuizScores = progress.filter(item => item.quiz_avg_score !== null && item.quiz_avg_score !== undefined);
    const totalQuizScore = validQuizScores.reduce((sum, item) => sum + (item.quiz_avg_score || 0), 0);
    stats.quiz_avg_score = validQuizScores.length > 0 ? (totalQuizScore / validQuizScores.length).toFixed(1) : 0;
    
    // Examples stats
    stats.examples_submitted = progress.reduce((sum, item) => sum + (item.examples_submitted || 0), 0);
    stats.examples_correct = progress.reduce((sum, item) => sum + (item.examples_correct || 0), 0);
    stats.accuracy_percentage = stats.examples_submitted > 0 
      ? Math.round((stats.examples_correct / stats.examples_submitted) * 100) 
      : 0;
    
    // Get last activity date
    const activityDates = progress
      .filter(item => item.updated_at)
      .map(item => new Date(item.updated_at));
      
    if (activityDates.length > 0) {
      stats.last_activity = new Date(Math.max(...activityDates)).toISOString();
    }
    
    // Get recent tenses (sorted by last activity)
    stats.recent_tenses = progress
      .filter(item => item.tense_id)
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0);
        const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map(item => item.tense_id);
    
    return stats;
  };

  //========================
  // USER PROGRESS ROUTES
  //========================

  // Get all progress data for the current user
  app.get('/progress', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);

    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }

    progressService.GET_USER_PROGRESS(userId, (progress) => {
      if (progress.code) {
        return res.status(500).json({
          msg: "Failed to retrieve progress data",
          error: progress.errorMessage || "Unknown error"
        });
      }

      res.status(200).json({ progress });
    });
  });

  // Get progress data for a specific tense
  app.get('/progress/tense/:tenseId', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    const tenseId = req.params.tenseId;

    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }

    if (!tenseId) {
      return res.status(400).json({ msg: "Tense ID is required" });
    }

    progressService.GET_TENSE_PROGRESS(userId, tenseId, (progress) => {
      if (progress.code) {
        return res.status(500).json({
          msg: "Failed to retrieve tense progress data",
          error: progress.errorMessage || "Unknown error"
        });
      }

      res.status(200).json({ progress });
    });
  });

  // Update progress for a tense
  app.post('/progress/tense/:tenseId', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    const tenseId = req.params.tenseId;
    const progressData = req.body;

    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }

    if (!tenseId) {
      return res.status(400).json({ msg: "Tense ID is required" });
    }

    // First check if progress exists
    progressService.GET_TENSE_PROGRESS(userId, tenseId, (existingProgress) => {
      if (existingProgress.code && existingProgress.code !== 'NOT_FOUND') {
        return res.status(500).json({
          msg: "Failed to check existing progress",
          error: existingProgress.errorMessage || "Unknown error"
        });
      }

      if (existingProgress.code === 'NOT_FOUND' || !existingProgress.id) {
        // Progress doesn't exist, create new
        const newProgress = {
          id: uuidv4(),
          user_id: userId,
          tense_id: tenseId,
          completion_percentage: progressData.completion_percentage || 0,
          quiz_avg_score: progressData.quiz_avg_score || 0,
          examples_submitted: progressData.examples_submitted || 0,
          examples_correct: progressData.examples_correct || 0,
          is_completed: progressData.is_completed || false,
          difficulty_level: progressData.difficulty_level || 1
        };

        progressService.CREATE_PROGRESS(newProgress, (result) => {
          if (result.code) {
            return res.status(500).json({
              msg: "Failed to create progress",
              error: result.errorMessage || "Unknown error"
            });
          }

          res.status(201).json({ 
            msg: "Progress created", 
            progress: result 
          });
        });
      } else {
        // Progress exists, update it
        const updatedProgress = {
          ...existingProgress,
          completion_percentage: progressData.completion_percentage !== undefined ? 
            progressData.completion_percentage : existingProgress.completion_percentage,
          quiz_avg_score: progressData.quiz_avg_score !== undefined ? 
            progressData.quiz_avg_score : existingProgress.quiz_avg_score,
          examples_submitted: progressData.examples_submitted !== undefined ? 
            progressData.examples_submitted : existingProgress.examples_submitted,
          examples_correct: progressData.examples_correct !== undefined ? 
            progressData.examples_correct : existingProgress.examples_correct,
          is_completed: progressData.is_completed !== undefined ? 
            progressData.is_completed : existingProgress.is_completed,
          difficulty_level: progressData.difficulty_level !== undefined ? 
            progressData.difficulty_level : existingProgress.difficulty_level
        };

        progressService.UPDATE_PROGRESS(updatedProgress, (result) => {
          if (result.code) {
            return res.status(500).json({
              msg: "Failed to update progress",
              error: result.errorMessage || "Unknown error"
            });
          }

          res.status(200).json({ 
            msg: "Progress updated", 
            progress: result 
          });
        });
      }
    });
  });

  // Update user progress after completing a quiz
  app.post('/progress/quiz', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({ msg: "User ID not found in token" });
      }
      
      if (!req.body || !req.body.tense_id || req.body.score === undefined) {
        return res.status(400).json({ msg: "Tense ID and quiz score are required" });
      }
      
      progressService.UPDATE_QUIZ_PROGRESS(
        userId,
        req.body.tense_id,
        req.body.score,
        (progress) => {
          if (!progress || progress.code) {
            return res.status(progress?.code || 500).json({ 
              msg: "Failed to update quiz progress", 
              error: progress?.errorMessage || "Unknown error" 
            });
          }
          
          return res.status(200).json({ progress });
        }
      );
    } catch (error) {
      console.error('Unexpected error updating quiz progress:', error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
  
  // Update user progress after submitting an example
  app.post('/progress/example', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({ msg: "User ID not found in token" });
      }
      
      if (!req.body || !req.body.tense_id) {
        return res.status(400).json({ msg: "Tense ID is required" });
      }
      
      // is_correct defaults to false if not provided
      const isCorrect = req.body.is_correct === true;
      
      progressService.UPDATE_EXAMPLE_PROGRESS(
        userId,
        req.body.tense_id,
        isCorrect,
        (progress) => {
          if (!progress || progress.code) {
            return res.status(progress?.code || 500).json({ 
              msg: "Failed to update example progress", 
              error: progress?.errorMessage || "Unknown error" 
            });
          }
          
          return res.status(200).json({ progress });
        }
      );
    } catch (error) {
      console.error('Unexpected error updating example progress:', error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  //========================
  // LEARNING ACTIVITY ROUTES
  //========================

  // Get user learning activity
  app.get('/progress/activity', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);

    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit) : 7; // Default to last 7 days

    progressService.GET_USER_ACTIVITY(userId, limit, (activities) => {
      if (activities.code) {
        return res.status(500).json({
          msg: "Failed to retrieve learning activity",
          error: activities.errorMessage || "Unknown error"
        });
      }

      res.status(200).json({ activities });
    });
  });

  // Update user activity - used to track session time and activities
  app.post('/progress/activity', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);
    const activityData = req.body;

    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // First check if activity exists for today
    progressService.GET_USER_ACTIVITY_FOR_DATE(userId, today, (existingActivity) => {
      if (existingActivity.code && existingActivity.code !== 'NOT_FOUND') {
        return res.status(500).json({
          msg: "Failed to check existing activity",
          error: existingActivity.errorMessage || "Unknown error"
        });
      }

      // Calculate the streak
      progressService.CALCULATE_USER_STREAK(userId, (streakInfo) => {
        if (streakInfo.code) {
          console.error('Error calculating streak:', streakInfo.errorMessage);
        }

        const streak = streakInfo.streak || 1;

        if (existingActivity.code === 'NOT_FOUND' || !existingActivity.id) {
          // Activity doesn't exist for today, create new
          const newActivity = {
            id: uuidv4(),
            user_id: userId,
            session_date: today,
            total_time_spent: activityData.time_spent || 0,
            tenses_practiced: activityData.tenses || [],
            activities_completed: activityData.activities || [],
            streak_days: streak
          };

          progressService.CREATE_ACTIVITY(newActivity, (result) => {
            if (result.code) {
              return res.status(500).json({
                msg: "Failed to create activity",
                error: result.errorMessage || "Unknown error"
              });
            }

            res.status(201).json({ 
              msg: "Activity created", 
              activity: result 
            });
          });
        } else {
          // Activity exists, update it
          const updatedActivity = {
            ...existingActivity,
            total_time_spent: existingActivity.total_time_spent + (activityData.time_spent || 0),
            streak_days: streak
          };

          // Merge tenses_practiced arrays (avoiding duplicates)
          if (activityData.tenses && activityData.tenses.length > 0) {
            const existingTenses = existingActivity.tenses_practiced || [];
            const newTenseIds = activityData.tenses.map(t => t.tense_id);
            
            updatedActivity.tenses_practiced = [
              ...existingTenses,
              ...activityData.tenses.filter(t => !existingTenses.some(et => et.tense_id === t.tense_id))
            ];
          }

          // Add activities
          if (activityData.activities && activityData.activities.length > 0) {
            const existingActivities = existingActivity.activities_completed || [];
            
            updatedActivity.activities_completed = existingActivities.map(ea => {
              // Try to find matching activity type
              const matchingNew = activityData.activities.find(na => na.type === ea.type);
              if (matchingNew) {
                return {
                  ...ea,
                  count: ea.count + matchingNew.count
                };
              }
              return ea;
            });

            // Add new activity types not present in existing
            activityData.activities.forEach(na => {
              if (!updatedActivity.activities_completed.some(a => a.type === na.type)) {
                updatedActivity.activities_completed.push(na);
              }
            });
          }

          progressService.UPDATE_ACTIVITY(updatedActivity, (result) => {
            if (result.code) {
              return res.status(500).json({
                msg: "Failed to update activity",
                error: result.errorMessage || "Unknown error"
              });
            }

            res.status(200).json({ 
              msg: "Activity updated", 
              activity: result 
            });
          });
        }
      });
    });
  });

  //========================
  // ACHIEVEMENT ROUTES
  //========================

  // Get user achievements
  app.get('/progress/achievements', passport.authenticate('user_connected', { session: false }), (req, res) => {
    const userId = extractUserId(req);

    if (!userId) {
      return res.status(401).json({ msg: "User ID not found in token" });
    }

    progressService.GET_USER_ACHIEVEMENTS(userId, (achievements) => {
      if (achievements.code) {
        return res.status(500).json({
          msg: "Failed to retrieve achievements",
          error: achievements.errorMessage || "Unknown error"
        });
      }

      res.status(200).json({ achievements });
    });
  });

  //========================
  // TEACHER DASHBOARD ROUTES
  //========================
  
  // Get student progress (for teachers/admins)
  app.get('/progress/student/:studentId', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userRole = extractUserRole(req);
      
      // Only teachers and admins can access student progress
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({ msg: "Only teachers and administrators can access student progress" });
      }
      
      if (!req.params.studentId) {
        return res.status(400).json({ msg: "Student ID is required" });
      }
      
      progressService.GET_USER_PROGRESS(req.params.studentId, (progress) => {
        if (!progress || progress.code) {
          return res.status(progress?.code || 500).json({ 
            msg: "Failed to retrieve student progress", 
            error: progress?.errorMessage || "Unknown error" 
          });
        }
        
        return res.status(200).json({ progress });
      });
    } catch (error) {
      console.error('Unexpected error retrieving student progress:', error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
  
  // Create assessment for a student
  app.post('/progress/assessment', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userRole = extractUserRole(req);
      const teacherId = extractUserId(req);
      
      // Only teachers and admins can create assessments
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({ msg: "Only teachers and administrators can create assessments" });
      }
      
      if (!teacherId) {
        return res.status(401).json({ msg: "Teacher ID not found in token" });
      }
      
      if (!req.body || !req.body.student_id || !req.body.assessment) {
        return res.status(400).json({ msg: "Student ID and assessment details are required" });
      }
      
      progressService.CREATE_ASSESSMENT(
        teacherId,
        req.body.student_id,
        req.body.tense_id || null,
        req.body.assessment,
        (result) => {
          if (!result || result.code) {
            return res.status(result?.code || 500).json({ 
              msg: "Failed to create assessment", 
              error: result?.errorMessage || "Unknown error" 
            });
          }
          
          return res.status(201).json({ 
            msg: "Assessment created successfully", 
            assessment: result 
          });
        }
      );
    } catch (error) {
      console.error('Unexpected error creating assessment:', error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });
  
  // Get assessments for a student
  app.get('/progress/assessment/:studentId', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userRole = extractUserRole(req);
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({ msg: "User ID not found in token" });
      }
      
      if (!req.params.studentId) {
        return res.status(400).json({ msg: "Student ID is required" });
      }
      
      // Students can only access their own assessments
      if (userRole === 3 && req.params.studentId !== userId) {
        return res.status(403).json({ msg: "You can only access your own assessments" });
      }
      
      // Only teachers, admins, and the student themselves can access assessments
      if (userRole !== 1 && userRole !== 2 && req.params.studentId !== userId) {
        return res.status(403).json({ msg: "You don't have permission to access these assessments" });
      }
      
      progressService.GET_STUDENT_ASSESSMENTS(req.params.studentId, (result) => {
        if (!result || result.code) {
          return res.status(result?.code || 500).json({ 
            msg: "Failed to retrieve assessments", 
            error: result?.errorMessage || "Unknown error" 
          });
        }
        
        return res.status(200).json(result);
      });
    } catch (error) {
      console.error('Unexpected error retrieving assessments:', error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });

  //========================
  // ADMIN ANALYTICS ROUTES
  //========================
  
  // Get system analytics (admin only)
  app.get('/admin/progress/analytics', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userRole = extractUserRole(req);
      
      // Only admins can access system analytics
      if (userRole !== 1) {
        return res.status(403).json({ msg: "Only administrators can access system analytics" });
      }
      
      progressService.GET_SYSTEM_ANALYTICS((analytics) => {
        if (!analytics || analytics.code) {
          return res.status(analytics?.code || 500).json({ 
            msg: "Failed to retrieve system analytics", 
            error: analytics?.errorMessage || "Unknown error" 
          });
        }
        
        return res.status(200).json({ analytics });
      });
    } catch (error) {
      console.error('Unexpected error retrieving system analytics:', error);
      return res.status(500).json({ msg: "Internal server error" });
    }
  });  // Direct access to student progress page - support both with and without trailing slash
  app.get('/student/:studentId/:dummy?', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userRole = extractUserRole(req);
      console.log('⭐ User role detected in student progress endpoint:', userRole);
      
      // Only teachers and admins can access student progress
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({ msg: "Only teachers and administrators can access student progress" });
      }
      
      const studentId = req.params.studentId;
      if (!studentId) {
        return res.status(400).json({ msg: "Student ID is required" });
      }
      
      console.log(`Fetching progress data for student ID: ${studentId} (direct access)`);
      
      progressService.GET_USER_PROGRESS(studentId, (progress) => {
        if (progress && progress.code) {
          console.error(`Error fetching progress for student ${studentId}:`, progress.errorMessage);
          return res.status(progress.code || 500).json({ 
            msg: "Failed to retrieve student progress", 
            error: progress.errorMessage || "Error fetching user progress" 
          });
        }
        
        // Enhance student progress with additional data
        // Calculate overall completion, achievements, etc
        const stats = calculateProgressStats(progress);
        
        // Return empty array if progress is null/undefined
        const progressData = Array.isArray(progress) ? progress : [];
        return res.status(200).json({ 
          progress: progressData,
          stats: stats
        });
      });
    } catch (error) {
      console.error('Unexpected error retrieving student progress:', error);
      return res.status(500).json({ msg: "Internal server error", error: error.message });
    }
  });
  // Additional endpoint to support the frontend API request to /student/:studentId/progress
  app.get('/student/:studentId/progress', passport.authenticate('user_connected', { session: false }), (req, res) => {
    try {
      const userRole = extractUserRole(req);
      console.log('⭐ User role detected in student/progress endpoint:', userRole);
      
      // Only teachers and admins can access student progress
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({ msg: "Only teachers and administrators can access student progress" });
      }
      
      const studentId = req.params.studentId;
      if (!studentId) {
        return res.status(400).json({ msg: "Student ID is required" });
      }
      
      console.log(`Fetching progress data for student ID: ${studentId}`);
      
      progressService.GET_USER_PROGRESS(studentId, (progress) => {
        if (progress && progress.code) {
          console.error(`Error fetching progress for student ${studentId}:`, progress.errorMessage);
          return res.status(progress.code || 500).json({ 
            msg: "Failed to retrieve student progress", 
            error: progress.errorMessage || "Error fetching user progress" 
          });
        }
        
        // If progress is null or undefined, return an empty array
        const progressData = Array.isArray(progress) ? progress : [];
        return res.status(200).json({ progress: progressData });
      });
    } catch (error) {
      console.error('Unexpected error retrieving student progress:', error);
      return res.status(500).json({ msg: "Internal server error", error: error.message });
    }
  });

};