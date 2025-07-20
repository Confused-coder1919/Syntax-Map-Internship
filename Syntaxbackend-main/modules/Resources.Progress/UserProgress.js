class UserProgress {
  #id;
  #user_id;
  #tense_id;
  #completion_percentage;
  #quiz_avg_score;
  #examples_submitted;
  #examples_correct;
  #last_activity;
  #is_completed;
  #difficulty_level;
  #created_at;
  #updated_at;

  constructor(userProgress, dbRow, bodyJson) {
    if (userProgress) {
      this.#id = userProgress.id;
      this.#user_id = userProgress.user_id;
      this.#tense_id = userProgress.tense_id;
      this.#completion_percentage = userProgress.completion_percentage;
      this.#quiz_avg_score = userProgress.quiz_avg_score;
      this.#examples_submitted = userProgress.examples_submitted;
      this.#examples_correct = userProgress.examples_correct;
      this.#last_activity = userProgress.last_activity;
      this.#is_completed = userProgress.is_completed;
      this.#difficulty_level = userProgress.difficulty_level;
      this.#created_at = userProgress.created_at;
      this.#updated_at = userProgress.updated_at;
    } else if (dbRow) {
      this.#id = dbRow.id;
      this.#user_id = dbRow.user_id;
      this.#tense_id = dbRow.tense_id;
      this.#completion_percentage = dbRow.completion_percentage;
      this.#quiz_avg_score = dbRow.quiz_avg_score;
      this.#examples_submitted = dbRow.examples_submitted;
      this.#examples_correct = dbRow.examples_correct;
      this.#last_activity = dbRow.last_activity;
      this.#is_completed = dbRow.is_completed;
      this.#difficulty_level = dbRow.difficulty_level;
      this.#created_at = dbRow.created_at;
      this.#updated_at = dbRow.updated_at;
    } else if (bodyJson) {
      this.#id = bodyJson.id;
      this.#user_id = bodyJson.user_id;
      this.#tense_id = bodyJson.tense_id;
      this.#completion_percentage = bodyJson.completion_percentage || 0;
      this.#quiz_avg_score = bodyJson.quiz_avg_score || 0;
      this.#examples_submitted = bodyJson.examples_submitted || 0;
      this.#examples_correct = bodyJson.examples_correct || 0;
      this.#last_activity = bodyJson.last_activity || new Date();
      this.#is_completed = bodyJson.is_completed || false;
      this.#difficulty_level = bodyJson.difficulty_level || 1;
      this.#created_at = bodyJson.created_at;
      this.#updated_at = bodyJson.updated_at;
    } else {
      this.#id = null;
      this.#user_id = null;
      this.#tense_id = null;
      this.#completion_percentage = 0;
      this.#quiz_avg_score = 0;
      this.#examples_submitted = 0;
      this.#examples_correct = 0;
      this.#last_activity = new Date();
      this.#is_completed = false;
      this.#difficulty_level = 1;
      this.#created_at = new Date();
      this.#updated_at = new Date();
    }
  }

  toObject() {
    return {
      id: this.#id,
      user_id: this.#user_id,
      tense_id: this.#tense_id,
      completion_percentage: this.#completion_percentage,
      quiz_avg_score: this.#quiz_avg_score,
      examples_submitted: this.#examples_submitted,
      examples_correct: this.#examples_correct,
      last_activity: this.#last_activity,
      is_completed: this.#is_completed,
      difficulty_level: this.#difficulty_level,
      created_at: this.#created_at,
      updated_at: this.#updated_at
    };
  }

  // Getters
  get id() { return this.#id; }
  get user_id() { return this.#user_id; }
  get tense_id() { return this.#tense_id; }
  get completion_percentage() { return this.#completion_percentage; }
  get quiz_avg_score() { return this.#quiz_avg_score; }
  get examples_submitted() { return this.#examples_submitted; }
  get examples_correct() { return this.#examples_correct; }
  get last_activity() { return this.#last_activity; }
  get is_completed() { return this.#is_completed; }
  get difficulty_level() { return this.#difficulty_level; }
  get created_at() { return this.#created_at; }
  get updated_at() { return this.#updated_at; }

  // Setters
  set id(id) { this.#id = id; }
  set user_id(user_id) { this.#user_id = user_id; }
  set tense_id(tense_id) { this.#tense_id = tense_id; }
  set completion_percentage(completion_percentage) { this.#completion_percentage = completion_percentage; }
  set quiz_avg_score(quiz_avg_score) { this.#quiz_avg_score = quiz_avg_score; }
  set examples_submitted(examples_submitted) { this.#examples_submitted = examples_submitted; }
  set examples_correct(examples_correct) { this.#examples_correct = examples_correct; }
  set last_activity(last_activity) { this.#last_activity = last_activity; }
  set is_completed(is_completed) { this.#is_completed = is_completed; }
  set difficulty_level(difficulty_level) { this.#difficulty_level = difficulty_level; }
  set created_at(created_at) { this.#created_at = created_at; }
  set updated_at(updated_at) { this.#updated_at = updated_at; }
}

module.exports = UserProgress;