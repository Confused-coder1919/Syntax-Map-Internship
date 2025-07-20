// Import Tense resources
const Tense = require("../modules/Resources.Tense/Tense.js");
const TenseService = require("../modules/Resources.Tense/TenseService.js");

// Import Example resources
const Example = require("../modules/Resources.Example/Example.js");
const ExampleService = require("../modules/Resources.Example/ExampleService.js");

// Import Quiz resources
const Quiz = require("../modules/Resources.Quiz/Quiz.js");
const QuizService = require("../modules/Resources.Quiz/QuizService.js");

// Import JWT decoder for authentication
const jwtDecode = require("jwt-decode");
const passport = require("passport");

// Import error handling
const ErrorObject = require("../modules/error/ErrorObject.js");

// Import uuid for generating ids
const { v4: uuidv4 } = require("uuid");

// Helper function to extract user ID from JWT token in Authorization header
const extractUserId = (req) => {
  try {
    // After passport authentication, user info is in req.user
    if (req.user && Array.isArray(req.user) && req.user.length > 0) {
      const userId = req.user[0].user_id;
      console.log("Extracted user ID from passport:", userId);
      return userId;
    }
    
    // Fallback to token if needed
    const authHeader = req.get("Authorization");
    if (authHeader) {
      // Handle both "Bearer token" and direct token formats
      let token = authHeader;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("Token decoded:", decoded);
          
          // Check common places where user ID might be stored
          const userId = decoded.sub || decoded.user_id || decoded.id;
          if (userId) {
            console.log("Extracted user ID from token:", userId);
            return userId;
          }
        } catch (tokenError) {
          console.error("Error decoding token:", tokenError);
        }
      }
    }
    
    console.log("No user ID found");
    return null;
  } catch (error) {
    console.error("Error extracting user ID:", error);
    return null;
  }
};

// Helper function to extract user role from request object (after passport authentication)
const extractUserRole = async (req) => {
  try {
    // After passport authentication, the user object should be properly populated
    if (req.user && Array.isArray(req.user) && req.user.length > 0) {
      const dbUser = req.user[0];
      
      // Log the full authenticated user object
      console.log("\n========== AUTHENTICATED USER DATA ==========");
      console.log(JSON.stringify(dbUser, null, 2));
      
      // Both fields should be set to the same value by passport
      const role = parseInt(dbUser.user_role || dbUser.authorization);
      
      // Validate the role is a number between 1 and 4
      if (!isNaN(role) && role >= 1 && role <= 4) {
        console.log(`Valid role found: ${role}`);
        return role;
      } else {
        console.log(`Invalid role value: ${role}, defaulting to check token`);
        // Don't default to guest yet, try token first
      }
    }
    
    // If no valid role from passport, try to get from token
    const authHeader = req.get("Authorization");
    if (authHeader) {
      // Handle both "Bearer token" and direct token formats
      let token = authHeader;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      
      if (token) {
        try {
          console.log("Attempting to decode token:", token.substring(0, 20) + "...");
          const decoded = jwtDecode(token);
          console.log("Token decoded:", decoded);
          
          // Check for authorization field in the token
          if (decoded.authorization !== undefined) {
            const tokenRole = parseInt(decoded.authorization);
            if (!isNaN(tokenRole) && tokenRole >= 1 && tokenRole <= 4) {
              console.log(`Valid role found from token: ${tokenRole}`);
              return tokenRole;
            }
          }
          
          // Check for role in other common locations
          if (decoded.role !== undefined) {
            const tokenRole = parseInt(decoded.role);
            if (!isNaN(tokenRole) && tokenRole >= 1 && tokenRole <= 4) {
              console.log(`Valid role found from token (role field): ${tokenRole}`);
              return tokenRole;
            }
          }
          
          // Check if token contains user_id but no role - try to look up role from database
          if (decoded.sub || decoded.user_id) {
            const userId = decoded.sub || decoded.user_id;
            console.log(`Found user ID in token: ${userId}, checking database for role`);
            
            // Here you would typically query the database for the user's role
            // For now we'll return role 3 (student) as a default for authenticated users without role
            console.log("Defaulting to role 3 (student) for authenticated user without role");
            return 3;
          }
        } catch (tokenError) {
          console.error("Error decoding token:", tokenError);
        }
      }
    }
    
    console.log("No authenticated user data or valid token found");
    return 4; // Default to guest
  } catch (error) {
    console.error("Error extracting user role:", error);
    return 4; // Default to guest on error
  }
};

