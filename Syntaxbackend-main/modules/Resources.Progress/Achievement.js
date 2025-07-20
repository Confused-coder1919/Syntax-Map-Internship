class Achievement {
  #id;
  #user_id;
  #achievement_type;
  #achievement_name;
  #achievement_description;
  #achieved_at;
  #tense_id;
  #meta_data;

  constructor(achievement, dbRow, bodyJson) {
    if (achievement) {
      this.#id = achievement.id;
      this.#user_id = achievement.user_id;
      this.#achievement_type = achievement.achievement_type;
      this.#achievement_name = achievement.achievement_name;
      this.#achievement_description = achievement.achievement_description;
      this.#achieved_at = achievement.achieved_at;
      this.#tense_id = achievement.tense_id;
      this.#meta_data = achievement.meta_data;
    } else if (dbRow) {
      this.#id = dbRow.id;
      this.#user_id = dbRow.user_id;
      this.#achievement_type = dbRow.achievement_type;
      this.#achievement_name = dbRow.achievement_name;
      this.#achievement_description = dbRow.achievement_description;
      this.#achieved_at = dbRow.achieved_at;
      this.#tense_id = dbRow.tense_id;
      this.#meta_data = dbRow.meta_data;
    } else if (bodyJson) {
      this.#id = bodyJson.id;
      this.#user_id = bodyJson.user_id;
      this.#achievement_type = bodyJson.achievement_type;
      this.#achievement_name = bodyJson.achievement_name;
      this.#achievement_description = bodyJson.achievement_description;
      this.#achieved_at = bodyJson.achieved_at || new Date();
      this.#tense_id = bodyJson.tense_id;
      this.#meta_data = bodyJson.meta_data || {};
    } else {
      this.#id = null;
      this.#user_id = null;
      this.#achievement_type = null;
      this.#achievement_name = null;
      this.#achievement_description = null;
      this.#achieved_at = new Date();
      this.#tense_id = null;
      this.#meta_data = {};
    }
  }

  toObject() {
    return {
      id: this.#id,
      user_id: this.#user_id,
      achievement_type: this.#achievement_type,
      achievement_name: this.#achievement_name,
      achievement_description: this.#achievement_description,
      achieved_at: this.#achieved_at,
      tense_id: this.#tense_id,
      meta_data: this.#meta_data
    };
  }

  // Getters
  get id() { return this.#id; }
  get user_id() { return this.#user_id; }
  get achievement_type() { return this.#achievement_type; }
  get achievement_name() { return this.#achievement_name; }
  get achievement_description() { return this.#achievement_description; }
  get achieved_at() { return this.#achieved_at; }
  get tense_id() { return this.#tense_id; }
  get meta_data() { return this.#meta_data; }

  // Setters
  set id(id) { this.#id = id; }
  set user_id(user_id) { this.#user_id = user_id; }
  set achievement_type(achievement_type) { this.#achievement_type = achievement_type; }
  set achievement_name(achievement_name) { this.#achievement_name = achievement_name; }
  set achievement_description(achievement_description) { this.#achievement_description = achievement_description; }
  set achieved_at(achieved_at) { this.#achieved_at = achieved_at; }
  set tense_id(tense_id) { this.#tense_id = tense_id; }
  set meta_data(meta_data) { this.#meta_data = meta_data; }
}

module.exports = Achievement;