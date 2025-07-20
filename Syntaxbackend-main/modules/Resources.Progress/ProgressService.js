const { v4: uuidv4 } = require('uuid');
const InterfaceDao = require('../InterfaceDao');
const ErrorObject = require('../error/ErrorObject');
const ProgressDao = require('./ProgressDao');

/**
 * Service class to handle user learning progress management
 */
class ProgressService {
  constructor() {
    this.progressDao = new ProgressDao();
  }  /**
   * Get all progress data for a user
   * @param {string} userId - User ID
   * @param {function} callback - Callback function
   */
  GET_USER_PROGRESS(userId, callback) {
    if (!userId) {
      callback(new ErrorObject(400, "User ID is required"));
      return;
    }

    this.progressDao.getUserProgress(userId, (err, results) => {
      if (err) {
        console.error('Error fetching user progress:', err);
        callback(new ErrorObject(500, "Error fetching user progress", err));
        return;
      }
      
      // Make sure we always return an array, even if empty
      const progressData = results || [];
      callback(progressData);
    });
  }

  /**
   * Get progress data for a specific tense
   * @param {string} userId - User ID
   * @param {string} tenseId - Tense ID
   * @param {function} callback - Callback function
   */
  GET_TENSE_PROGRESS(userId, tenseId, callback) {
    if (!userId || !tenseId) {
      callback(new ErrorObject(400, "User ID and Tense ID are required"));
      return;
    }

    this.progressDao.getTenseProgress(userId, tenseId, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error fetching tense progress", err));
        return;
      }
      
      if (!result) {
        callback(new ErrorObject('NOT_FOUND', "No progress found for this tense"));
        return;
      }
      
      callback(result);
    });
  }

  /**
   * Create new progress record
   * @param {object} progressData - Progress data object
   * @param {function} callback - Callback function
   */
  CREATE_PROGRESS(progressData, callback) {
    if (!progressData || !progressData.user_id || !progressData.tense_id) {
      callback(new ErrorObject(400, "User ID and Tense ID are required"));
      return;
    }

    this.progressDao.createProgress(progressData, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error creating progress record", err));
        return;
      }
      
      // Check for achievements after creating progress
      this.checkForAchievements(progressData.user_id);
      
      callback(progressData);
    });
  }

  /**
   * Update existing progress record
   * @param {object} progressData - Progress data object
   * @param {function} callback - Callback function
   */
  UPDATE_PROGRESS(progressData, callback) {
    if (!progressData || !progressData.id || !progressData.user_id || !progressData.tense_id) {
      callback(new ErrorObject(400, "Progress ID, User ID, and Tense ID are required"));
      return;
    }

    this.progressDao.updateProgress(progressData, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error updating progress record", err));
        return;
      }
      
      // If completion percentage is high enough, check for achievements
      if (progressData.completion_percentage >= 80 || progressData.is_completed) {
        this.checkForAchievements(progressData.user_id);
      }
      
      callback(progressData);
    });
  }
  
  /**
   * Update progress after quiz completion
   * @param {string} userId - User ID
   * @param {string} tenseId - Tense ID
   * @param {number} score - Quiz score
   * @param {function} callback - Callback function
   */
  UPDATE_QUIZ_PROGRESS(userId, tenseId, score, callback) {
    if (!userId || !tenseId || score === undefined) {
      callback(new ErrorObject(400, "User ID, Tense ID, and score are required"));
      return;
    }

    // First get existing progress
    this.GET_TENSE_PROGRESS(userId, tenseId, (existingProgress) => {
      if (existingProgress.code && existingProgress.code !== 'NOT_FOUND') {
        callback(existingProgress); // Pass through the error
        return;
      }

      if (existingProgress.code === 'NOT_FOUND' || !existingProgress.id) {
        // Create new progress record if none exists
        const newProgress = {
          id: uuidv4(),
          user_id: userId,
          tense_id: tenseId,
          completion_percentage: 10, // Starting value
          quiz_avg_score: score,
          examples_submitted: 0,
          examples_correct: 0,
          is_completed: false
        };

        this.CREATE_PROGRESS(newProgress, callback);
      } else {
        // Update existing progress
        const currentScore = existingProgress.quiz_avg_score || 0;
        const quizCount = existingProgress.quiz_count || 1;
        
        // Calculate new average score
        const newAvgScore = ((currentScore * quizCount) + score) / (quizCount + 1);
        
        // Determine completion percentage based on quiz score and examples
        const quizWeight = 0.7; // 70% weight to quiz scores
        const examplesWeight = 0.3; // 30% weight to examples
        
        let newCompletionPercentage = 0;
        
        if (existingProgress.examples_submitted > 0) {
          const exampleAccuracy = existingProgress.examples_correct / existingProgress.examples_submitted;
          newCompletionPercentage = Math.round(
            (newAvgScore * 10 * quizWeight) + (exampleAccuracy * 100 * examplesWeight)
          );
        } else {
          // No examples, base completion on quiz scores only
          newCompletionPercentage = Math.round(newAvgScore * 10);
        }
        
        // Cap at 100%
        newCompletionPercentage = Math.min(newCompletionPercentage, 100);
        
        const updatedProgress = {
          ...existingProgress,
          quiz_avg_score: parseFloat(newAvgScore.toFixed(2)),
          quiz_count: quizCount + 1,
          completion_percentage: newCompletionPercentage,
          is_completed: newCompletionPercentage >= 90
        };

        this.UPDATE_PROGRESS(updatedProgress, callback);
        
        // Add activity record
        this.recordActivity(userId, tenseId, 15, 'quiz');
      }
    });
  }
  
  /**
   * Update progress after example submission
   * @param {string} userId - User ID
   * @param {string} tenseId - Tense ID
   * @param {boolean} isCorrect - Whether the example was correct
   * @param {function} callback - Callback function
   */
  UPDATE_EXAMPLE_PROGRESS(userId, tenseId, isCorrect, callback) {
    if (!userId || !tenseId) {
      callback(new ErrorObject(400, "User ID and Tense ID are required"));
      return;
    }

    // First get existing progress
    this.GET_TENSE_PROGRESS(userId, tenseId, (existingProgress) => {
      if (existingProgress.code && existingProgress.code !== 'NOT_FOUND') {
        callback(existingProgress); // Pass through the error
        return;
      }

      if (existingProgress.code === 'NOT_FOUND' || !existingProgress.id) {
        // Create new progress record if none exists
        const newProgress = {
          id: uuidv4(),
          user_id: userId,
          tense_id: tenseId,
          completion_percentage: 5, // Starting value
          quiz_avg_score: 0,
          examples_submitted: 1,
          examples_correct: isCorrect ? 1 : 0,
          is_completed: false
        };

        this.CREATE_PROGRESS(newProgress, callback);
      } else {
        // Update existing progress
        const updatedExamplesSubmitted = (existingProgress.examples_submitted || 0) + 1;
        const updatedExamplesCorrect = (existingProgress.examples_correct || 0) + (isCorrect ? 1 : 0);
        
        // Calculate example accuracy
        const exampleAccuracy = updatedExamplesCorrect / updatedExamplesSubmitted;
        
        // Determine completion percentage based on quiz score and examples
        const quizWeight = 0.7; // 70% weight to quiz scores
        const examplesWeight = 0.3; // 30% weight to examples
        
        let newCompletionPercentage;
        
        if (existingProgress.quiz_avg_score) {
          // Have quiz scores, combine with examples
          newCompletionPercentage = Math.round(
            (existingProgress.quiz_avg_score * 10 * quizWeight) + 
            (exampleAccuracy * 100 * examplesWeight)
          );
        } else {
          // No quiz scores, base completion on examples only
          newCompletionPercentage = Math.round(exampleAccuracy * 35); // Lower starting percentage
        }
        
        // Cap at 100%
        newCompletionPercentage = Math.min(newCompletionPercentage, 100);
        
        const updatedProgress = {
          ...existingProgress,
          examples_submitted: updatedExamplesSubmitted,
          examples_correct: updatedExamplesCorrect,
          completion_percentage: newCompletionPercentage,
          is_completed: newCompletionPercentage >= 90
        };

        this.UPDATE_PROGRESS(updatedProgress, callback);
        
        // Add activity record
        this.recordActivity(userId, tenseId, 5, 'example');
      }
    });
  }

  /**
   * Get user achievements
   * @param {string} userId - User ID
   * @param {function} callback - Callback function
   */
  GET_USER_ACHIEVEMENTS(userId, callback) {
    if (!userId) {
      callback(new ErrorObject(400, "User ID is required"));
      return;
    }

    this.progressDao.getUserAchievements(userId, (err, results) => {
      if (err) {
        callback(new ErrorObject(500, "Error fetching user achievements", err));
        return;
      }
      callback(results || []);
    });
  }

  /**
   * Get user learning activity
   * @param {string} userId - User ID
   * @param {number} limit - Number of days to retrieve
   * @param {function} callback - Callback function
   */
  GET_USER_ACTIVITY(userId, limit = 7, callback) {
    if (!userId) {
      callback(new ErrorObject(400, "User ID is required"));
      return;
    }

    this.progressDao.getUserActivity(userId, limit, (err, results) => {
      if (err) {
        callback(new ErrorObject(500, "Error fetching user activity", err));
        return;
      }
      callback(results || []);
    });
  }

  /**
   * Get user activity for a specific date
   * @param {string} userId - User ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {function} callback - Callback function
   */
  GET_USER_ACTIVITY_FOR_DATE(userId, date, callback) {
    if (!userId || !date) {
      callback(new ErrorObject(400, "User ID and date are required"));
      return;
    }

    this.progressDao.getUserActivityForDate(userId, date, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error fetching user activity", err));
        return;
      }
      
      if (!result) {
        callback(new ErrorObject('NOT_FOUND', "No activity found for this date"));
        return;
      }
      
      callback(result);
    });
  }

  /**
   * Create new activity record
   * @param {object} activityData - Activity data object
   * @param {function} callback - Callback function
   */
  CREATE_ACTIVITY(activityData, callback) {
    if (!activityData || !activityData.user_id) {
      callback(new ErrorObject(400, "User ID is required"));
      return;
    }

    this.progressDao.createActivity(activityData, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error creating activity record", err));
        return;
      }
      
      // Check for streak-based achievements
      if (activityData.streak_days >= 7) {
        this.checkForStreakAchievement(activityData.user_id, activityData.streak_days);
      }
      
      callback(activityData);
    });
  }

  /**
   * Update existing activity record
   * @param {object} activityData - Activity data object
   * @param {function} callback - Callback function
   */
  UPDATE_ACTIVITY(activityData, callback) {
    if (!activityData || !activityData.id || !activityData.user_id) {
      callback(new ErrorObject(400, "Activity ID and User ID are required"));
      return;
    }

    this.progressDao.updateActivity(activityData, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error updating activity record", err));
        return;
      }
      
      // Check for streak-based achievements
      if (activityData.streak_days >= 7) {
        this.checkForStreakAchievement(activityData.user_id, activityData.streak_days);
      }
      
      callback(activityData);
    });
  }

  /**
   * Calculate user streak
   * @param {string} userId - User ID
   * @param {function} callback - Callback function
   */
  CALCULATE_USER_STREAK(userId, callback) {
    if (!userId) {
      callback(new ErrorObject(400, "User ID is required"));
      return;
    }

    this.progressDao.getRecentUserActivity(userId, (err, activities) => {
      if (err) {
        callback(new ErrorObject(500, "Error fetching user activity for streak calculation", err));
        return;
      }
      
      if (!activities || activities.length === 0) {
        // No previous activity, starting new streak
        callback({ streak: 1 });
        return;
      }
      
      // Get the last activity date
      const lastActivity = new Date(activities[0].session_date);
      const today = new Date();
      
      // Reset dates to start of day for comparison
      lastActivity.setUTCHours(0, 0, 0, 0);
      today.setUTCHours(0, 0, 0, 0);
      
      // Check if last activity was yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity.getTime() === yesterday.getTime()) {
        // Last activity was yesterday, continue streak
        callback({ streak: activities[0].streak_days + 1 });
      } else if (lastActivity.getTime() === today.getTime()) {
        // Already recorded activity today, maintain streak
        callback({ streak: activities[0].streak_days });
      } else {
        // Streak broken, start new streak
        callback({ streak: 1 });
      }
    });
  }

  /**
   * Record activity for a user
   * @param {string} userId - User ID
   * @param {string} tenseId - Tense ID
   * @param {number} timeSpent - Time spent in seconds
   * @param {string} activityType - Type of activity (quiz, example, etc.)
   */
  recordActivity(userId, tenseId, timeSpent, activityType) {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if activity exists for today
    this.GET_USER_ACTIVITY_FOR_DATE(userId, today, (existingActivity) => {
      if (existingActivity.code && existingActivity.code !== 'NOT_FOUND') {
        console.error('Error checking activity:', existingActivity.errorMessage);
        return;
      }
      
      // Calculate streak
      this.CALCULATE_USER_STREAK(userId, (streakInfo) => {
        const streak = streakInfo.streak || 1;
        
        if (existingActivity.code === 'NOT_FOUND' || !existingActivity.id) {
          // Create new activity
          const newActivity = {
            id: uuidv4(),
            user_id: userId,
            session_date: today,
            total_time_spent: timeSpent,
            tenses_practiced: tenseId ? [{ tense_id: tenseId }] : [],
            activities_completed: [{ type: activityType, count: 1 }],
            streak_days: streak
          };
          
          this.CREATE_ACTIVITY(newActivity, () => {});
        } else {
          // Update existing activity
          const updatedActivity = {
            ...existingActivity,
            total_time_spent: existingActivity.total_time_spent + timeSpent,
            streak_days: streak
          };
          
          // Add the tense if not already tracked
          if (tenseId) {
            const existingTenses = existingActivity.tenses_practiced || [];
            if (!existingTenses.some(t => t.tense_id === tenseId)) {
              updatedActivity.tenses_practiced = [...existingTenses, { tense_id: tenseId }];
            } else {
              updatedActivity.tenses_practiced = existingTenses;
            }
          }
          
          // Update the activity count
          const existingActivities = existingActivity.activities_completed || [];
          const existingActivityIndex = existingActivities.findIndex(a => a.type === activityType);
          
          if (existingActivityIndex !== -1) {
            existingActivities[existingActivityIndex].count += 1;
            updatedActivity.activities_completed = existingActivities;
          } else {
            updatedActivity.activities_completed = [...existingActivities, { type: activityType, count: 1 }];
          }
          
          this.UPDATE_ACTIVITY(updatedActivity, () => {});
        }
      });
    });
  }

  /**
   * Check for user achievements based on progress
   * @param {string} userId - User ID
   */
  checkForAchievements(userId) {
    if (!userId) return;
    
    // Check for tense mastery achievements
    this.GET_USER_PROGRESS(userId, (progress) => {
      if (progress.code) {
        console.error('Error checking achievements:', progress.errorMessage);
        return;
      }
      
      // No progress data
      if (!Array.isArray(progress) || progress.length === 0) return;
      
      // Count completed tenses
      const completedTenses = progress.filter(p => p.completion_percentage >= 85 || p.is_completed);
      
      // Get existing achievements first to avoid duplicates
      this.GET_USER_ACHIEVEMENTS(userId, (existingAchievements) => {
        if (existingAchievements.code) {
          console.error('Error checking existing achievements:', existingAchievements.errorMessage);
          return;
        }
        
        // Check for tense mastery
        if (completedTenses.length >= 1) {
          const hasFirstTenseMastery = Array.isArray(existingAchievements) && 
            existingAchievements.some(a => a.achievement_type === 'tense_mastery' && a.achievement_level === 1);
          
          if (!hasFirstTenseMastery) {
            this.createAchievement({
              user_id: userId,
              achievement_type: 'tense_mastery',
              achievement_name: 'First Tense Mastered',
              achievement_description: 'Completed all exercises for your first tense!',
              achievement_level: 1
            });
          }
        }
        
        if (completedTenses.length >= 5) {
          const hasMultiTenseMastery = Array.isArray(existingAchievements) && 
            existingAchievements.some(a => a.achievement_type === 'tense_mastery' && a.achievement_level === 2);
          
          if (!hasMultiTenseMastery) {
            this.createAchievement({
              user_id: userId,
              achievement_type: 'tense_mastery',
              achievement_name: 'Tense Explorer',
              achievement_description: 'Mastered 5 different tenses!',
              achievement_level: 2
            });
          }
        }
        
        if (completedTenses.length >= 10) {
          const hasTenseMaster = Array.isArray(existingAchievements) && 
            existingAchievements.some(a => a.achievement_type === 'tense_mastery' && a.achievement_level === 3);
          
          if (!hasTenseMaster) {
            this.createAchievement({
              user_id: userId,
              achievement_type: 'tense_mastery',
              achievement_name: 'Tense Master',
              achievement_description: 'You have mastered 10 tenses! Your grammar knowledge is impressive!',
              achievement_level: 3
            });
          }
        }
        
        // Check for quiz perfection
        const perfectQuizzes = progress.filter(p => p.quiz_avg_score >= 9.5);
        
        if (perfectQuizzes.length >= 3) {
          const hasQuizAchievement = Array.isArray(existingAchievements) && 
            existingAchievements.some(a => a.achievement_type === 'quiz_perfect');
          
          if (!hasQuizAchievement) {
            this.createAchievement({
              user_id: userId,
              achievement_type: 'quiz_perfect',
              achievement_name: 'Quiz Perfectionist',
              achievement_description: 'Achieved near-perfect scores on at least 3 tense quizzes!',
              achievement_level: 1
            });
          }
        }
        
        // Check for example expert
        const goodExamples = progress.filter(p => 
          p.examples_submitted >= 5 && (p.examples_correct / p.examples_submitted) >= 0.8
        );
        
        if (goodExamples.length >= 2) {
          const hasExampleAchievement = Array.isArray(existingAchievements) && 
            existingAchievements.some(a => a.achievement_type === 'example_expert');
          
          if (!hasExampleAchievement) {
            this.createAchievement({
              user_id: userId,
              achievement_type: 'example_expert',
              achievement_name: 'Example Expert',
              achievement_description: 'Created many excellent examples showing your mastery!',
              achievement_level: 1
            });
          }
        }
      });
    });
  }

  /**
   * Check for streak-based achievements
   * @param {string} userId - User ID
   * @param {number} streakDays - Current streak length
   */
  checkForStreakAchievement(userId, streakDays) {
    if (!userId || !streakDays) return;
    
    // Get existing achievements to avoid duplicates
    this.GET_USER_ACHIEVEMENTS(userId, (existingAchievements) => {
      if (existingAchievements.code) {
        console.error('Error checking existing streak achievements:', existingAchievements.errorMessage);
        return;
      }
      
      // Weekly Streak (7 days)
      if (streakDays >= 7) {
        const hasWeekStreakAchievement = Array.isArray(existingAchievements) && 
          existingAchievements.some(a => a.achievement_type === 'streak' && a.achievement_level === 1);
        
        if (!hasWeekStreakAchievement) {
          this.createAchievement({
            user_id: userId,
            achievement_type: 'streak',
            achievement_name: 'Weekly Warrior',
            achievement_description: 'Practiced for 7 days in a row!',
            achievement_level: 1
          });
        }
      }
      
      // Monthly Streak (30 days)
      if (streakDays >= 30) {
        const hasMonthStreakAchievement = Array.isArray(existingAchievements) && 
          existingAchievements.some(a => a.achievement_type === 'streak' && a.achievement_level === 2);
        
        if (!hasMonthStreakAchievement) {
          this.createAchievement({
            user_id: userId,
            achievement_type: 'streak',
            achievement_name: 'Dedicated Scholar',
            achievement_description: 'Practiced for 30 days in a row! Your dedication is impressive!',
            achievement_level: 2
          });
        }
      }
    });
  }

  /**
   * Create a new achievement and send notification
   * @param {object} achievementData - Achievement data
   */
  createAchievement(achievementData) {
    if (!achievementData || !achievementData.user_id) {
      console.error('Missing required achievement data');
      return;
    }
    
    // Add ID and timestamp
    achievementData.id = uuidv4();
    achievementData.achieved_at = new Date().toISOString();
    
    this.progressDao.createAchievement(achievementData, (err, result) => {
      if (err) {
        console.error('Error creating achievement:', err);
        return;
      }
      
      // Create notification for the achievement
      const notificationData = {
        id: uuidv4(),
        user_id: achievementData.user_id,
        type: 'achievement',
        message: `Achievement Unlocked: ${achievementData.achievement_name}!`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      this.progressDao.createNotification(notificationData, (notifyErr) => {
        if (notifyErr) {
          console.error('Error creating achievement notification:', notifyErr);
        }
      });
    });
  }
  
  /**
   * Create assessment for a student
   * @param {string} teacherId - Teacher ID
   * @param {string} studentId - Student ID
   * @param {string|null} tenseId - Tense ID (optional)
   * @param {object} assessmentData - Assessment data
   * @param {function} callback - Callback function
   */
  CREATE_ASSESSMENT(teacherId, studentId, tenseId, assessmentData, callback) {
    if (!teacherId || !studentId || !assessmentData) {
      callback(new ErrorObject(400, "Teacher ID, Student ID, and assessment data are required"));
      return;
    }
    
    if (!assessmentData.feedback) {
      callback(new ErrorObject(400, "Assessment feedback is required"));
      return;
    }
    
    const newAssessment = {
      id: uuidv4(),
      teacher_id: teacherId,
      student_id: studentId,
      tense_id: tenseId || null,
      score: assessmentData.score || null,
      feedback: assessmentData.feedback,
      created_at: new Date().toISOString()
    };
    
    this.progressDao.createAssessment(newAssessment, (err, result) => {
      if (err) {
        callback(new ErrorObject(500, "Error creating assessment", err));
        return;
      }
      
      // Create notification for the student
      const notificationData = {
        id: uuidv4(),
        user_id: studentId,
        type: 'assessment',
        message: `You have received new feedback${tenseId ? ' on a tense' : ''}!`,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      this.progressDao.createNotification(notificationData, (notifyErr) => {
        if (notifyErr) {
          console.error('Error creating assessment notification:', notifyErr);
        }
      });
      
      callback(newAssessment);
    });
  }
  
  /**
   * Get student assessments
   * @param {string} studentId - Student ID
   * @param {function} callback - Callback function
   */
  GET_STUDENT_ASSESSMENTS(studentId, callback) {
    if (!studentId) {
      callback(new ErrorObject(400, "Student ID is required"));
      return;
    }
    
    this.progressDao.getStudentAssessments(studentId, (err, assessments) => {
      if (err) {
        callback(new ErrorObject(500, "Error fetching student assessments", err));
        return;
      }
      
      callback({ assessments: assessments || [] });
    });
  }
    /**
   * Get system analytics for admin dashboard
   * This method always returns data, either actual data from the database
   * or fallback mock data if real data cannot be retrieved.
   * @param {function} callback - Callback function
   */
  GET_SYSTEM_ANALYTICS(callback) {
    try {
      this.progressDao.getSystemAnalytics((err, analytics) => {
        if (err) {
          console.error("Error in GET_SYSTEM_ANALYTICS:", err);
          // Instead of returning an error, we'll generate mock data
          this.progressDao.provideMockData(callback);
          return;
        }
        
        if (!analytics) {
          console.error("No analytics data returned from DAO");
          // Generate mock data since we have no real data
          this.progressDao.provideMockData(callback);
          return;
        }
        
        // Successfully got analytics data
        callback(analytics);
      });
    } catch (error) {
      console.error("Exception in GET_SYSTEM_ANALYTICS:", error);
      // Fallback to mock data in case of any exception
      this.progressDao.provideMockData(callback);
    }
  }
}

module.exports = ProgressService;