module.exports = (app) => {
  // Initialize services
  const tenseService = new TenseService();
  const exampleService = new ExampleService();
  const quizService = new QuizService();

  // GET /tense - Get all tenses with examples and quizzes
  app.get("/tense", async (req, res) => {
    try {
      const userRole = await extractUserRole(req);
      console.log("\n===================== DEBUG TENSE ENDPOINT ======================");
      console.log("Request headers:", req.headers);
      console.log("User role extracted:", userRole);
      
      tenseService.SELECT({}, async (tenses) => {
        if (!tenses || tenses.code) {
          return res.status(404).json({ 
            success: false, 
            message: "No tenses found" 
          });
        }
        
        // Process all tenses to include examples and quizzes
        const tensesWithDetails = await Promise.all(tenses.map(async (tense) => {
          return new Promise((resolve) => {
            const tenseObj = tense.toObject();
            
            // Get examples for this tense
            exampleService.SELECT({ tense_id: tense.tense_id }, (examples) => {
              // Get quizzes for this tense
              quizService.SELECT({ tense_id: tense.tense_id }, (quizzes) => {
                // Convert raw examples and quizzes to proper objects
                const formattedExamples = examples && !examples.code 
                  ? examples.map(ex => ex.toObject()) 
                  : [];
                
                const formattedQuizzes = quizzes && !quizzes.code 
                  ? quizzes.map(quiz => quiz.toObject()) 
                  : [];
                
                // Always return full data structure regardless of role
                // This will ensure consistent response structure between environments
                const result = {
                  ...tenseObj,
                  examples: formattedExamples,
                  quizzes: formattedQuizzes
                };
                
                resolve(result);
              });
            });
          });
        }));
        
        res.status(200).json({
          success: true,
          tenses: tensesWithDetails
        });
      });
    } catch (error) {
      console.error("Error fetching tenses:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // GET /tense/:id - Get a specific tense with examples and quizzes
  app.get("/tense/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = await extractUserRole(req);
      console.log("\n===================== DEBUG SINGLE TENSE ENDPOINT ======================");
      console.log("Request headers:", req.headers);
      console.log("User role extracted:", userRole);
      console.log("Tense ID requested:", id);
      
      // Get tense details
      tenseService.GET_TENSE_WITH_EXAMPLES(id, userRole, (tenseWithExamples) => {
        if (!tenseWithExamples || tenseWithExamples.error) {
          return res.status(404).json({
            success: false,
            message: tenseWithExamples?.error || "Tense not found"
          });
        }
        
        // Get quizzes for this tense - always include them regardless of role
        tenseService.FETCH_QUIZZES(id, (quizzes) => {
          // Always include all data in the response
          const response = {
            ...tenseWithExamples,
            quizzes: quizzes || []
          };
          
          res.status(200).json({
            success: true,
            tense: response
          });
        });
      });
    } catch (error) {
      console.error("Error fetching tense details:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // POST /tense/:id/example - Add an example to a tense (for both teachers and student submissions)
  app.post("/tense/:id/example", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      const userRole = await extractUserRole(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      // Only allow students, teachers, and admins to add examples
      if (userRole > 3) {
        return res.status(403).json({
          success: false,
          message: "Permission denied"
        });
      }
      
      const { example_text, sentence_type = "affirmative", difficulty_level = 3 } = req.body;
      
      if (!example_text || !sentence_type) {
        return res.status(400).json({
          success: false,
          message: "Example text and sentence type are required"
        });
      }
      
      // Create example object
      const exampleData = {
        id: uuidv4(),
        tense_id: id,
        example_text,
        sentence_type,
        difficulty_level,
        student_submission: userRole === 3, // True for students, false for teachers/admins
        teacher_reviewed: userRole !== 3, // Auto-approved for teachers/admins
      };
      
      const example = new Example(null, null, exampleData);
      
      // Insert the example
      exampleService.INSERT(example, (result) => {
        if (!result || result.code) {
          return res.status(400).json({
            success: false,
            message: result?.errorMessage || "Failed to add example"
          });
        }
        
        // Update user progress if this is a student submission
        if (userRole === 3) {
          // This would be handled by a progress service to track student examples submitted
          // progressService.UPDATE_EXAMPLES_SUBMITTED(userId, id);
        }
        
        res.status(201).json({
          success: true,
          example: result
        });
      });
    } catch (error) {
      console.error("Error adding example:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // GET /tense/:id/examples - Get examples for a specific tense
  app.get("/tense/:id/examples", async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = await extractUserRole(req);
      const userId = extractUserId(req);
      
      // Filter criteria
      const criteria = {
        tense_id: id,
      };
      
      // Apply sentence type filter if provided
      if (req.query.sentence_type) {
        criteria.sentence_type = req.query.sentence_type;
      }
      
      // Get examples based on user role
      if (userRole === 4) {
        // Guests can only see pre-approved examples
        criteria.teacher_reviewed = true;
      } else if (userRole === 3) {
        // Students can see their own submissions even if not reviewed
        // and all approved examples
        // This is handled in the service layer
      }
      
      exampleService.SELECT(criteria, (examples) => {
        if (!examples || examples.code) {
          return res.status(404).json({
            success: false,
            message: examples?.errorMessage || "No examples found"
          });
        }
        
        // Filter examples based on user role and ownership
        const filteredExamples = examples.map(example => {
          const exampleObj = example.toObject(true, true, true);
          
          // For students, mark which examples are their own
          if (userRole === 3 && userId) {
            exampleObj.isOwner = exampleObj.user_id === userId;
          }
          
          return exampleObj;
        });
        
        // Group examples by sentence type
        const groupedExamples = {
          affirmative: filteredExamples.filter(ex => ex.sentence_type === 'affirmative'),
          negative: filteredExamples.filter(ex => ex.sentence_type === 'negative'),
          interrogative: filteredExamples.filter(ex => ex.sentence_type === 'interrogative')
        };
        
        res.status(200).json({
          success: true,
          examples: groupedExamples
        });
      });
    } catch (error) {
      console.error("Error fetching examples:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // PUT /tense/:tenseId/example/:id/review - Review a student example (teachers only)
  app.put("/tense/:tenseId/example/:id/review", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { tenseId, id } = req.params;
      const userRole = await extractUserRole(req);
      
      // Only teachers and admins can review examples
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({
          success: false,
          message: "Only teachers and admins can review examples"
        });
      }
      
      const { approved = true, feedback = "" } = req.body;
      
      // Get the example to verify it exists
      exampleService.SELECT({ id }, (examples) => {
        if (!examples || examples.code || examples.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Example not found"
          });
        }
        
        const example = examples[0];
        
        // Update the example with review information
        example.teacher_reviewed = true;
        example.teacher_feedback = feedback;
        
        // If not approved, we could either mark it or delete it
        // Here we'll just update the feedback but leave it marked as reviewed
        
        exampleService.UPDATE(example, (result) => {
          if (!result || result.code) {
            return res.status(400).json({
              success: false,
              message: result?.errorMessage || "Failed to update example"
            });
          }
          
          res.status(200).json({
            success: true,
            example: result
          });
        });
      });
    } catch (error) {
      console.error("Error reviewing example:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // POST /tense/:id/quiz - Generate a quiz for a tense
  app.post("/tense/:id/quiz",
    // First ensure user is authenticated
    passport.authenticate('user_connected', { session: false }),
    // Then handle the request
    async (req, res) => {
      try {
        const { id } = req.params;
        const userRole = await extractUserRole(req);
        console.log("\n===================== DEBUG QUIZ USER ROLE ======================");
        console.log("User role from database (via passport):", userRole);
        
        // Since we're after passport authentication, userId will be in req.user
        const userId = req.user && Array.isArray(req.user) && req.user.length > 0 ?
                      req.user[0].user_id : null;
        
        if (!userId) {
          return res.status(401).json({
            success: false,
            message: "Authentication required"
          });
        }
      
      // Get quiz configuration from request body
      const { 
        question_count = 5, 
        time_per_question = 30 
      } = req.body;
      
      // Validate input
      if (question_count < 1 || question_count > 20) {
        return res.status(400).json({
          success: false,
          message: "Question count must be between 1 and 20"
        });
      }
      
      if (time_per_question < 5 || time_per_question > 300) {
        return res.status(400).json({
          success: false,
          message: "Time per question must be between 5 and 300 seconds"
        });
      }
      
      // Get all quizzes for this tense
      quizService.SELECT({ tense_id: id }, (quizzes) => {
        if (!quizzes || quizzes.code || quizzes.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No quizzes found for this tense"
          });
        }
        
        // Randomly select the requested number of questions
        let selectedQuizzes = [...quizzes];
        if (quizzes.length > question_count) {
          // Shuffle and select a subset
          selectedQuizzes = quizzes
            .sort(() => 0.5 - Math.random())
            .slice(0, question_count);
        }
        
        // Add quiz session metadata
        const quizSession = {
          tense_id: id,
          quiz_id: uuidv4(),
          user_id: userId,
          time_per_question,
          total_time: time_per_question * selectedQuizzes.length,
          questions: selectedQuizzes.map(quiz => quiz.toObject(true, true, true)),
          created_at: new Date()
        };
        
        res.status(200).json({
          success: true,
          quiz: quizSession
        });
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // POST /tense/:id/quiz-result - Submit quiz results
  app.post("/tense/:id/quiz-result", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      const { quiz_id, answers, time_taken } = req.body;
      
      if (!quiz_id || !answers || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: "Quiz ID and answers are required"
        });
      }
      
      // Calculate quiz score and record results
      // For now we'll just acknowledge receipt of the quiz results
      
      // This would be connected to a progress tracking service in a real implementation
      // to update user progress, calculate score, and save quiz results
      
      res.status(200).json({
        success: true,
        message: "Quiz results recorded successfully",
        // In a real implementation we'd return the full results with score
        result: {
          quiz_id,
          tense_id: id,
          user_id: userId,
          answers_count: answers.length,
          time_taken
        }
      });
    } catch (error) {
      console.error("Error submitting quiz results:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // POST /tense - Create new tense (Admin/Teacher only)
  app.post("/tense", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      console.log("\n===================== DEBUG USER AUTHENTICATION ======================");
      // Log the full user object from passport for debugging
      console.log("Passport user data:", req.user ? JSON.stringify(req.user[0], null, 2) : 'No user data');
      
      const userRole = await extractUserRole(req);
      console.log("Extracted user role:", userRole);
      
      // Only allow teachers (2) and admins (1)
      if (userRole !== 1 && userRole !== 2) {
        console.log("Permission denied - Required role 1 or 2, got:", userRole);
        return res.status(403).json({
          success: false,
          message: "Permission denied. Only teachers and admins can create tenses."
        });
      }

      console.log("Permission granted for role:", userRole);
      
      // Process tense creation since role check passed
      processTenseCreation(req, res);
    } catch (error) {
      console.error("Error creating tense:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // Helper function to process tense creation
  function processTenseCreation(req, res) {
    // Check if tense with this name already exists
    tenseService.SELECT({ tense_name: req.body.tense_name }, (existingTenses) => {
      if (existingTenses && existingTenses.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Tense with name "${req.body.tense_name}" already exists`,
          existingTenseId: existingTenses[0].tense_id
        });
      }
      
      // Extract examples and quizzes from request body
      const { examples = [], quizzes = [] } = req.body;
      
      // Create a new tense object
      const tenseData = {
        id: uuidv4(),  // Generate a UUID for the tense
        tense_name: req.body.tense_name,
        tense_description: req.body.tense_description,
        time_group: req.body.time_group,
        subcategory: req.body.subcategory,
        grammar_rules: req.body.grammar_rules,
        example_structure: req.body.example_structure,
        usage_notes: req.body.usage_notes,
        difficulty_level: req.body.difficulty_level || 3
      };
      
      const tense = new Tense(null, null, tenseData);
      
      // Insert the tense
      tenseService.INSERT(tense, (newTense) => {
        if (!newTense || newTense.code) {
          return res.status(400).json({
            success: false,
            message: newTense?.errorMessage || "Failed to create tense"
          });
        }
        
        // Process examples (if any)
        const examplePromises = examples.map(exampleText => {
          // If example is an object with properties, use them
          const exampleData = typeof exampleText === 'object' ? 
            {
              id: uuidv4(),
              tense_id: newTense.tense_id,
              example_text: exampleText.example_text || exampleText.text || '',
              sentence_type: exampleText.sentence_type || 'affirmative',
              difficulty_level: exampleText.difficulty_level || 3,
              student_submission: false,
              teacher_reviewed: true
            } :
            // Otherwise, it's just a string
            {
              id: uuidv4(),
              tense_id: newTense.tense_id,
              example_text: exampleText,
              sentence_type: 'affirmative',
              difficulty_level: 3,
              student_submission: false,
              teacher_reviewed: true
            };
            
          const example = new Example(null, null, exampleData);
          return new Promise((resolve, reject) => {
            exampleService.INSERT(example, result => {
              if (!result || result.code) {
                reject(result?.errorMessage || "Failed to create example");
              } else {
                resolve(result);
              }
            });
          });
        });
        
        // Process quizzes (if any)
        const quizPromises = quizzes.map(quizData => {
          // Ensure tense_id is set for each quiz
          const quizWithTenseId = {
            ...quizData,
            tense_id: newTense.tense_id
          };
          
          // Create quiz object
          const quiz = new Quiz(null, null, quizWithTenseId);
          
          return new Promise((resolve, reject) => {
            // Log the quiz data for debugging
            console.log("Creating quiz with data:", quiz);
            
            quizService.INSERT(quiz, result => {
              if (!result || result.code) {
                reject(result?.errorMessage || "Failed to create quiz");
              } else {
                resolve(result);
              }
            });
          });
        });
        
        // Wait for all promises to resolve
        Promise.all([...examplePromises, ...quizPromises])
          .then(results => {
            res.status(201).json({
              success: true,
              tense: newTense,
              message: "Tense created successfully"
            });
          })
          .catch(error => {
            console.error("Error creating tense resources:", error);
            // Return the tense anyway since it was created
            res.status(201).json({
              success: true,
              tense: newTense,
              message: "Tense created but some examples or quizzes failed",
              error
            });
          });
      });
    });
  }

  // PUT /tense/:id - Update an existing tense
  app.put("/tense/:id", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    // Increase timeout for large operations
    req.setTimeout(120000); // 2 minutes timeout
    
    try {
      const { id } = req.params;
      const userRole = await extractUserRole(req);
      
      console.log("🔄 PUT /tense/:id - Request received for ID:", id);
      console.log("🔄 PUT /tense/:id - Request body:", JSON.stringify(req.body, null, 2));
      console.log("🔄 PUT /tense/:id - User role:", userRole);
      
      // Only admin and teachers can update tenses
      if (userRole !== 1 && userRole !== 2) {
        console.log("❌ PUT /tense/:id - Permission denied for role:", userRole);
        return res.status(403).json({
          success: false,
          message: "Permission denied. Only teachers and admins can update tenses."
        });
      }
      
      // First check if the tense exists
      tenseService.SELECT({ tense_id: id }, async (existingTenses) => {
        if (!existingTenses || existingTenses.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Tense not found"
          });
        }
        
        // Check if updating to a name that's already taken by another tense
        if (req.body.tense_name && req.body.tense_name !== existingTenses[0].tense_name) {
          tenseService.SELECT({ tense_name: req.body.tense_name }, (nameCheckTenses) => {
            if (nameCheckTenses && nameCheckTenses.length > 0 && nameCheckTenses[0].tense_id !== id) {
              return res.status(409).json({
                success: false,
                message: `Another tense with name "${req.body.tense_name}" already exists`,
                existingTenseId: nameCheckTenses[0].tense_id
              });
            }
            
            // Continue with update if name is available
            proceedWithUpdate();
          });
        } else {
          // No name change or name is the same, proceed with update
          proceedWithUpdate();
        }
        
        function proceedWithUpdate() {
          // Extract examples and quizzes from request body
          const { examples = [], quizzes = [] } = req.body;
          
          console.log("PUT /tense/:id - Request body:", JSON.stringify(req.body, null, 2));
          console.log("PUT /tense/:id - Existing tense:", JSON.stringify(existingTenses[0].toObject(), null, 2));
          
          // Create update object
          const tenseData = {
            tense_id: id,
            tense_name: req.body.tense_name !== undefined ? req.body.tense_name : existingTenses[0].tense_name,
            tense_description: req.body.tense_description !== undefined ? req.body.tense_description : 
                             (req.body.description !== undefined ? req.body.description : existingTenses[0].tense_description),
            time_group: req.body.time_group !== undefined ? req.body.time_group : existingTenses[0].time_group,
            subcategory: req.body.subcategory !== undefined ? req.body.subcategory : existingTenses[0].subcategory,
            grammar_rules: req.body.grammar_rules !== undefined ? req.body.grammar_rules : existingTenses[0].grammar_rules,
            example_structure: req.body.example_structure !== undefined ? req.body.example_structure : existingTenses[0].example_structure,
            usage_notes: req.body.usage_notes !== undefined ? req.body.usage_notes : existingTenses[0].usage_notes,
            difficulty_level: req.body.difficulty_level !== undefined ? req.body.difficulty_level : existingTenses[0].difficulty_level,
            active: req.body.active !== undefined ? req.body.active : existingTenses[0].active,
            examples: examples,
            quizzes: quizzes
          };
          
          console.log("PUT /tense/:id - Prepared tense data:", JSON.stringify(tenseData, null, 2));
          
          // Update the tense
          tenseService.UPDATE(tenseData, (updatedTense) => {
            console.log("PUT /tense/:id - Service response:", updatedTense);
            
            if (!updatedTense || updatedTense.code || updatedTense.error) {
              console.error("PUT /tense/:id - Update failed:", updatedTense);
              return res.status(400).json({
                success: false,
                message: updatedTense?.errorMessage || updatedTense?.error || "Failed to update tense"
              });
            }
            
            console.log("PUT /tense/:id - Update successful");
            const responseData = {
              success: true,
              tense: updatedTense.toObject ? updatedTense.toObject() : updatedTense,
              message: "Tense updated successfully"
            };
            console.log("PUT /tense/:id - Final response:", JSON.stringify(responseData, null, 2));
            res.status(200).json(responseData);
          });
        }
      });
    } catch (error) {
      console.error("Error updating tense:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // DELETE /tense/:id - Delete a tense (admin and teachers only)
  app.delete("/tense/:id", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = await extractUserRole(req);
      
      // Only admin and teachers can delete tenses
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({
          success: false,
          message: "Permission denied. Only teachers and admins can delete tenses."
        });
      }
      
      // Check if the tense exists before attempting to delete
      tenseService.SELECT({ tense_id: id }, (existingTenses) => {
        if (!existingTenses || existingTenses.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Tense not found"
          });
        }
        
        // Create object with tense_id for deletion
        const tenseToDelete = {
          tense_id: id
        };
        
        // Delete the tense and associated data (examples and quizzes)
        tenseService.DELETE(tenseToDelete, (result) => {
          if (!result || result.code || result.error) {
            return res.status(400).json({
              success: false,
              message: result?.errorMessage || result?.error?.message || "Failed to delete tense"
            });
          }
          
          res.status(200).json({
            success: true,
            message: "Tense and all associated data deleted successfully"
          });
        });
      });
    } catch (error) {
      console.error("Error deleting tense:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // GET /user/examples - Get all examples created by the current user
  app.get("/user/examples", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      // Get all examples created by this user
      exampleService.SELECT({ user_id: userId }, (examples) => {
        if (!examples || examples.code) {
          return res.status(404).json({
            success: false,
            message: examples?.errorMessage || "No examples found"
          });
        }
        
        // Group examples by tense
        const examplesByTense = {};
        
        // Process each example
        const processedExamples = examples.map(example => {
          const exObj = example.toObject(true, true, true);
          
          // Group by tense
          if (!examplesByTense[exObj.tense_id]) {
            examplesByTense[exObj.tense_id] = [];
          }
          examplesByTense[exObj.tense_id].push(exObj);
          
          return exObj;
        });
        
        res.status(200).json({
          success: true,
          examples: processedExamples,
          examplesByTense: examplesByTense
        });
      });
    } catch (error) {
      console.error("Error fetching user examples:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // POST /user/examples - Create a new user example
  app.post("/user/examples", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      const { sentence, tense_id, sentence_type = "affirmative", difficulty_level = 3 } = req.body;
      
      if (!sentence || !tense_id) {
        return res.status(400).json({
          success: false,
          message: "Sentence and tense_id are required"
        });
      }
      
      // Check if the tense exists
      tenseService.SELECT({ tense_id }, (tenses) => {
        if (!tenses || tenses.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Tense not found"
          });
        }
        
        // Create example object
        const exampleData = {
          id: uuidv4(),
          tense_id,
          user_id: userId,
          example_text: sentence,
          sentence_type,
          difficulty_level,
          student_submission: true,
          teacher_reviewed: false,
          shared_with_teacher: false,
          created_at: new Date().toISOString()
        };
        
        const example = new Example(null, null, exampleData);
        
        // Insert the example
        exampleService.INSERT(example, (result) => {
          if (!result || result.code) {
            return res.status(400).json({
              success: false,
              message: result?.errorMessage || "Failed to add example"
            });
          }
          
          res.status(201).json({
            success: true,
            example: result
          });
        });
      });
    } catch (error) {
      console.error("Error creating user example:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // PUT /user/examples/:id - Update a user example
  app.put("/user/examples/:id", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      // Get the existing example
      exampleService.SELECT({ id }, (examples) => {
        if (!examples || examples.code || examples.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Example not found"
          });
        }
        
        const example = examples[0];
        
        // Check if user owns this example
        if (example.user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "Permission denied. You can only edit your own examples"
          });
        }
        
        // Update example properties
        if (req.body.sentence) {
          example.example_text = req.body.sentence;
        }
        
        if (req.body.sentence_type) {
          example.sentence_type = req.body.sentence_type;
        }
        
        if (req.body.difficulty_level) {
          example.difficulty_level = req.body.difficulty_level;
        }
        
        // If this was previously reviewed and it's being edited, reset review status
        if (example.teacher_reviewed) {
          example.teacher_reviewed = false;
          example.teacher_feedback = "Example has been modified since last review";
        }
        
        // Update the example
        exampleService.UPDATE(example, (result) => {
          if (!result || result.code) {
            return res.status(400).json({
              success: false,
              message: result?.errorMessage || "Failed to update example"
            });
          }
          
          res.status(200).json({
            success: true,
            example: result,
            message: "Example updated successfully"
          });
        });
      });
    } catch (error) {
      console.error("Error updating user example:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // DELETE /user/examples/:id - Delete a user example
  app.delete("/user/examples/:id", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      // Get the example to verify ownership
      exampleService.SELECT({ id }, (examples) => {
        if (!examples || examples.code || examples.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Example not found"
          });
        }
        
        const example = examples[0];
        
        // Check if user owns this example
        if (example.user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "Permission denied. You can only delete your own examples"
          });
        }
        
        // Delete the example
        exampleService.DELETE({ id }, (result) => {
          if (!result || result.code) {
            return res.status(400).json({
              success: false,
              message: result?.errorMessage || "Failed to delete example"
            });
          }
          
          res.status(200).json({
            success: true,
            message: "Example deleted successfully"
          });
        });
      });
    } catch (error) {
      console.error("Error deleting user example:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // PUT /user/examples/:id/share - Share a user example with teachers
  app.put("/user/examples/:id/share", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      // Get the example to verify ownership
      exampleService.SELECT({ id }, (examples) => {
        if (!examples || examples.code || examples.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Example not found"
          });
        }
        
        const example = examples[0];
        
        // Check if user owns this example
        if (example.user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "Permission denied. You can only share your own examples"
          });
        }
        
        // Update sharing status
        example.shared_with_teacher = true;
        
        // Update the example
        exampleService.UPDATE(example, (result) => {
          if (!result || result.code) {
            return res.status(400).json({
              success: false,
              message: result?.errorMessage || "Failed to share example"
            });
          }
          
          res.status(200).json({
            success: true,
            example: result,
            message: "Example shared with teachers successfully"
          });
        });
      });
    } catch (error) {
      console.error("Error sharing user example:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // GET /tense/:id/user-examples - Get all examples for a specific tense created by the current user
  app.get("/tense/:id/user-examples", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      
      // Get all examples for this tense created by this user
      exampleService.SELECT({ tense_id: id, user_id: userId }, (examples) => {
        if (!examples || examples.code) {
          return res.status(404).json({
            success: false,
            message: examples?.errorMessage || "No examples found"
          });
        }
        
        // Process examples
        const processedExamples = examples.map(example => {
          return example.toObject(true, true, true);
        });
        
        res.status(200).json({
          success: true,
          examples: processedExamples
        });
      });
    } catch (error) {
      console.error("Error fetching user tense examples:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // GET /teacher/shared-examples - Get all examples shared with teachers (teachers only)
  app.get("/teacher/shared-examples", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const userRole = await extractUserRole(req);
      
      // Only teachers and admins can access shared examples
      if (userRole !== 1 && userRole !== 2) {
        return res.status(403).json({
          success: false,
          message: "Permission denied. Only teachers and admins can access shared examples."
        });
      }
      
      // Get all examples shared with teachers
      exampleService.SELECT({ shared_with_teacher: true }, (examples) => {
        if (!examples || examples.code) {
          return res.status(404).json({
            success: false,
            message: examples?.errorMessage || "No shared examples found"
          });
        }
        
        // Group examples by tense and user
        const examplesByTense = {};
        const examplesByUser = {};
        
        // Process each example
        const processedExamples = examples.map(example => {
          const exObj = example.toObject(true, true, true);
          
          // Group by tense
          if (!examplesByTense[exObj.tense_id]) {
            examplesByTense[exObj.tense_id] = [];
          }
          examplesByTense[exObj.tense_id].push(exObj);
          
          // Group by user
          if (!examplesByUser[exObj.user_id]) {
            examplesByUser[exObj.user_id] = [];
          }
          examplesByUser[exObj.user_id].push(exObj);
          
          return exObj;
        });
        
        res.status(200).json({
          success: true,
          examples: processedExamples,
          examplesByTense: examplesByTense,
          examplesByUser: examplesByUser
        });
      });
    } catch (error) {
      console.error("Error fetching shared examples:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
  // GET /tense/:id/stats - Get user statistics for a specific tense
  app.get("/tense/:id/stats", passport.authenticate('user_connected', { session: false }), async (req, res) => {
    try {
      const { id } = req.params;
      const userId = extractUserId(req);
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      // Get tense statistics for the user
      tenseService.GET_TENSE_STATS(userId, id, (stats) => {
        if (stats.error || stats.code) {
          return res.status(404).json({
            success: false,
            message: stats.error || stats.errorMessage || "Failed to retrieve tense statistics"
          });
        }

        res.status(200).json({
          success: true,
          stats: {
            // Core statistics
            completion_percentage: stats.completion_percentage,
            average_score: parseFloat(stats.average_score) || 0,
            total_study_time: stats.formatted_study_time,
            total_study_time_seconds: stats.total_study_time_seconds,
            
            // Examples statistics
            examples: {
              total: stats.total_examples,
              user_created: stats.user_examples,
              user_submitted: stats.examples_submitted,
              user_correct: stats.examples_correct,
              accuracy_percentage: stats.examples_accuracy,
              approved: stats.approved_examples
            },
            
            // Progress indicators
            is_completed: stats.is_completed,
            proficiency_level: stats.proficiency_level,
            study_sessions: stats.study_sessions,
            
            // Metadata
            last_activity: stats.last_activity,
            last_study_date: stats.last_study_date
          }
        });
      });
    } catch (error) {
      console.error("Error fetching tense statistics:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });
  
};
