const { v4: uuidv4 } = require('uuid');
const db = require('../config/db_connect');
const passport = require('passport');
const jwtDecode = require('jwt-decode');

module.exports = (app) => {
    const BASE_PATH = '/practice';

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
    
    // Authorization middleware for specific roles
    const authRole = (allowedRoles) => {
        return (req, res, next) => {
            passport.authenticate('user_connected', { session: false }, (err, user) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Authentication error' });
                }
                
                if (!user) {
                    return res.status(401).json({ success: false, message: 'Authentication required' });
                }
                
                // Get user role from either passport user object or token
                let userRole = user[0]?.user_role;
                
                if (userRole === undefined) {
                    userRole = extractUserRole(req);
                }
                
                if (allowedRoles.includes(userRole)) {
                    next();
                } else {
                    res.status(403).json({
                        success: false,
                        message: 'Access denied. Insufficient permissions.'
                    });
                }
            })(req, res, next);
        };
    };
   
    app.post(`${BASE_PATH}/quiz`, authRole([1, 2]), async (req, res) => {
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
            
            console.log("Inserting into quiz_details table...");
            const quizDetailsResult = await client.query(insertQuizDetailsQuery, quizDetailsValues);
            console.log("Quiz details inserted:", quizDetailsResult.rows[0]);
            
            // Create a unique online exam ID to link questions to this quiz
            const onlineExamId = Math.floor(Math.random() * 1000000) + 1;
            console.log("Generated online exam ID:", onlineExamId);
            
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
                    question.explanation || null, // Added explanation field
                    [onlineExamId],  // Store as PostgreSQL array
                    true,  // Questions created by teachers are verified by default
                    quizId  // Link to the parent quiz_details record
                ];
                
                console.log("Inserting question into question_table...");
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
                message: 'Quiz and questions successfully inserted into quiz_details and question_table',
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
            console.error('Error inserting into quiz_details or question_table:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to insert into quiz_details and question_table', 
                error: error.message 
            });
        } finally {
            client.release();
        }
    });

    app.get(`${BASE_PATH}/quiz/:id`, passport.authenticate('user_connected', { session: false }), async (req, res) => {
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
                    explanation,
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
                    explanation: q.explanation, // Include explanation in the response
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

    app.put(`${BASE_PATH}/quiz/:id`, authRole([1, 2]), async (req, res) => {
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

    
    app.get(BASE_PATH, authRole([1, 2]), async (req, res) => {
        const client = await db.connect();
        
        try {
            const { page = 1, limit = 10, verified, search } = req.query;
            const offset = (page - 1) * limit;
            
            let query = 'SELECT * FROM question_table';
            const queryParams = [];
            let paramCounter = 1;
            
            // Add WHERE clause if filters are provided
            const conditions = [];
            
            if (verified !== undefined) {
                conditions.push(`verified = $${paramCounter++}`);
                queryParams.push(verified === 'true');
            }
            
            if (search) {
                conditions.push(`question_title ILIKE $${paramCounter++}`);
                queryParams.push(`%${search}%`);
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            // Add pagination
            query += ` ORDER BY created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
            queryParams.push(parseInt(limit), parseInt(offset));
            
            // Execute query
            const result = await client.query(query, queryParams);
            
            // Get total count for pagination
            let countQuery = 'SELECT COUNT(*) FROM question_table';
            
            if (conditions.length > 0) {
                countQuery += ' WHERE ' + conditions.join(' AND ');
            }
            
            const countResult = await client.query(countQuery, queryParams.slice(0, -2));
            const totalCount = parseInt(countResult.rows[0].count);
            
            // Format questions for frontend
            const questions = result.rows.map(q => ({
                question_id: q.question_id,
                question: q.question_title,
                options: [q.answer_title_a, q.answer_title_b, q.answer_title_c, q.answer_title_d],
                correct_answer: ['a', 'b', 'c', 'd'].indexOf(q.right_answer.toLowerCase()),
                verified: q.verified,
                created_at: q.created_at,
                updated_at: q.updated_at
            }));
            
            res.json({
                success: true,
                data: questions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    pages: Math.ceil(totalCount / limit)
                }
            });
            
        } catch (error) {
            console.error('Error fetching questions:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch questions', error: error.message });
        } finally {
            client.release();
        }
    });

    // Get all quizzes with their associated questions
    app.get(`${BASE_PATH}/quizzes`, passport.authenticate('user_connected', { session: false }), async (req, res) => {
        const client = await db.connect();
        
        try {
            // Query to get all quiz details
            const quizQuery = 'SELECT * FROM quiz_details ORDER BY created_at DESC';
            const quizResult = await client.query(quizQuery);
            
            if (quizResult.rows.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    message: 'No quizzes found'
                });
            }
            
            // Get all quizzes with associated questions
            const quizzes = [];
            
            for (const quiz of quizResult.rows) {
                // Find the online_exam_id associated with this quiz
                const onlineExamQuery = `
                    SELECT DISTINCT unnest(online_exam_ids) as exam_id 
                    FROM question_table
                    WHERE online_exam_ids IS NOT NULL
                `;
                
                const examResult = await client.query(onlineExamQuery);
                const examIds = examResult.rows.map(row => row.exam_id);
                
                // For each quiz, try to find its questions
                if (examIds.length > 0) {
                    const questionsQuery = `
                        SELECT
                            question_id,
                            question_title,
                            answer_title_a,
                            answer_title_b,
                            answer_title_c,
                            answer_title_d,
                            right_answer,
                            explanation,
                            difficulty,
                            online_exam_ids,
                            verified,
                            created_at,
                            updated_at
                        FROM question_table
                        ORDER BY question_id
                        LIMIT $1
                    `;
                    
                    const questionsResult = await client.query(questionsQuery, [
                        quiz.number_of_questions || 10 // Default to 10 if not specified
                    ]);
                    
                    // Format questions for frontend
                    const questions = questionsResult.rows.map(q => {
                        const options = [q.answer_title_a, q.answer_title_b, q.answer_title_c, q.answer_title_d];
                        const correctIndex = 'abcd'.indexOf(q.right_answer.toLowerCase());
                        
                        return {
                            question_id: q.question_id,
                            question_type: 'mcq', // Default to mcq
                            question_title: q.question_title,
                            options: options,
                            correct_answer: options[correctIndex],
                            right_answer: q.right_answer,
                            explanation: q.explanation, // Include explanation in the response
                            difficulty: q.difficulty,
                            created_at: q.created_at,
                            updated_at: q.updated_at,
                            verified: q.verified
                        };
                    });
                    
                    quizzes.push({
                        ...quiz,
                        questions: questions
                    });
                } else {
                    // No questions found for this quiz
                    quizzes.push({
                        ...quiz,
                        questions: []
                    });
                }
            }
            
            // Return all quizzes with their questions
            res.json({
                success: true,
                data: quizzes
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

    // Single GET endpoint for /practice/quiz to retrieve all quizzes
    app.get(`${BASE_PATH}/quiz`, passport.authenticate('user_connected', { session: false }), async (req, res) => {
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
                queryParams.push(status);  // 'active' or 'inactive'
            }
            
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            
            // Add pagination
            query += ` ORDER BY created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
            queryParams.push(parseInt(limit), parseInt(offset));
            
            // Execute query
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
                        explanation,
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
                        explanation: q.explanation, // Include explanation in the response
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

    // PATCH endpoint for updating quiz status
    app.patch(`${BASE_PATH}/quiz/:id`, authRole([1, 2]), async (req, res) => {
        const client = await db.connect();
        
        try {
            const quizId = req.params.id;
            const { status } = req.body;
            
            if (!status || !['active', 'inactive'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid status (active or inactive) is required'
                });
            }
            
            // Check if quiz exists
            const checkQuizQuery = 'SELECT * FROM quiz_details WHERE id = $1';
            const quizResult = await client.query(checkQuizQuery, [quizId]);
            
            if (quizResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }
            
            // Update only the status field
            const updateQuery = `
                UPDATE quiz_details
                SET 
                    status = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            
            const updatedQuizResult = await client.query(updateQuery, [status, quizId]);
            const updatedQuiz = updatedQuizResult.rows[0];
            
            res.json({
                success: true,
                message: 'Quiz status updated successfully',
                data: updatedQuiz
            });
            
        } catch (error) {
            console.error('Error updating quiz status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update quiz status',
                error: error.message
            });
        } finally {
            client.release();
        }
    });
};
