// UserInput constructor
class UserInput {
  #id;
  #tense_id;
  #user_id;
  #user_example;
  #evaluation;
  #created_at;
  #updated_at;

  constructor(upload, bddrow, bodyjson) {
    if (upload) {
      this.#id = upload.id;
      this.#tense_id = upload.tense_id;
      this.#user_id = upload.user_id;
      this.#user_example = upload.user_example;
      this.#evaluation = upload.evaluation;
      this.#created_at = upload.created_at;
      this.#updated_at = upload.updated_at;
    } else if (bddrow) {
      this.#id = bddrow.id;
      this.#tense_id = bddrow.tense_id;
      this.#user_id = bddrow.user_id;
      this.#user_example = bddrow.user_example;
      this.#evaluation = bddrow.evaluation;
      this.#created_at = bddrow.created_at;
      this.#updated_at = bddrow.updated_at;
    } else if (bodyjson) {
      this.#tense_id = bodyjson.tense_id;
      this.#user_id = bodyjson.user_id;
      this.#user_example = bodyjson.user_example;
    this.#evaluation = bodyjson.evaluation || null;
      if (bodyjson.id) this.#id = bodyjson.id;
    } else {
      this.#id = null;
      this.#tense_id = null;
      this.#user_id = null;
      this.#user_example = null;
      this.#evaluation = null;
      this.#created_at = null;
      this.#updated_at = null;
    }
  }

  toObject() {
    return {
      id: this.#id,
      tense_id: this.#tense_id,
      user_id: this.#user_id,
      user_example: this.#user_example,
      evaluation: this.#evaluation,
      created_at: this.#created_at,
      updated_at: this.#updated_at,
    };
  }

  get id() {
    return this.#id;
  }
  get tense_id() {
    return this.#tense_id;
  }
  get user_id() {
    return this.#user_id;
  }
  get user_example() {
    return this.#user_example;
  }
  get evaluation() {
    return this.#evaluation;
  }
  get created_at() {
    return this.#created_at;
  }
  get updated_at() {
    return this.#updated_at;
  }

  set id(id) {
    this.#id = id;
  }
  set tense_id(tense_id) {
    this.#tense_id = tense_id;
  }
  set user_id(user_id) {
    this.#user_id = user_id;
  }
  set user_example(user_example) {
    this.#user_example = user_example;
  }
  set evaluation(evaluation) {
    this.#evaluation = evaluation;
  }
}

module.exports = UserInput;
