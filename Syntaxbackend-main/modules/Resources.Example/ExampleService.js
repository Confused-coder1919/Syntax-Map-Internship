const ExampleDao = require('./ExampleDao');

class ExampleService {
    #exampleDao = new ExampleDao();

    INSERT(bodyNewExample, callback) {
        if (bodyNewExample) {
            this.#exampleDao.INSERT(bodyNewExample, callback);
        } else {
            this.#exampleDao.ErrorHandling({ code: null }, callback);
        }
    }

    UPDATE(example, callback) {
        this.#exampleDao.UPDATE(example, callback);
    }

    SELECT(criteria, callback) {
        if (criteria) {
            this.#exampleDao.SELECT(criteria, callback);
        } else {
            this.#exampleDao.ErrorHandling({ code: null }, callback);
        }
    }

    DELETE(example, callback) {
        this.#exampleDao.DELETE(example, callback);
    }
    
    // Get examples pending teacher review
    GET_PENDING_REVIEWS(callback) {
        this.#exampleDao.GET_PENDING_REVIEWS(callback);
    }
    
    // Review a student submission
    REVIEW_EXAMPLE(exampleId, reviewerId, approved, feedback, callback) {
        if (exampleId && reviewerId) {
            this.#exampleDao.REVIEW_EXAMPLE(exampleId, reviewerId, approved, feedback, callback);
        } else {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST",
                message: "Example ID and reviewer ID are required"
            }, callback);
        }
    }
    
    // Submit student example (enforces student role check)
    SUBMIT_STUDENT_EXAMPLE(example, studentId, userRole, callback) {
        if (!example || !studentId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "Example content and student ID are required" 
            }, callback);
            return;
        }
        
        // Check if user has student role (3) or teacher/admin role (2/1)
        if (userRole !== 1 && userRole !== 2 && userRole !== 3) {
            this.#exampleDao.ErrorHandling({ 
                code: "UNAUTHORIZED", 
                message: "Only students, teachers, and admins can submit examples" 
            }, callback);
            return;
        }
        
        // Set appropriate flags for student submission
        example.student_submission = true;
        example.teacher_reviewed = false;
        example.submitter_id = studentId;
        example.submitted_date = new Date().toISOString();
        example.user_id = studentId;
        
        this.#exampleDao.INSERT(example, callback);
    }
    
    // Get examples by tense with role-based access control
    GET_EXAMPLES_BY_TENSE(tenseId, userRole, callback) {
        if (!tenseId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "Tense ID is required" 
            }, callback);
            return;
        }
        
        const criteria = { tense_id: tenseId };
        
        // For guests, only show approved examples
        if (userRole === 4) {
            criteria.teacher_reviewed = true;
            criteria.orderBy = 'difficulty_level';
            criteria.orderDirection = 'ASC';
        }
        
        this.#exampleDao.SELECT(criteria, callback);
    }
    
    // Get examples submitted by a specific student
    GET_STUDENT_EXAMPLES(studentId, callback) {
        if (!studentId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "Student ID is required" 
            }, callback);
            return;
        }
        
        const criteria = { 
            user_id: studentId,
            orderBy: 'created_at',
            orderDirection: 'DESC'
        };
        
        this.#exampleDao.SELECT(criteria, callback);
    }
    
    // Get examples by difficulty level
    GET_EXAMPLES_BY_DIFFICULTY(difficultyLevel, callback) {
        if (!difficultyLevel && difficultyLevel !== 0) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "Difficulty level is required" 
            }, callback);
            return;
        }
        
        this.#exampleDao.SELECT({ difficulty_level: difficultyLevel }, callback);
    }
    
    // Get examples with filtering options, for admin/teacher dashboard
    GET_FILTERED_EXAMPLES(filters, userRole, callback) {
        // Only teachers and admins can access this comprehensive filtering
        if (userRole !== 1 && userRole !== 2) {
            this.#exampleDao.ErrorHandling({ 
                code: "UNAUTHORIZED", 
                message: "Only teachers and admins can access this feature" 
            }, callback);
            return;
        }
        
        this.#exampleDao.SELECT(filters, callback);
    }
    
    // Get example statistics (for teacher/admin dashboard)
    GET_EXAMPLE_STATISTICS(callback) {
        this.#exampleDao.GET_STATISTICS(callback);
    }
    
    // Create a new user example
    CREATE_USER_EXAMPLE(example, userId, callback) {
        if (!example || !userId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "Example content and user ID are required" 
            }, callback);
            return;
        }
        
        // Set appropriate metadata
        example.user_id = userId;
        example.student_submission = true;
        example.teacher_reviewed = false;
        example.shared_with_teacher = false;
        example.created_at = new Date().toISOString();
        
        this.#exampleDao.INSERT(example, callback);
    }
    
    // Get all examples by a specific user
    GET_USER_EXAMPLES(userId, callback) {
        if (!userId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "User ID is required" 
            }, callback);
            return;
        }
        
        this.#exampleDao.SELECT({ user_id: userId }, callback);
    }
    
    // Get examples for a specific tense by a specific user
    GET_USER_TENSE_EXAMPLES(userId, tenseId, callback) {
        if (!userId || !tenseId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "User ID and Tense ID are required" 
            }, callback);
            return;
        }
        
        this.#exampleDao.SELECT({ 
            user_id: userId, 
            tense_id: tenseId 
        }, callback);
    }
    
    // Share or unshare an example with teachers
    TOGGLE_SHARE_WITH_TEACHER(exampleId, isShared, callback) {
        if (!exampleId) {
            this.#exampleDao.ErrorHandling({ 
                code: "INVALID_REQUEST", 
                message: "Example ID is required" 
            }, callback);
            return;
        }
        
        this.#exampleDao.TOGGLE_SHARE_WITH_TEACHER(exampleId, isShared, callback);
    }
    
    // Get all examples shared with teachers
    GET_SHARED_EXAMPLES(callback) {
        this.#exampleDao.GET_SHARED_EXAMPLES(callback);
    }
}

module.exports = ExampleService;
