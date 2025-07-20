-- Add 'guest' role number (4) in the system
-- Roles: 1=Admin, 2=Teacher, 3=Student, 4=Guest


CREATE TABLE user_table (
    user_id VARCHAR(40) NOT NULL UNIQUE,
    user_name VARCHAR(255) NOT NULL,
    user_email_address VARCHAR(255) UNIQUE NOT NULL,
    user_email_verified BOOLEAN DEFAULT false,
    user_password TEXT,
    user_gender VARCHAR(50),
    user_role INT NOT NULL,
    last_session TIMESTAMP,
    otp_code VARCHAR(6),
    otp_expiry TIMESTAMP,
    is_account_active BOOLEAN DEFAULT false
);


-- Table for tenses
CREATE TABLE tense_table (
    id  VARCHAR(255) NOT NULL UNIQUE, -- Unique ID for each tense
    tense_name VARCHAR(255) unique NOT NULL, -- Name of the tense
    tense_description TEXT NOT NULL, -- Markdown text for the description
    time_group VARCHAR(50), -- Group category (Present, Past, Future, etc.)
    subcategory VARCHAR(100), -- Subcategory within time group
    grammar_rules TEXT, -- Detailed grammar rules
    example_structure TEXT, -- Structure examples
    usage_notes TEXT, -- Usage notes
    difficulty_level INTEGER DEFAULT 3, -- Difficulty level (1-5)
    active BOOLEAN DEFAULT TRUE, -- Whether the tense is active/visible
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE example_table (
    id  VARCHAR(40) NOT NULL UNIQUE, -- Unique ID for each example
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    example_text TEXT NOT NULL, -- Example sentence
    difficulty_level INTEGER DEFAULT 3, -- Difficulty level (1-5)
    student_submission BOOLEAN DEFAULT FALSE, -- Whether this is a student-submitted example
    teacher_reviewed BOOLEAN DEFAULT FALSE, -- Whether a teacher has reviewed this example
    reviewer_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE SET NULL, -- Teacher who reviewed
    review_date TIMESTAMP, -- When the review was done
    submitter_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE SET NULL, -- Student who submitted
    submitted_date TIMESTAMP DEFAULT NOW(), -- When the example was submitted
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE, -- User who owns the example
    shared_with_teacher BOOLEAN DEFAULT FALSE, -- Whether shared with teacher for feedback
    sentence_type VARCHAR(50) DEFAULT 'affirmative', -- Type of sentence (affirmative, negative, interrogative)
    teacher_feedback TEXT, -- Feedback from teacher
    created_at TIMESTAMP DEFAULT NOW(), -- Example creation timestamp
    updated_at TIMESTAMP DEFAULT NOW() -- Last update timestamp
);

-- Add indexes for example_table
CREATE INDEX IF NOT EXISTS idx_example_user_id ON example_table(user_id);
CREATE INDEX IF NOT EXISTS idx_example_tense_id ON example_table(tense_id);
CREATE INDEX IF NOT EXISTS idx_example_shared ON example_table(shared_with_teacher);
CREATE INDEX IF NOT EXISTS idx_example_sentence_type ON example_table(sentence_type);

-- Table for quizzes
CREATE TABLE quiz_table (
    id  VARCHAR(40) NOT NULL UNIQUE, -- Unique ID for each quiz
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    question TEXT NOT NULL, -- Quiz question
    options JSONB NOT NULL, -- JSON array of options
    correct_answer TEXT NOT NULL, -- Correct answer
    question_type VARCHAR(20) DEFAULT 'mcq', -- Type of question: 'mcq', 'fill-blank', 'drag-drop', etc.
    difficulty_level INTEGER DEFAULT 3, -- Difficulty level (1-5)
    time_per_question INTEGER DEFAULT 30, -- Default time per question in seconds
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for quiz details
CREATE TABLE quiz_details (
    id  VARCHAR(40) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE, -- Added reference to tense_table
    difficulty_level INTEGER NOT NULL,
    time_per_question INTEGER NOT NULL,
    number_of_questions INTEGER NOT NULL,
    status VARCHAR(10) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for user inputs
CREATE TABLE user_inputs_table (
    id  VARCHAR(40) NOT NULL UNIQUE, -- Unique ID for each user input
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    user_id VARCHAR(40)  REFERENCES user_table(user_id) ON DELETE CASCADE,
    user_example TEXT NOT NULL, -- User's self-generated example
    evaluation TEXT, -- Feedback or score
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE user_role_table (
    id  VARCHAR(40) NOT NULL UNIQUE, -- Unique ID for each user input
    user_id VARCHAR(40)  REFERENCES user_table(user_id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- Role of the user (e.g., admin, user, editor)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for questions
CREATE TABLE question_table (
    question_id SERIAL PRIMARY KEY,
    quiz_details_id VARCHAR(40) REFERENCES quiz_details(id) ON DELETE CASCADE NOT NULL,
    question_title TEXT NOT NULL,
    answer_title_a TEXT NOT NULL,
    answer_title_b TEXT NOT NULL,
    answer_title_c TEXT NOT NULL,
    answer_title_d TEXT NOT NULL,
    right_answer VARCHAR(1) NOT NULL,
    explanation TEXT, -- Explanation for the correct answer
    online_exam_ids INTEGER[],
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for question_table to improve query performance
CREATE INDEX IF NOT EXISTS idx_question_verified ON question_table(verified);
CREATE INDEX IF NOT EXISTS idx_question_exam_ids ON question_table USING gin(online_exam_ids); -- GIN index for array column

-- Table for storing batch results
CREATE TABLE resultat_batch (
    result_id SERIAL PRIMARY KEY,
    total_question INTEGER NOT NULL,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    tense_id VARCHAR(255) REFERENCES tense_table(id) ON DELETE SET NULL,
    session_name VARCHAR(255),
    nb_good INTEGER DEFAULT 0,
    time_remaining INTEGER,
    time_per_question INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for user dictionary words
CREATE TABLE user_dictionnary (
    word_id SERIAL PRIMARY KEY,
    word TEXT NOT NULL,
    definition TEXT,
    part_of_speech VARCHAR(50),
    pronunciation TEXT,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    learned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for tracking user mistakes
CREATE TABLE user_mistake (
    mistake_id SERIAL PRIMARY KEY,
    questions_wrong_id INTEGER NOT NULL,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for user notepad entries
CREATE TABLE user_notepad (
    note_id SERIAL PRIMARY KEY,
    note TEXT NOT NULL,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create enhanced notepad table
CREATE TABLE IF NOT EXISTS notepad_table (
  id VARCHAR(40) PRIMARY KEY,
  user_id VARCHAR(40) NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(20),
  is_reviewed BOOLEAN DEFAULT FALSE,
  is_learned BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',
  pronunciation TEXT,
  meaning TEXT,
  category VARCHAR(50),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
      REFERENCES user_table(user_id)
      ON DELETE CASCADE
);

-- Create appropriate indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_notepad_user_id ON notepad_table(user_id);
CREATE INDEX IF NOT EXISTS idx_notepad_content_type ON notepad_table(content_type);
CREATE INDEX IF NOT EXISTS idx_notepad_reference_id ON notepad_table(reference_id);
CREATE INDEX IF NOT EXISTS idx_notepad_category ON notepad_table(category);
CREATE INDEX IF NOT EXISTS idx_notepad_is_reviewed ON notepad_table(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_notepad_is_learned ON notepad_table(is_learned);

-- Progress Tracking Tables

-- Table for tracking user progress through tenses
CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    completion_percentage INTEGER DEFAULT 0,
    quiz_avg_score REAL DEFAULT 0.0,
    examples_submitted INTEGER DEFAULT 0,
    examples_correct INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT FALSE,
    difficulty_level INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for tracking user sessions and learning streaks
CREATE TABLE IF NOT EXISTS user_learning_activity (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    tenses_practiced JSONB DEFAULT '[]', -- array of tense IDs
    activities_completed JSONB DEFAULT '[]', -- array of activity types with counts
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, session_date)
);

-- Table for teacher assessment of student progress
CREATE TABLE IF NOT EXISTS teacher_assessment (
    id VARCHAR(40) PRIMARY KEY,
    teacher_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    student_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    assessment_text TEXT,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for tracking overall proficiency badges/achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- e.g., 'streak', 'tense_mastery', 'quiz_perfect', etc.
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    achieved_at TIMESTAMP DEFAULT NOW(),
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    meta_data JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_tense_id ON user_progress(tense_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_user_id ON user_learning_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_date ON user_learning_activity(session_date);
CREATE INDEX IF NOT EXISTS idx_teacher_assessment_student ON teacher_assessment(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assessment_teacher ON teacher_assessment(teacher_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

-- Table for tracking quiz attempts and results
CREATE TABLE IF NOT EXISTS quiz_result_table (
    id VARCHAR(40) PRIMARY KEY,
    quiz_session_id VARCHAR(40) NOT NULL,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    score_percentage REAL NOT NULL DEFAULT 0,
    questions_total INTEGER NOT NULL DEFAULT 0,
    questions_correct INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    answers JSONB DEFAULT '[]', -- Array of question IDs with user answers and correctness
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_result_user_id ON quiz_result_table(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_result_tense_id ON quiz_result_table(tense_id);

-- Table for detailed quiz performance tracking
CREATE TABLE IF NOT EXISTS quiz_performance (
    id VARCHAR(40) PRIMARY KEY,
    quiz_details_id VARCHAR(40) REFERENCES quiz_details(id) ON DELETE CASCADE,
    tense_id VARCHAR(40) REFERENCES tense_table(id) ON DELETE CASCADE,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    incorrect_answers INTEGER NOT NULL,
    total_time_taken INTEGER NOT NULL, 
    avg_time_per_question REAL NOT NULL,
    incorrect_question_data JSONB DEFAULT '[]', 
    missed_questions JSONB DEFAULT '[]', 
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_performance_user_id ON quiz_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_performance_quiz_id ON quiz_performance(quiz_details_id);
CREATE INDEX IF NOT EXISTS idx_quiz_performance_tense_id ON quiz_performance(tense_id);

-- Role upgrade requests table (Fixed to match backend code naming)
CREATE TABLE IF NOT EXISTS role_request_table (
    request_id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) NOT NULL REFERENCES user_table(user_id),
    "current_role" INTEGER NOT NULL,
    requested_role INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    admin_id VARCHAR(40) REFERENCES user_table(user_id),
    admin_note TEXT
);

-- Create notification table for system notifications
CREATE TABLE IF NOT EXISTS notification_table (
    notification_id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) NOT NULL REFERENCES user_table(user_id),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Table for user uploads
CREATE TABLE IF NOT EXISTS user_upload (
    id_upload SERIAL PRIMARY KEY,
    sentence TEXT NOT NULL,
    image_path TEXT,
    user_id VARCHAR(40) REFERENCES user_table(user_id) ON DELETE CASCADE,
    tense_id VARCHAR(255) REFERENCES tense_table(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table for learning goals
CREATE TABLE IF NOT EXISTS learning_goal (
    id VARCHAR(40) PRIMARY KEY,
    user_id VARCHAR(40) NOT NULL REFERENCES user_table(user_id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    target INTEGER DEFAULT 100,
    deadline TIMESTAMP,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for learning_goal table
CREATE INDEX IF NOT EXISTS idx_goal_user_id ON learning_goal(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_type ON learning_goal(type);
CREATE INDEX IF NOT EXISTS idx_goal_completed ON learning_goal(completed);