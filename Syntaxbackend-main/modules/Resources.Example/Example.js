class Example {

    #example_id;
    #example_text;
    #tense_id;
    #difficulty_level;
    #student_submission;
    #teacher_reviewed;
    #reviewer_id;
    #review_date;
    #submitter_id;
    #submitted_date;
    #user_id;
    #shared_with_teacher;
    #sentence_type;
    #teacher_feedback;
    #created_at;

    constructor(upload, bddrow, bodyjson) {
        // Initialize with default values
        this.#example_id = null;
        this.#example_text = null;
        this.#tense_id = null;
        this.#difficulty_level = 2; // Default to medium difficulty
        this.#student_submission = false;
        this.#teacher_reviewed = false;
        this.#reviewer_id = null;
        this.#review_date = null;
        this.#submitter_id = null;
        this.#submitted_date = null;
        this.#user_id = null;
        this.#shared_with_teacher = false;
        this.#sentence_type = 'affirmative';
        this.#teacher_feedback = null;
        this.#created_at = new Date().toISOString();
        
        if (upload) {
            this.#example_id = upload.example_id || upload.id;
            this.#example_text = upload.example_text || upload.sentence;
            this.#tense_id = upload.tense_id;
            this.#difficulty_level = upload.difficulty_level !== undefined ? upload.difficulty_level : 2;
            this.#student_submission = upload.student_submission !== undefined ? upload.student_submission : false;
            this.#teacher_reviewed = upload.teacher_reviewed !== undefined ? upload.teacher_reviewed : false;
            this.#reviewer_id = upload.reviewer_id || null;
            this.#review_date = upload.review_date || null;
            this.#submitter_id = upload.submitter_id || null;
            this.#submitted_date = upload.submitted_date || null;
            this.#user_id = upload.user_id || upload.submitter_id || null;
            this.#shared_with_teacher = upload.shared_with_teacher !== undefined ? upload.shared_with_teacher : false;
            this.#sentence_type = upload.sentence_type || 'affirmative';
            this.#teacher_feedback = upload.teacher_feedback || null;
            this.#created_at = upload.created_at || new Date().toISOString();
        } else if (bddrow) {
            this.#example_id = bddrow.example_id || bddrow.id;
            this.#example_text = bddrow.example_text || bddrow.sentence;
            this.#tense_id = bddrow.tense_id;
            this.#difficulty_level = bddrow.difficulty_level !== undefined ? bddrow.difficulty_level : 2;
            this.#student_submission = bddrow.student_submission !== undefined ? bddrow.student_submission : false;
            this.#teacher_reviewed = bddrow.teacher_reviewed !== undefined ? bddrow.teacher_reviewed : false;
            this.#reviewer_id = bddrow.reviewer_id || null;
            this.#review_date = bddrow.review_date || null;
            this.#submitter_id = bddrow.submitter_id || null;
            this.#submitted_date = bddrow.submitted_date || null;
            this.#user_id = bddrow.user_id || bddrow.submitter_id || null;
            this.#shared_with_teacher = bddrow.shared_with_teacher !== undefined ? bddrow.shared_with_teacher : false;
            this.#sentence_type = bddrow.sentence_type || 'affirmative';
            this.#teacher_feedback = bddrow.teacher_feedback || null;
            this.#created_at = bddrow.created_at || new Date().toISOString();
        } else if (bodyjson) {
            this.#example_id = bodyjson.example_id || bodyjson.id;
            this.#example_text = bodyjson.example_text || bodyjson.sentence;
            this.#tense_id = bodyjson.tense_id;
            this.#difficulty_level = bodyjson.difficulty_level !== undefined ? bodyjson.difficulty_level : 2;
            this.#student_submission = bodyjson.student_submission !== undefined ? bodyjson.student_submission : false;
            this.#teacher_reviewed = bodyjson.teacher_reviewed !== undefined ? bodyjson.teacher_reviewed : false;
            this.#reviewer_id = bodyjson.reviewer_id || null;
            this.#review_date = bodyjson.review_date || null;
            this.#submitter_id = bodyjson.submitter_id || null;
            this.#submitted_date = bodyjson.submitted_date || null;
            this.#user_id = bodyjson.user_id || bodyjson.submitter_id || null;
            this.#shared_with_teacher = bodyjson.shared_with_teacher !== undefined ? bodyjson.shared_with_teacher : false;
            this.#sentence_type = bodyjson.sentence_type || 'affirmative';
            this.#teacher_feedback = bodyjson.teacher_feedback || null;
            this.#created_at = bodyjson.created_at || new Date().toISOString();
        }
    }

    toObject(includeUserData = false, includeReviewData = false, includeExtended = false) {
        const baseObject = {
            example_id: this.#example_id,
            example_text: this.#example_text,
            tense_id: this.#tense_id,
            difficulty_level: this.#difficulty_level,
            sentence_type: this.#sentence_type
        };
        
        if (includeUserData) {
            baseObject.user_id = this.#user_id || this.#submitter_id;
            baseObject.student_submission = this.#student_submission;
        }
        
        if (includeReviewData) {
            baseObject.teacher_reviewed = this.#teacher_reviewed;
            baseObject.reviewer_id = this.#reviewer_id;
            baseObject.review_date = this.#review_date;
            baseObject.teacher_feedback = this.#teacher_feedback;
        }
        
        if (includeExtended) {
            baseObject.shared_with_teacher = this.#shared_with_teacher;
            baseObject.created_at = this.#created_at;
        }
        
        return baseObject;
    }

    get example_id() { return this.#example_id; }
    get example_text() { return this.#example_text; }
    get tense_id() { return this.#tense_id; }
    get difficulty_level() { return this.#difficulty_level; }
    get student_submission() { return this.#student_submission; }
    get teacher_reviewed() { return this.#teacher_reviewed; }
    get reviewer_id() { return this.#reviewer_id; }
    get review_date() { return this.#review_date; }
    get submitter_id() { return this.#submitter_id; }
    get submitted_date() { return this.#submitted_date; }
    get user_id() { return this.#user_id || this.#submitter_id; }
    get shared_with_teacher() { return this.#shared_with_teacher; }
    get sentence_type() { return this.#sentence_type; }
    get teacher_feedback() { return this.#teacher_feedback; }
    get created_at() { return this.#created_at; }

    set example_id(id) { this.#example_id = id; }
    set example_text(text) { this.#example_text = text; }
    set tense_id(id) { this.#tense_id = id; }
    set difficulty_level(level) { this.#difficulty_level = level; }
    set student_submission(isStudentSubmission) { this.#student_submission = isStudentSubmission; }
    set teacher_reviewed(isReviewed) { this.#teacher_reviewed = isReviewed; }
    set reviewer_id(id) { this.#reviewer_id = id; }
    set review_date(date) { this.#review_date = date; }
    set submitter_id(id) { this.#submitter_id = id; }
    set submitted_date(date) { this.#submitted_date = date; }
    set user_id(id) { this.#user_id = id; }
    set shared_with_teacher(isShared) { this.#shared_with_teacher = isShared; }
    set sentence_type(type) { this.#sentence_type = type; }
    set teacher_feedback(feedback) { this.#teacher_feedback = feedback; }
    set created_at(date) { this.#created_at = date; }
}

module.exports = Example;
