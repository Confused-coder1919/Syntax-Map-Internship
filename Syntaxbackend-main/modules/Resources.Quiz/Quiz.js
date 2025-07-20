class Quiz {
  #quiz_id;
  #question;
  #options;
  #correct_answer;
  #tense_id;

  constructor(upload, bddrow, bodyjson) {
    if (upload) {
      this.#quiz_id = upload.quiz_id;
      this.#question = upload.question;
      this.#options = upload.options;
      this.#correct_answer = upload.correct_answer;
      this.#tense_id = upload.tense_id;
    } else if (bddrow) {
      this.#question = bddrow.question;
      this.#options = bddrow.options;
      this.#correct_answer = bddrow.correct_answer;
      this.#tense_id = bddrow.tense_id;
      if (bddrow.id) this.#quiz_id = bddrow.id;
      if (bddrow.quiz_id) this.#quiz_id = bddrow.quiz_id;
    } else if (bodyjson) {
      // Handle both object structures (direct properties or nested in question/options)
      this.#question = bodyjson.question;
      
      // Handle options which might be a string (JSON array) or actual array
      if (typeof bodyjson.options === 'string') {
        try {
          this.#options = JSON.parse(bodyjson.options);
        } catch (e) {
          this.#options = bodyjson.options;
        }
      } else {
        this.#options = bodyjson.options || [];
      }
      
      this.#correct_answer = bodyjson.correct_answer;
      this.#tense_id = bodyjson.tense_id;
      
      if (bodyjson.id) this.#quiz_id = bodyjson.id;
      if (bodyjson.quiz_id) this.#quiz_id = bodyjson.quiz_id;
    } else {
      this.#quiz_id = null;
      this.#question = null;
      this.#options = null;
      this.#correct_answer = null;
      this.#tense_id = null;
    }
  }

  toObject() {
    return {
      quiz_id: this.#quiz_id,
      question: this.#question,
      options: this.#options,
      correct_answer: this.#correct_answer,
      tense_id: this.#tense_id,
    };
  }

  get quiz_id() {
    return this.#quiz_id;
  }
  get question() {
    return this.#question;
  }
  get options() {
    return this.#options;
  }
  get correct_answer() {
    return this.#correct_answer;
  }
  get tense_id() {
    return this.#tense_id;
  }

  set quiz_id(id) {
    this.#quiz_id = id;
  }
  set question(name) {
    this.#question = name;
  }
  set options(name) {
    this.#options = name;
  }
  set correct_answer(name) {
    this.#correct_answer = name;
  }
  set tense_id(id) {
    this.#tense_id = id;
  }
}

module.exports = Quiz;
