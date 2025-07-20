import { getBackendUrl } from '../config';

/**
 * API Client for SyntaxMap
 * 
 * This module provides a structured interface to all backend endpoints,
 * organized by resource type for easier maintenance.
 */
class ApiClient {
  /**
   * Make a request to the backend API
   * @param {string} endpoint - API endpoint 
   * @param {Object} options - Request options
   * @param {number} retries - Number of retries on failure
   * @returns {Promise} - Promise resolving to the API response
   */
  async request(endpoint, options = {}, retries = 1) {
    try {
      // Get the current backend URL (with fallback handling)
      const baseUrl = await getBackendUrl();
      
      // Ensure options.headers exists
      options.headers = options.headers || {};
      
      // Set default Content-Type if not provided and not FormData
      if (!options.headers['Content-Type'] && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
      }
      
      // Add authentication token if available
      const token = localStorage.getItem("jstoken");
      if (token) {
        options.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      }
      
      // Convert body to JSON if it's an object and not FormData
      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        options.body = JSON.stringify(options.body);
      }
      
      // Normalize endpoint to ensure it starts with '/'
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Make the request
      const response = await fetch(`${baseUrl}${normalizedEndpoint}`, options);
      
      // Handle error responses
      if (!response.ok) {
        // Try to parse error details
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // If parsing fails, create a basic error object
          errorData = { msg: `HTTP Error: ${response.status}` };
        }
        
        // Special handling for authentication errors
        if (response.status === 401) {
          console.warn('Authentication error. User may need to log in again.');
          // You could trigger auth refresh or redirect to login
        }
        
        const error = new Error(errorData.msg || `HTTP Error ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      // Handle network errors with retry logic
      if ((error.name === 'TypeError' || error.name === 'AbortError') && retries > 0) {
        console.warn(`Network error: ${error.message}. Retrying... (${retries} attempts left)`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the request
        return this.request(endpoint, options, retries - 1);
      }
      
      // Re-throw the error if we can't retry
      throw error;
    }
  }

  // Convenience methods for different HTTP methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  async delete(endpoint, data = {}, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE', body: data });
  }

  /**
   * Upload a file to the backend
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData with files
   * @param {Function} progressCallback - Optional callback for upload progress
   * @returns {Promise} - Promise resolving to the API response
   */
  async uploadFile(endpoint, formData, progressCallback = null) {
    // If no progress tracking is needed, use the standard request method
    if (!progressCallback) {
      return this.request(endpoint, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary
      });
    }
    
    // If progress tracking is needed, use XHR
    const baseUrl = await getBackendUrl();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
      
      // Add authentication token if available
      const token = localStorage.getItem("jstoken");
      if (token) {
        xhr.setRequestHeader('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
      }
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressCallback(percentComplete, event);
        }
      });
      
      // Handle response
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          try {
            const contentType = xhr.getResponseHeader('Content-Type');
            if (contentType && contentType.includes('application/json')) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              resolve(xhr.responseText);
            }
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          let errorData = {};
          try {
            errorData = JSON.parse(xhr.responseText);
          } catch (e) {
            // If parsing fails, create a basic error object
            errorData = { msg: `HTTP Error: ${this.status}` };
          }
          reject(errorData);
        }
      };
      
      // Handle network errors
      xhr.onerror = function() {
        reject({ msg: 'Network error occurred' });
      };
      
      // Send the request
      xhr.send(formData);
    });
  }
  
  // ==========================================
  // USER & AUTHENTICATION ENDPOINTS
  // ==========================================
  auth = {
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - User data with JWT token
     */
    login: (email, password) => {
      return this.post('/user/login', {
        user_email_address: email,
        user_password: password
      });
    },

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Created user data
     */
    register: (userData) => {
      return this.post('/user/register', userData);
    },
    
    /**
     * Verify OTP code
     * @param {string} email - User email
     * @param {string} otpCode - OTP code received via email
     * @returns {Promise<Object>} - Verification response
     */
    verifyOtp: (email, otpCode) => {
      return this.post('/user/verify-otp', {
        user_email_address: email,
        otp_code: otpCode
      });
    },
    
    /**
     * Resend OTP code
     * @param {string} email - User email
     * @returns {Promise<Object>} - Response with confirmation message
     */
    resendOtp: (email) => {
      return this.post('/user/resend-otp', {
        user_email_address: email
      });
    },
    
    /**
     * Check user role
     * @returns {Promise<Object>} - User role information
     */
    checkRole: () => {
      return this.post('/user/role', {});
    },
    
    /**
     * Reset password request (forgot password)
     * @param {string} email - User email
     * @returns {Promise<Object>} - Response with confirmation
     */
    forgotPassword: (email) => {
      return this.post('/user/forgotpassword', {
        user_email_address: email
      });
    },

    /**
     * Set new password with token (after forgot password)
     * @param {string} token - Password reset token
     * @param {string} password - New password
     * @returns {Promise<Object>} - Response with confirmation
     */
    resetPassword: (token, password) => {
      return this.post('/user/resetpassword', {
        token,
        user_password: password
      });
    },
    
    /**
     * Update user's last session
     * @param {string} session - Session identifier
     * @returns {Promise<Object>} - Response with confirmation
     */
    updateLastSession: (session) => {
      return this.post('/user/last_session', {
        session
      });
    }
  };
  
  // ==========================================
  // USER MANAGEMENT ENDPOINTS
  // ==========================================
  users = {
    /**
     * Get all users (admin only)
     * @returns {Promise<Object>} - List of users
     */
    getAll: () => {
      return this.get('/user');
    },
    
    /**
     * Update user role (admin only)
     * @param {string} userId - User ID
     * @param {number} roleId - New role ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    updateRole: (userId, roleId) => {
      return this.post('/user/update-role', {
        user_id: userId,
        user_role: roleId
      });
    },
    
    /**
     * Update user role by email (admin only)
     * @param {string} email - User email
     * @param {number} roleId - New role ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    updateRoleByEmail: (email, roleId) => {
      return this.post('/user/update-role-by-email', {
        user_email: email,
        user_role: roleId
      });
    },
    
    /**
     * Direct update role by email (admin only, no auth in header)
     * @param {string} email - User email
     * @param {number} roleId - New role ID
     * @param {string} adminToken - Admin token
     * @returns {Promise<Object>} - Response with confirmation
     */
    directUpdateRoleByEmail: (email, roleId, adminToken) => {
      return this.post('/admin/direct-update-role-by-email', {
        user_email: email,
        user_role: roleId,
        admin_token: adminToken
      });
    },
    
    /**
     * Request role upgrade (for students/guests)
     * @param {number} requestedRole - Requested role ID
     * @param {string} reason - Reason for upgrade request
     * @returns {Promise<Object>} - Response with confirmation
     */
    requestRoleUpgrade: (requestedRole, reason) => {
      return this.post('/user/request-role-upgrade', {
        requested_role: requestedRole,
        reason
      });
    },
    
    /**
     * Check role request status
     * @returns {Promise<Object>} - Status of user's role request
     */
    checkRoleRequestStatus: () => {
      return this.get('/user/role-request-status');
    },
    
    /**
     * Get role upgrade requests (admin only)
     * @param {string} status - Filter by status (pending, approved, rejected)
     * @returns {Promise<Object>} - List of role requests
     */
    getRoleRequests: (status = 'pending') => {
      return this.get(`/admin/role-requests?status=${status}`);
    },
    
    /**
     * Process role upgrade request (admin only)
     * @param {string} requestId - Request ID
     * @param {string} decision - Decision (approved or rejected)
     * @param {string} adminNote - Optional note explaining decision
     * @returns {Promise<Object>} - Response with confirmation
     */
    processRoleRequest: (requestId, decision, adminNote = '') => {
      return this.post('/admin/process-role-request', {
        request_id: requestId,
        decision,
        admin_note: adminNote
      });
    }
  };
  
  // ==========================================
  // TENSE MAP ENDPOINTS 
  // ==========================================
  tenses = {
    /**
     * Get all tenses
     * @returns {Promise<Object>} - List of tenses
     */
    getAll: () => {
      return this.get('/tense');
    },
    
    /**
     * Get tense by ID
     * @param {string} tenseId - Tense ID
     * @returns {Promise<Object>} - Tense details
     */
    getById: (tenseId) => {
      return this.get(`/tense/${tenseId}`);
    },
    
    /**
     * Create new tense (admin only)
     * @param {Object} tenseData - Tense data
     * @returns {Promise<Object>} - Created tense
     */
    create: (tenseData) => {
      return this.post('/tense', tenseData);
    },
    
    /**
     * Update tense (admin only)
     * @param {string} tenseId - Tense ID
     * @param {Object} tenseData - Updated tense data
     * @returns {Promise<Object>} - Updated tense
     */
    update: (tenseId, tenseData) => {
      return this.put(`/tense/${tenseId}`, tenseData);
    },
    
    /**
     * Delete tense (admin only)
     * @param {string} tenseId - Tense ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    delete: (tenseId) => {
      return this.delete(`/tense/${tenseId}`);
    }
  };
  
  // ==========================================
  // QUIZ ENDPOINTS
  // ==========================================
  quizzes = {
    /**
     * Get all quizzes
     * @returns {Promise<Object>} - List of quizzes
     */
    getAll: () => {
      return this.get('/quiz');
    },
    
    /**
     * Get quiz by ID
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} - Quiz details
     */
    getById: (quizId) => {
      return this.get(`/quiz/${quizId}`);
    },
    
    /**
     * Get quizzes by tense ID
     * @param {string} tenseId - Tense ID
     * @returns {Promise<Object>} - List of quizzes for that tense
     */
    getByTense: (tenseId) => {
      return this.get(`/quiz/bytense/${tenseId}`);
    },
    
    /**
     * Create new quiz (admin/teacher only)
     * @param {Object} quizData - Quiz data
     * @returns {Promise<Object>} - Created quiz
     */
    create: (quizData) => {
      return this.post('/quiz', quizData);
    },
    
    /**
     * Update quiz (admin/teacher only)
     * @param {string} quizId - Quiz ID
     * @param {Object} quizData - Updated quiz data
     * @returns {Promise<Object>} - Updated quiz
     */
    update: (quizId, quizData) => {
      return this.put(`/quiz/${quizId}`, quizData);
    },
    
    /**
     * Delete quiz (admin/teacher only)
     * @param {string} quizId - Quiz ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    delete: (quizId) => {
      return this.delete(`/quiz/${quizId}`);
    },
    
    /**
     * Submit quiz answers
     * @param {string} quizId - Quiz ID
     * @param {Object} answers - User's answers
     * @returns {Promise<Object>} - Quiz results
     */
    submitAnswers: (quizId, answers) => {
      return this.post(`/quiz/${quizId}/submit`, answers);
    }
  };
  
  // ==========================================
  // QUESTION ENDPOINTS
  // ==========================================
  questions = {
    /**
     * Get all questions
     * @returns {Promise<Object>} - List of questions
     */
    getAll: () => {
      return this.get('/question');
    },
    
    /**
     * Get question by ID
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - Question details
     */
    getById: (questionId) => {
      return this.get(`/question/${questionId}`);
    },
    
    /**
     * Create new question (admin/teacher only)
     * @param {Object} questionData - Question data
     * @returns {Promise<Object>} - Created question
     */
    create: (questionData) => {
      return this.post('/question', questionData);
    },
    
    /**
     * Update question (admin/teacher only)
     * @param {string} questionId - Question ID
     * @param {Object} questionData - Updated question data
     * @returns {Promise<Object>} - Updated question
     */
    update: (questionId, questionData) => {
      return this.put(`/question/${questionId}`, questionData);
    },
    
    /**
     * Delete question (admin/teacher only)
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    delete: (questionId) => {
      return this.delete(`/question/${questionId}`);
    },
    
    /**
     * Get questions by tense ID
     * @param {string} tenseId - Tense ID
     * @returns {Promise<Object>} - List of questions for that tense
     */
    getByTense: (tenseId) => {
      return this.get(`/question/bytense/${tenseId}`);
    }
  };
  
  // ==========================================
  // NOTEPAD ENDPOINTS
  // ==========================================
  notepad = {
    /**
     * Get user's notes
     * @returns {Promise<Object>} - User's notepad entries
     */
    getNotes: () => {
      return this.get('/notepad');
    },
    
    /**
     * Create new note
     * @param {Object} noteData - Note data
     * @returns {Promise<Object>} - Created note
     */
    createNote: (noteData) => {
      return this.post('/notepad', noteData);
    },
    
    /**
     * Update note
     * @param {string} noteId - Note ID
     * @param {Object} noteData - Updated note data
     * @returns {Promise<Object>} - Updated note
     */
    updateNote: (noteId, noteData) => {
      return this.put(`/notepad/${noteId}`, noteData);
    },
    
    /**
     * Delete note
     * @param {string} noteId - Note ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    deleteNote: (noteId) => {
      return this.delete(`/notepad/${noteId}`);
    },
    
    /**
     * Get mistake questions for notepad
     * @returns {Promise<Object>} - Mistake questions
     */
    getMistakeQuestions: () => {
      return this.get('/mistakequestion');
    },
    
    /**
     * Get vocabulary words
     * @returns {Promise<Object>} - Vocabulary words
     */
    getVocabulary: () => {
      return this.get('/dictionnary');
    },
    
    /**
     * Add vocabulary word
     * @param {string} word - Word to add
     * @param {string} sessionName - Current session name
     * @returns {Promise<Object>} - Added word
     */
    addVocabularyWord: (word, sessionName) => {
      return this.post('/dictionnary', {
        word,
        session_name: sessionName
      });
    },
    
    /**
     * Mark vocabulary word as learned
     * @param {string} wordId - Word ID
     * @returns {Promise<Object>} - Updated word
     */
    markWordAsLearned: (wordId) => {
      return this.post(`/dictionnary/${wordId}/learned`, {});
    },
    
    /**
     * Get student example sentences
     * @returns {Promise<Object>} - Example sentences
     */
    getExamples: () => {
      return this.get('/userinputs/examples');
    },
    
    /**
     * Create example sentence
     * @param {Object} exampleData - Example data
     * @returns {Promise<Object>} - Created example
     */
    createExample: (exampleData) => {
      return this.post('/userinputs/examples', exampleData);
    }
  };
  
  // ==========================================
  // COURSE ENDPOINTS
  // ==========================================
  courses = {
    /**
     * Get all courses
     * @returns {Promise<Object>} - List of courses
     */
    getAll: () => {
      return this.get('/course');
    },
    
    /**
     * Get course by ID
     * @param {string} courseId - Course ID
     * @returns {Promise<Object>} - Course details
     */
    getById: (courseId) => {
      return this.get(`/course/${courseId}`);
    },
    
    /**
     * Create new course (admin/teacher only)
     * @param {Object} courseData - Course data
     * @returns {Promise<Object>} - Created course
     */
    create: (courseData) => {
      return this.post('/course', courseData);
    },
    
    /**
     * Update course (admin/teacher only)
     * @param {string} courseId - Course ID
     * @param {Object} courseData - Updated course data
     * @returns {Promise<Object>} - Updated course
     */
    update: (courseId, courseData) => {
      return this.put(`/course/${courseId}`, courseData);
    },
    
    /**
     * Delete course (admin/teacher only)
     * @param {string} courseId - Course ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    delete: (courseId) => {
      return this.delete(`/course/${courseId}`);
    }
  };
  
  // ==========================================
  // CLASS MANAGEMENT ENDPOINTS
  // ==========================================
  classes = {
    /**
     * Get all classes (teacher/admin only)
     * @returns {Promise<Object>} - List of classes
     */
    getAll: () => {
      return this.get('/classe');
    },
    
    /**
     * Get class by ID
     * @param {string} classId - Class ID
     * @returns {Promise<Object>} - Class details
     */
    getById: (classId) => {
      return this.get(`/classe/${classId}`);
    },
    
    /**
     * Create new class (teacher/admin only)
     * @param {Object} classData - Class data
     * @returns {Promise<Object>} - Created class
     */
    create: (classData) => {
      return this.post('/classe', classData);
    },
    
    /**
     * Update class (teacher/admin only)
     * @param {string} classId - Class ID
     * @param {Object} classData - Updated class data
     * @returns {Promise<Object>} - Updated class
     */
    update: (classId, classData) => {
      return this.put(`/classe/${classId}`, classData);
    },
    
    /**
     * Delete class (teacher/admin only)
     * @param {string} classId - Class ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    delete: (classId) => {
      return this.delete(`/classe/${classId}`);
    },
    
    /**
     * Add student to class
     * @param {string} classId - Class ID
     * @param {string} studentId - Student ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    addStudent: (classId, studentId) => {
      return this.post(`/classe/${classId}/students`, {
        student_id: studentId
      });
    },
    
    /**
     * Remove student from class
     * @param {string} classId - Class ID
     * @param {string} studentId - Student ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    removeStudent: (classId, studentId) => {
      return this.delete(`/classe/${classId}/students/${studentId}`);
    }
  };
  
  // ==========================================
  // PROGRESS TRACKING ENDPOINTS
  // ==========================================
  progress = {
    /**
     * Get user's progress
     * @returns {Promise<Object>} - User progress data
     */
    getUserProgress: () => {
      return this.get('/dashboard/user-progress');
    },
    
    /**
     * Get student's progress (teacher/admin only)
     * @param {string} studentId - Student ID
     * @returns {Promise<Object>} - Student progress data
     */
    getStudentProgress: (studentId) => {
      return this.get(`/student/${studentId}/progress`);
    },
    
    /**
     * Get class progress (teacher/admin only)
     * @param {string} classId - Class ID
     * @returns {Promise<Object>} - Class progress data
     */
    getClassProgress: (classId) => {
      return this.get(`/classe/${classId}/progress`);
    },
    
    /**
     * Get student's notepad statistics (teacher/admin only)
     * @param {string} studentId - Student ID
     * @returns {Promise<Object>} - Notepad statistics
     */
    getStudentNotepadStats: (studentId) => {
      return this.get(`/student/${studentId}/note/stats`);
    },
    
    /**
     * Get admin analytics (admin only)
     * @returns {Promise<Object>} - Platform analytics
     */
    getAdminAnalytics: () => {
      return this.get('/dashboard/admin');
    },
    
    /**
     * Get teacher analytics (teacher/admin only)
     * @returns {Promise<Object>} - Teacher analytics
     */
    getTeacherAnalytics: () => {
      return this.get('/dashboard/teacher');
    }
  };
  
  // ==========================================
  // FILE UPLOAD ENDPOINTS
  // ==========================================
  uploads = {
    /**
     * Upload image
     * @param {FormData} formData - Form data with image
     * @param {Function} progressCallback - Optional progress callback
     * @returns {Promise<Object>} - Uploaded file data
     */
    uploadImage: (formData, progressCallback) => {
      return this.uploadFile('/userupload/image', formData, progressCallback);
    },
    
    /**
     * Upload document
     * @param {FormData} formData - Form data with document
     * @param {Function} progressCallback - Optional progress callback
     * @returns {Promise<Object>} - Uploaded file data
     */
    uploadDocument: (formData, progressCallback) => {
      return this.uploadFile('/userupload/document', formData, progressCallback);
    },
    
    /**
     * Get user uploads
     * @returns {Promise<Object>} - List of user uploads
     */
    getUserUploads: () => {
      return this.get('/userupload');
    },
    
    /**
     * Delete upload
     * @param {string} uploadId - Upload ID
     * @returns {Promise<Object>} - Response with confirmation
     */
    deleteUpload: (uploadId) => {
      return this.delete(`/userupload/${uploadId}`);
    }
  };
  
  // ==========================================
  // CONTACT/FEEDBACK ENDPOINTS
  // ==========================================
  contact = {
    /**
     * Submit contact form
     * @param {Object} contactData - Contact form data
     * @returns {Promise<Object>} - Response with confirmation
     */
    submitContactForm: (contactData) => {
      return this.post('/contact', contactData);
    },
    
    /**
     * Get all contact submissions (admin only)
     * @returns {Promise<Object>} - List of contact submissions
     */
    getAll: () => {
      return this.get('/contact');
    }
  };
}

// Create and export a singleton instance
const api = new ApiClient();
export default api;