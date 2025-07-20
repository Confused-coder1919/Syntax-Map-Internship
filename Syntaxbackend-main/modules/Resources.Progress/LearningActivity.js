class LearningActivity {
  #id;
  #user_id;
  #session_date;
  #total_time_spent;
  #tenses_practiced;
  #activities_completed;
  #streak_days;
  #created_at;
  #updated_at;

  constructor(learningActivity, dbRow, bodyJson) {
    if (learningActivity) {
      this.#id = learningActivity.id;
      this.#user_id = learningActivity.user_id;
      this.#session_date = learningActivity.session_date;
      this.#total_time_spent = learningActivity.total_time_spent;
      this.#tenses_practiced = learningActivity.tenses_practiced;
      this.#activities_completed = learningActivity.activities_completed;
      this.#streak_days = learningActivity.streak_days;
      this.#created_at = learningActivity.created_at;
      this.#updated_at = learningActivity.updated_at;
    } else if (dbRow) {
      this.#id = dbRow.id;
      this.#user_id = dbRow.user_id;
      this.#session_date = dbRow.session_date;
      this.#total_time_spent = dbRow.total_time_spent;
      this.#tenses_practiced = dbRow.tenses_practiced;
      this.#activities_completed = dbRow.activities_completed;
      this.#streak_days = dbRow.streak_days;
      this.#created_at = dbRow.created_at;
      this.#updated_at = dbRow.updated_at;
    } else if (bodyJson) {
      this.#id = bodyJson.id;
      this.#user_id = bodyJson.user_id;
      this.#session_date = bodyJson.session_date || new Date().toISOString().split('T')[0];
      this.#total_time_spent = bodyJson.total_time_spent || 0;
      this.#tenses_practiced = bodyJson.tenses_practiced || [];
      this.#activities_completed = bodyJson.activities_completed || [];
      this.#streak_days = bodyJson.streak_days || 0;
      this.#created_at = bodyJson.created_at;
      this.#updated_at = bodyJson.updated_at;
    } else {
      this.#id = null;
      this.#user_id = null;
      this.#session_date = new Date().toISOString().split('T')[0];
      this.#total_time_spent = 0;
      this.#tenses_practiced = [];
      this.#activities_completed = [];
      this.#streak_days = 0;
      this.#created_at = new Date();
      this.#updated_at = new Date();
    }
  }

  toObject() {
    return {
      id: this.#id,
      user_id: this.#user_id,
      session_date: this.#session_date,
      total_time_spent: this.#total_time_spent,
      tenses_practiced: this.#tenses_practiced,
      activities_completed: this.#activities_completed,
      streak_days: this.#streak_days,
      created_at: this.#created_at,
      updated_at: this.#updated_at
    };
  }

  // Getters
  get id() { return this.#id; }
  get user_id() { return this.#user_id; }
  get session_date() { return this.#session_date; }
  get total_time_spent() { return this.#total_time_spent; }
  get tenses_practiced() { return this.#tenses_practiced; }
  get activities_completed() { return this.#activities_completed; }
  get streak_days() { return this.#streak_days; }
  get created_at() { return this.#created_at; }
  get updated_at() { return this.#updated_at; }

  // Setters
  set id(id) { this.#id = id; }
  set user_id(user_id) { this.#user_id = user_id; }
  set session_date(session_date) { this.#session_date = session_date; }
  set total_time_spent(total_time_spent) { this.#total_time_spent = total_time_spent; }
  set tenses_practiced(tenses_practiced) { this.#tenses_practiced = tenses_practiced; }
  set activities_completed(activities_completed) { this.#activities_completed = activities_completed; }
  set streak_days(streak_days) { this.#streak_days = streak_days; }
  set created_at(created_at) { this.#created_at = created_at; }
  set updated_at(updated_at) { this.#updated_at = updated_at; }

  // Helper method to add time spent
  addTimeSpent(seconds) {
    this.#total_time_spent += seconds;
    this.#updated_at = new Date();
  }

  // Helper method to add a tense practiced
  addTensePracticed(tenseId) {
    if (!this.#tenses_practiced.includes(tenseId)) {
      this.#tenses_practiced.push(tenseId);
      this.#updated_at = new Date();
    }
  }

  // Helper method to add completed activity
  addActivity(activityType, count = 1) {
    const existingActivity = this.#activities_completed.find(a => a.type === activityType);
    if (existingActivity) {
      existingActivity.count += count;
    } else {
      this.#activities_completed.push({ type: activityType, count });
    }
    this.#updated_at = new Date();
  }
}

module.exports = LearningActivity;