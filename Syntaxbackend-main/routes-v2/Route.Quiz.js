const { v4: uuidv4 } = require('uuid');
const db = require('../config/db_connect');
const passport = require('passport');
const jwtDecode = require('jwt-decode');

// import user ressources
const User = require("../modules/Ressources.User/User.js");
const UserService = require("../modules/Ressources.User/UserService.js");

// import quiz performance tracking
const QuizPerformance = require('../modules/Resources.QuizPerformance/QuizPerformance.js');
const QuizPerformanceService = require('../modules/Resources.QuizPerformance/QuizPerformanceService.js');

module.exports = (app) => {
    // Helper function to extract user role from request
    const extractUserRole = (req) => {
        try {
            if (!req.get('Authorization')) {
                return 4; // Default to guest role (4)
            }
            
            const token = req.get('Authorization').split(' ')[1];
            const decoded = jwtDecode(token);
            
            // Check if user_role is available in token
            if (decoded.user_role !== undefined) {
                return parseInt(decoded.user_role, 10);
            }
            
            // Check if authorization is available in token
            if (decoded.authorization !== undefined) {
                return parseInt(decoded.authorization, 10);
            }
            
            return 4; // Default to guest role if not found
        } catch (error) {
            console.error('Error extracting user role:', error);
            return 4; // Default to guest on error
        }
    };
    
    // Helper function to extract user ID from token
    const extractUserId = (req) => {
        try {
            if (!req.get('Authorization')) {
                return null;
            }
            
            const token = req.get('Authorization').split(' ')[1];
            const decoded = jwtDecode(token);
            
            // User ID is stored in the 'sub' field of the JWT token
            if (decoded.sub) {
                return decoded.sub;
            }
            
            return null;
        } catch (error) {
            console.error('Error extracting user ID from token:', error);
            return null;
        }
    };
    
    // Middleware to ensure authentication
    const ensureAuthenticated = (req, res, next) => {
        const userId = extractUserId(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
        }
        req.userId = userId; // Store userId in the request object for later use
        next();
    };

    // Get all quizzes
    app.get('/quiz', async (req, res) => {
        console.log('Request received at /quiz endpoint');
        const client = await db.connect();
        
        try {
            const { page = 1, limit = 10, tense_id, difficulty_level, quiz_details_id, status } = req.query;
            const offset = (page - 1) * limit;
            
            let query = 'SELECT * FROM quiz_details';
            const queryParams = [];
            let paramCounter = 1;
            
            // Add WHERE clause if filters are provided
            const conditions = [];
            
            if (quiz_details_id) {
                conditions.push(`id = $${paramCounter++}`);
                queryParams.push(quiz_details_id);
            }
            
            if (tense_id) {
                conditions.push(`tense_id = $${paramCounter++}`);
                queryParams.push(tense_id);
            }
            
            if (difficulty_level) {
                conditions.push(`difficulty_level = $${paramCounter++}`);
                queryParams.push(difficulty_level);
            }
            
            if (status) {
                conditions.push(`status = $${paramCounter++}`);
                queryParams.push(status);
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            // Add pagination
            query += ` ORDER BY created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
            queryParams.push(parseInt(limit), parseInt(offset));
            
            // Execute query
            console.log('Executing quiz query:', query, 'with params:', queryParams);
            const result = await client.query(query, queryParams);
            
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) FROM quiz_details';
            
            if (conditions.length > 0) {
                countQuery += ' WHERE ' + conditions.join(' AND ');
            }
            
            const countResult = await client.query(countQuery, queryParams.slice(0, -2));
            const totalCount = parseInt(countResult.rows[0].count);
            
            // For each quiz, get associated questions
            const quizzesWithQuestions = await Promise.all(result.rows.map(async (quiz) => {
                // Get questions for this quiz using the direct quiz_details_id relationship
                const questionsQuery = `
                    SELECT
                        question_id,
                        question_title as question,
                        answer_title_a,
                        answer_title_b,
                        answer_title_c,
                        answer_title_d,
                        right_answer,
                        online_exam_ids,
                        verified
                    FROM question_table
                    WHERE quiz_details_id = $1
                    ORDER BY question_id
                    LIMIT $2
                `;
                
                const questionsResult = await client.query(questionsQuery, [
                    quiz.id, 
                    quiz.number_of_questions || 10 // Default to 10 if not specified
                ]);
                
                // Format questions for frontend
                const questions = questionsResult.rows.map(q => {
                    const options = [q.answer_title_a, q.answer_title_b, q.answer_title_c, q.answer_title_d];
                    const correctIndex = 'abcd'.indexOf(q.right_answer.toLowerCase());
                    
                    return {
                        question_id: q.question_id,
                        question_type: 'mcq', // Default to mcq
                        question: q.question,
                        options: options,
                        correct_answer: options[correctIndex],
                        online_exam_ids: q.online_exam_ids,
                        verified: q.verified
                    };
                });
                
                return {
                    ...quiz,
                    questions: questions
                };
            }));
            
            // Return quizzes with their questions
            console.log(`Returning ${quizzesWithQuestions.length} quizzes`);
            res.json({
                success: true,
                data: quizzesWithQuestions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            });
            
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to fetch quizzes', 
                error: error.message 
            });
        } finally {
            client.release();
        }
    });
    
    // Get a specific quiz by ID
    app.get('/quiz/:id', async (req, res) => {
        const client = await db.connect();
        
        try {
            const quizId = req.params.id;
            
            // Get quiz details
            const quizQuery = 'SELECT * FROM quiz_details WHERE id = $1';
            const quizResult = await client.query(quizQuery, [quizId]);
            
            if (quizResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Quiz not found' });
            }
            
            const quiz = quizResult.rows[0];
            
            // Get questions for this quiz using the direct quiz_details_id relationship
            const questionsQuery = `
                SELECT
                    question_id,
                    question_title as question,
                    answer_title_a,
                    answer_title_b,
                    answer_title_c,
                    answer_title_d,
                    right_answer,
                    online_exam_ids
                FROM question_table
                WHERE quiz_details_id = $1
                ORDER BY question_id
                LIMIT $2
            `;
            
            const questionsResult = await client.query(questionsQuery, [
                quizId, 
                quiz.number_of_questions
            ]);
            
            // Format questions for frontend
            const questions = questionsResult.rows.map(q => {
                const options = [q.answer_title_a, q.answer_title_b, q.answer_title_c, q.answer_title_d];
                const correctIndex = 'abcd'.indexOf(q.right_answer.toLowerCase());
                
                return {
                    question_id: q.question_id,
                    question_type: 'mcq', // Default to mcq
                    question: q.question,
                    options: options,
                    correct_answer: options[correctIndex],
                    online_exam_ids: q.online_exam_ids
                };
            });
            
            // Return quiz with questions
            res.json({
                success: true,
                data: {
                    ...quiz,
                    questions: questions.length > 0 ? questions : []
                }
            });
            
        } catch (error) {
            console.error('Error fetching quiz:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch quiz details', error: error.message });
        } finally {
            client.release();
        }
    });
    
    // Create a new quiz
    app.post('/quiz', async (req, res) => {
        // Reuse the logic from /practice/quiz endpoint
        // This is a simplified version since we don't have auth middleware here yet
        
        const client = await db.connect();
        
        try {
            // Start a transaction
            await client.query('BEGIN');
            
            const {
                title,
                description,
                tense_id,
                difficulty_level,
                time_per_question,
                number_of_questions,
                status,
                questions
            } = req.body;
            
            // Validate required fields for quiz_details
            if (!title || !tense_id || !difficulty_level || !time_per_question || !number_of_questions) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Missing required fields for quiz_details table' 
                });
            }
            
            // Validate questions array for question_table
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Questions array is required for question_table' 
                });
            }
            
            // Generate a UUID for the quiz
            const quizId = uuidv4();
            
            // SQL to insert into quiz_details table
            const insertQuizDetailsQuery = `
                INSERT INTO quiz_details (
                    id, 
                    title, 
                    description, 
                    tense_id, 
                    difficulty_level, 
                    time_per_question, 
                    number_of_questions, 
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;
            
            const quizDetailsValues = [
                quizId, 
                title, 
                description, 
                tense_id, 
                difficulty_level, 
                time_per_question, 
                number_of_questions, 
                status || 'inactive'
            ];
            
            const quizDetailsResult = await client.query(insertQuizDetailsQuery, quizDetailsValues);
            
            // Create a unique online exam ID to link questions to this quiz
            const onlineExamId = Math.floor(Math.random() * 1000000) + 1;
            
            // Insert each question into the question_table
            const insertedQuestions = [];
            for (const question of questions) {
                // Validate question data
                if (!question.options || question.options.length !== 4) {
                    throw new Error('Each question must have exactly 4 options for question_table');
                }
                
                // Find which option is the correct answer
                const correctAnswerIndex = question.options.findIndex(opt => opt === question.correct_answer);
                if (correctAnswerIndex === -1) {
                    throw new Error('Correct answer must match one of the options');
                }
                
                // Convert to a/b/c/d format
                const rightAnswerLetter = ['a', 'b', 'c', 'd'][correctAnswerIndex];
                
                // SQL to insert into question_table
                const insertQuestionQuery = `
                    INSERT INTO question_table (
                        question_title,
                        answer_title_a,
                        answer_title_b,
                        answer_title_c,
                        answer_title_d,
                        right_answer,
                        explanation,
                        online_exam_ids,
                        verified,
                        quiz_details_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING *
                `;
                
                const questionValues = [
                    question.question,
                    question.options[0],
                    question.options[1],
                    question.options[2],
                    question.options[3],
                    rightAnswerLetter,
                    question.explanation || null, // The new explanation field
                    [onlineExamId],  // Store as PostgreSQL array
                    true,  // Questions created by teachers are verified by default
                    quizId  // Link to the parent quiz_details record
                ];
                
                const questionResult = await client.query(insertQuestionQuery, questionValues);
                insertedQuestions.push(questionResult.rows[0]);
            }
            
            // Commit the transaction
            await client.query('COMMIT');
            
            // Format the inserted questions to include in the response
            const formattedQuestions = insertedQuestions.map(q => {
                const options = [q.answer_title_a, q.answer_title_b, q.answer_title_c, q.answer_title_d];
                const correctIndex = 'abcd'.indexOf(q.right_answer.toLowerCase());
                
                return {
                    question_id: q.question_id,
                    question_type: 'mcq',
                    question: q.question_title,
                    options: options,
                    correct_answer: options[correctIndex],
                    right_answer: q.right_answer,
                    explanation: q.explanation,
                    online_exam_ids: q.online_exam_ids,
                    verified: q.verified,
                    created_at: q.created_at,
                    updated_at: q.updated_at
                };
            });
            
            // Return success with quiz details and questions
            res.status(201).json({
                success: true,
                message: 'Quiz and questions successfully inserted',
                data: {
                    quiz_id: quizId,
                    online_exam_id: onlineExamId,
                    quiz_details: quizDetailsResult.rows[0],
                    questions_count: insertedQuestions.length,
                    questions: formattedQuestions // Include the formatted questions in the response
                }
            });
            
        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            console.error('Error inserting quiz:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to insert quiz', 
                error: error.message 
            });
        } finally {
            client.release();
        }
    });
    
    // Update a quiz
    app.put('/quiz/:id', async (req, res) => {
        const client = await db.connect();
        
        try {
            const quizId = req.params.id;
            const {
                title,
                description,
                tense_id,
                difficulty_level,
                time_per_question,
                number_of_questions,
                status
            } = req.body;
            
            // Check if quiz exists
            const checkQuizQuery = 'SELECT * FROM quiz_details WHERE id = $1';
            const quizResult = await client.query(checkQuizQuery, [quizId]);
            
            if (quizResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Quiz not found' });
            }
            
            // Update quiz details
            const updateQuery = `
                UPDATE quiz_details
                SET 
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    tense_id = COALESCE($3, tense_id),
                    difficulty_level = COALESCE($4, difficulty_level),
                    time_per_question = COALESCE($5, time_per_question),
                    number_of_questions = COALESCE($6, number_of_questions),
                    status = COALESCE($7, status),
                    updated_at = NOW()
                WHERE id = $8
                RETURNING *
            `;
            
            const updateValues = [
                title,
                description,
                tense_id,
                difficulty_level,
                time_per_question,
                number_of_questions,
                status,
                quizId
            ];
            
            const updatedQuizResult = await client.query(updateQuery, updateValues);
            const updatedQuiz = updatedQuizResult.rows[0];
            
            res.json({
                success: true,
                message: 'Quiz updated successfully',
                data: updatedQuiz
            });
            
        } catch (error) {
            console.error('Error updating quiz:', error);
            res.status(500).json({ success: false, message: 'Failed to update quiz', error: error.message });
        } finally {
            client.release();
        }
    });

    // Save quiz performance data
    app.post('/quiz-performance', ensureAuthenticated, async (req, res) => {
        const client = await db.connect();
        
        try {
            const userId = req.userId;

            const {
                quiz_details_id,
                tense_id,
                total_questions,
                correct_answers,
                incorrect_answers,
                total_time_taken,
                incorrect_question_data,
                missed_questions
            } = req.body;

            // Validate required fields
            if (!quiz_details_id || !tense_id || !total_questions) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz details ID, tense ID, and total questions are required'
                });
            }

            // Convert values to proper numeric types
            const numTotalQuestions = parseInt(total_questions);
            const numCorrectAnswers = parseInt(correct_answers || 0);
            const numIncorrectAnswers = parseInt(incorrect_answers || 0);
            const numTotalTimeTaken = parseFloat(total_time_taken || 0);

            // Validate that the quiz_details_id exists in the database
            const quizCheckResult = await client.query(
                'SELECT id FROM quiz_details WHERE id = $1',
                [quiz_details_id]
            );

            if (quizCheckResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Quiz with ID '${quiz_details_id}' does not exist in the database`
                });
            }
            
            // Validate that the tense_id exists in the database
            const tenseCheckResult = await client.query(
                'SELECT id FROM tense_table WHERE id = $1',
                [tense_id]
            );

            if (tenseCheckResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Tense with ID '${tense_id}' does not exist in the database`
                });
            }

            // Calculate average time per question
            const avg_time_per_question = numTotalQuestions > 0 ? numTotalTimeTaken / numTotalQuestions : 0;

            // Create a new QuizPerformance instance
            const performanceData = new QuizPerformance(null, null, {
                id: uuidv4(),
                quiz_details_id,
                tense_id,
                user_id: userId,
                total_questions: numTotalQuestions,
                correct_answers: numCorrectAnswers,
                incorrect_answers: numIncorrectAnswers,
                total_time_taken: numTotalTimeTaken,
                avg_time_per_question,
                incorrect_question_data: incorrect_question_data || [],
                missed_questions: missed_questions || []
            });

            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // Save the performance data
            performanceService.INSERT(performanceData, (result) => {
                if (result.code) {
                    return res.status(500).json({
                        success: false,
                        message: result.message || 'Failed to save quiz performance data',
                        error: result
                    });
                }

                // Get the saved data to ensure consistency between GET and POST responses
                performanceService.GET_USER_STATS(userId, (stats) => {
                    if (stats.code) {
                        // If getting stats fails, still return the inserted performance data
                        return res.status(201).json({
                            success: true,
                            message: 'Quiz performance data saved successfully',
                            data: result.toObject()
                        });
                    }

                    // Get tense stats to show in the response
                    performanceService.GET_USER_TENSE_STATS(userId, (tenseStats) => {
                        if (tenseStats.code) {
                            // If getting tense stats fails, still return the overall stats
                            return res.status(201).json({
                                success: true,
                                message: 'Quiz performance data saved successfully',
                                data: {
                                    performance: result.toObject(),
                                    overall: stats
                                }
                            });
                        }

                        // Return complete statistics along with the saved performance data
                        return res.status(201).json({
                            success: true,
                            message: 'Quiz performance data saved successfully',
                            data: {
                                performance: result.toObject(),
                                overall: stats,
                                byTense: tenseStats
                            }
                        });
                    });
                });
            });

        } catch (error) {
            console.error('Error saving quiz performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save quiz performance data',
                error: error.message
            });
        } finally {
            client.release();
        }
    });

    // Get quiz performance history for a user
    app.get('/quiz-performance/user/', ensureAuthenticated, async (req, res) => {
        try {
            const userId = req.userId;
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // Get user's performance history
            performanceService.SELECT({ user_id: userId }, (results) => {
                if (results.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz performance data',
                        error: results
                    });
                }

                // Format the results
                const formattedResults = Array.isArray(results) ? results.map(r => r.toObject()) : [];

                return res.status(200).json({
                    success: true,
                    data: formattedResults
                });
            });

        } catch (error) {
            console.error('Error retrieving quiz performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz performance data',
                error: error.message
            });
        }
    });

    // Backward compatibility for the user ID in path
    app.get('/quiz-performance/user/:user_id', ensureAuthenticated, async (req, res) => {
        try {
            const userId = req.userId;
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // Get user's performance history
            performanceService.SELECT({ user_id: userId }, (results) => {
                if (results.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz performance data',
                        error: results
                    });
                }

                // Format the results
                const formattedResults = Array.isArray(results) ? results.map(r => r.toObject()) : [];

                return res.status(200).json({
                    success: true,
                    data: formattedResults
                });
            });

        } catch (error) {
            console.error('Error retrieving quiz performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz performance data',
                error: error.message
            });
        }
    });

    // Get quiz performance statistics for a user
    // This endpoint supports two patterns:
    // 1. /quiz-performance/stats/:user_id (for backward compatibility)
    // 2. /quiz-performance/stats (using token authentication)
    app.get('/quiz-performance/stats/:user_id', ensureAuthenticated, async (req, res) => {
        try {
            // Always use the authenticated user ID from the token
            const userId = req.userId;
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // Get user's performance statistics
            performanceService.GET_USER_STATS(userId, (stats) => {
                if (stats.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz statistics',
                        error: stats
                    });
                }

                // Get user's statistics by tense
                performanceService.GET_USER_TENSE_STATS(userId, (tenseStats) => {
                    if (tenseStats.code) {
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to retrieve quiz tense statistics',
                            error: tenseStats
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        data: {
                            overall: stats,
                            byTense: tenseStats
                        }
                    });
                });
            });

        } catch (error) {
            console.error('Error retrieving quiz statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz statistics',
                error: error.message
            });
        }
    });
    
    // New endpoint that doesn't require user_id in the URL
    app.get('/quiz-performance/stats', ensureAuthenticated, async (req, res) => {
        try {
            const userId = req.userId;
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // First, get all individual quiz performance records
            performanceService.SELECT({ user_id: userId }, (performanceRecords) => {
                if (performanceRecords.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz performance records',
                        error: performanceRecords
                    });
                }

                // Format the results
                const formattedPerformanceRecords = Array.isArray(performanceRecords) 
                    ? performanceRecords.map(r => r.toObject()) 
                    : [];

                // Now get the user's performance statistics
                performanceService.GET_USER_STATS(userId, (stats) => {
                    if (stats.code) {
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to retrieve quiz statistics',
                            error: stats
                        });
                    }

                    // Get user's statistics by tense
                    performanceService.GET_USER_TENSE_STATS(userId, (tenseStats) => {
                        if (tenseStats.code) {
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to retrieve quiz tense statistics',
                                error: tenseStats
                            });
                        }

                        // Return all data in a single response
                        return res.status(200).json({
                            success: true,
                            data: {
                                performances: formattedPerformanceRecords,
                                overall: stats,
                                byTense: tenseStats
                            }
                        });
                    });
                });
            });

        } catch (error) {
            console.error('Error retrieving quiz statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz statistics',
                error: error.message
            });
        }
    });

    // Get quiz performance data for a specific quiz and user
    app.get('/quiz-performance/:quiz_id/user/:user_id', ensureAuthenticated, async (req, res) => {
        try {
            const quizId = req.params.quiz_id;
            const userId = req.userId;
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // Get performance data for the specific quiz and user
            performanceService.SELECT({ 
                quiz_details_id: quizId, 
                user_id: userId 
            }, (results) => {
                if (results.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz performance data',
                        error: results
                    });
                }

                // Format the results
                const formattedResults = Array.isArray(results) ? results.map(r => r.toObject()) : [];

                return res.status(200).json({
                    success: true,
                    data: formattedResults
                });
            });

        } catch (error) {
            console.error('Error retrieving quiz performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz performance data',
                error: error.message
            });
        }
    });

    // New endpoint for getting quiz performance by quiz ID without user ID in URL
    app.get('/quiz-performance/:quiz_id', ensureAuthenticated, async (req, res) => {
        try {
            const quizId = req.params.quiz_id;
            const userId = req.userId;
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();

            // Get performance data for the specific quiz and user
            performanceService.SELECT({ 
                quiz_details_id: quizId, 
                user_id: userId 
            }, (results) => {
                if (results.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz performance data',
                        error: results
                    });
                }

                // Format the results
                const formattedResults = Array.isArray(results) ? results.map(r => r.toObject()) : [];

                return res.status(200).json({
                    success: true,
                    data: formattedResults
                });
            });

        } catch (error) {
            console.error('Error retrieving quiz performance:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz performance data',
                error: error.message
            });
        }
    });

    // Update a quiz performance question mark_for_review status
    app.patch('/quiz-performance/id/:performance_id/question/:question_id', ensureAuthenticated, async (req, res) => {
        try {
            const performanceId = req.params.performance_id;
            const questionId = parseInt(req.params.question_id);
            const { mark_for_review } = req.body;
            
            if (mark_for_review === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'mark_for_review field is required'
                });
            }
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();
            
            // First, get the quiz performance record
            performanceService.SELECT({ id: performanceId }, async (results) => {
                if (results.code || !Array.isArray(results) || results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Quiz performance not found',
                        error: results.code ? results : 'No records found'
                    });
                }
                
                // Get the first result (should be the only one)
                const performance = results[0];
                
                // Make sure this performance belongs to the authenticated user
                if (performance.user_id !== req.userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Unauthorized access to this quiz performance data'
                    });
                }
                
                // Get the incorrect_question_data array
                let incorrectQuestionData = performance.incorrect_question_data || [];
                
                // Find the specific question by ID and update its mark_for_review status
                let questionFound = false;
                incorrectQuestionData = incorrectQuestionData.map(question => {
                    if (question.question_id === questionId) {
                        questionFound = true;
                        return {
                            ...question,
                            mark_for_review: mark_for_review
                        };
                    }
                    return question;
                });
                
                if (!questionFound) {
                    return res.status(404).json({
                        success: false,
                        message: `Question with ID ${questionId} not found in this quiz performance record`
                    });
                }
                
                // Update the performance record with the modified question data
                performance.incorrect_question_data = incorrectQuestionData;
                
                // Save the updated performance record
                performanceService.UPDATE(performance, (result) => {
                    if (result.code) {
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update mark_for_review status',
                            error: result
                        });
                    }
                    
                    return res.status(200).json({
                        success: true,
                        message: `Question ${questionId} mark_for_review status updated to ${mark_for_review}`,
                        data: {
                            performance_id: performanceId,
                            question_id: questionId,
                            mark_for_review: mark_for_review
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error updating mark_for_review status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update mark_for_review status',
                error: error.message
            });
        }
    });

    // Get quiz performance stats for a specific tense by ID
    app.get('/quiz-performance/stats/bytenseid/:tense_id', ensureAuthenticated, async (req, res) => {
        try {
            const tenseId = req.params.tense_id;
            const userId = req.userId;
            
            // Validate tense_id parameter
            if (!tenseId) {
                return res.status(400).json({
                    success: false,
                    message: 'Tense ID is required'
                });
            }
            
            // Create a QuizPerformanceService instance
            const performanceService = new QuizPerformanceService();
            
            // Get performance data for the specific tense and user
            performanceService.SELECT({ 
                tense_id: tenseId,
                user_id: userId 
            }, (results) => {
                if (results.code) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve quiz performance data for tense',
                        error: results
                    });
                }
                
                // Format the results to match the expected response structure
                const formattedResults = Array.isArray(results) 
                    ? results.map(r => {
                        const obj = r.toObject();
                        return {
                            id: obj.id,
                            quiz_details_id: obj.quiz_details_id,
                            tense_id: obj.tense_id,
                            user_id: obj.user_id,
                            total_questions: obj.total_questions,
                            correct_answers: obj.correct_answers,
                            incorrect_answers: obj.incorrect_answers,
                            total_time_taken: obj.total_time_taken,
                            avg_time_per_question: obj.avg_time_per_question
                        };
                    }) 
                    : [];
                
                return res.status(200).json({
                    success: true,
                    performances: formattedResults
                });
            });
            
        } catch (error) {
            console.error('Error retrieving quiz performance stats by tense:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve quiz performance stats for tense',
                error: error.message
            });
        }
    });
};