class QuizPerformance {
  #id;
  #quiz_details_id;
  #tense_id;
  #user_id;
  #total_questions;
  #correct_answers;
  #incorrect_answers;
  #total_time_taken; 
  #avg_time_per_question;
  #incorrect_question_data;
  #missed_questions;

  constructor(performance, bddrow, bodyjson) {
    if (performance) {
      this.#id = performance.id;
      this.#quiz_details_id = performance.quiz_details_id;
      this.#tense_id = performance.tense_id;
      this.#user_id = performance.user_id;
      this.#total_questions = performance.total_questions;
      this.#correct_answers = performance.correct_answers;
      this.#incorrect_answers = performance.incorrect_answers;
      this.#total_time_taken = performance.total_time_taken;
      this.#avg_time_per_question = performance.avg_time_per_question;
      this.#incorrect_question_data = performance.incorrect_question_data;
      this.#missed_questions = performance.missed_questions;
    } else if (bddrow) {
      this.#id = bddrow.id;
      this.#quiz_details_id = bddrow.quiz_details_id;
      this.#tense_id = bddrow.tense_id;
      this.#user_id = bddrow.user_id;
      this.#total_questions = bddrow.total_questions;
      this.#correct_answers = bddrow.correct_answers;
      this.#incorrect_answers = bddrow.incorrect_answers;
      this.#total_time_taken = bddrow.total_time_taken;
      this.#avg_time_per_question = bddrow.avg_time_per_question;
      this.#incorrect_question_data = bddrow.incorrect_question_data;
      this.#missed_questions = bddrow.missed_questions;
    } else if (bodyjson) {
      this.#id = bodyjson.id;
      this.#quiz_details_id = bodyjson.quiz_details_id;
      this.#tense_id = bodyjson.tense_id;
      this.#user_id = bodyjson.user_id;
      this.#total_questions = bodyjson.total_questions;
      this.#correct_answers = bodyjson.correct_answers;
      this.#incorrect_answers = bodyjson.incorrect_answers;
      this.#total_time_taken = bodyjson.total_time_taken;
      this.#avg_time_per_question = bodyjson.avg_time_per_question;
      
      // Handle JSON data structures - ensuring they're properly parsed if they're strings
      if (bodyjson.incorrect_question_data) {
        if (typeof bodyjson.incorrect_question_data === 'string') {
          try {
            this.#incorrect_question_data = JSON.parse(bodyjson.incorrect_question_data);
          } catch (e) {
            this.#incorrect_question_data = [];
          }
        } else {
          this.#incorrect_question_data = bodyjson.incorrect_question_data;
        }
      } else {
        this.#incorrect_question_data = [];
      }
      
      if (bodyjson.missed_questions) {
        if (typeof bodyjson.missed_questions === 'string') {
          try {
            this.#missed_questions = JSON.parse(bodyjson.missed_questions);
          } catch (e) {
            this.#missed_questions = [];
          }
        } else {
          this.#missed_questions = bodyjson.missed_questions;
        }
      } else {
        this.#missed_questions = [];
      }
    } else {
      this.#id = null;
      this.#quiz_details_id = null;
      this.#tense_id = null;
      this.#user_id = null;
      this.#total_questions = null;
      this.#correct_answers = null;
      this.#incorrect_answers = null;
      this.#total_time_taken = null;
      this.#avg_time_per_question = null;
      this.#incorrect_question_data = [];
      this.#missed_questions = [];
    }
  }

  toObject() {
    return {
      id: this.#id,
      quiz_details_id: this.#quiz_details_id,
      tense_id: this.#tense_id,
      user_id: this.#user_id,
      total_questions: this.#total_questions,
      correct_answers: this.#correct_answers,
      incorrect_answers: this.#incorrect_answers,
      total_time_taken: this.#total_time_taken,
      avg_time_per_question: this.#avg_time_per_question,
      incorrect_question_data: this.#incorrect_question_data,
      missed_questions: this.#missed_questions
    };
  }

  // Getters
  get id() { return this.#id; }
  get quiz_details_id() { return this.#quiz_details_id; }
  get tense_id() { return this.#tense_id; }
  get user_id() { return this.#user_id; }
  get total_questions() { return this.#total_questions; }
  get correct_answers() { return this.#correct_answers; }
  get incorrect_answers() { return this.#incorrect_answers; }
  get total_time_taken() { return this.#total_time_taken; }
  get avg_time_per_question() { return this.#avg_time_per_question; }
  get incorrect_question_data() { return this.#incorrect_question_data; }
  get missed_questions() { return this.#missed_questions; }

  // Setters
  set id(id) { this.#id = id; }
  set quiz_details_id(id) { this.#quiz_details_id = id; }
  set tense_id(id) { this.#tense_id = id; }
  set user_id(id) { this.#user_id = id; }
  set total_questions(val) { this.#total_questions = val; }
  set correct_answers(val) { this.#correct_answers = val; }
  set incorrect_answers(val) { this.#incorrect_answers = val; }
  set total_time_taken(val) { this.#total_time_taken = val; }
  set avg_time_per_question(val) { this.#avg_time_per_question = val; }
  set incorrect_question_data(data) { this.#incorrect_question_data = data; }
  set missed_questions(data) { this.#missed_questions = data; }
}

module.exports = QuizPerformance;