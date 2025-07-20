class Question {

	#question_id;
	#question_title;
	#answer_title_a;
	#answer_title_b;
	#answer_title_c;
	#answer_title_d;
	#right_answer;
	#difficulty;
	#online_exam_ids;
	#verified;

	constructor (question, bddrow, bodyjson) {
		if (question) {
			this.#question_title = question.question_title;
			this.#question_id = question.question_id;
			this.#answer_title_a = question.answer_title_a;
			this.#answer_title_b = question.answer_title_b;
			this.#answer_title_c = question.answer_title_c;
			this.#answer_title_d = question.answer_title_d;
			this.#right_answer = question.right_answer;
			this.#difficulty = question.difficulty;
			this.#online_exam_ids = question.online_exam_ids;
			this.#verified = question.verified;
		} else if (bddrow) {
			this.#question_title = bddrow.question_title;
			this.#question_id = bddrow.question_id;
			this.#answer_title_a = bddrow.answer_title_a;
			this.#answer_title_b = bddrow.answer_title_b;
			this.#answer_title_c = bddrow.answer_title_c;
			this.#answer_title_d = bddrow.answer_title_d
			this.#right_answer = bddrow.right_answer;
			this.#difficulty = bddrow.difficulty;
			this.#online_exam_ids = bddrow.online_exam_ids;
			this.#verified = bddrow.verified;
		} else if (bodyjson) {
			
			var tmp = bodyjson.quiz_data[0];
			const shuffledArray = bodyjson.quiz_data.sort((a, b) => 0.5 - Math.random());

			this.#question_title = bodyjson.question_title;
			this.#question_id = bodyjson.question_id;
			this.#answer_title_a = shuffledArray[0];
			this.#answer_title_b = shuffledArray[1];
			this.#answer_title_c = shuffledArray[2];
			this.#answer_title_d = shuffledArray[3];
			this.#right_answer = String.fromCharCode(97+shuffledArray.indexOf(tmp));
			this.#difficulty = bodyjson.difficulty;
			this.#online_exam_ids = bodyjson.online_exam_ids;
			this.#verified = bodyjson.verified;
		} else {
			this.#question_title = null;
			this.#question_id = null;
			this.#answer_title_a = null;
			this.#answer_title_b = null;
			this.#answer_title_c = null;
			this.#answer_title_d = null;
			this.#right_answer = null;
			this.#difficulty = null;
			this.#online_exam_ids = null;
			this.#verified = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {}
		object.question_id = this.#question_id;
		object.question_title = this.#question_title;
		object.answer_title_a = this.#answer_title_a;
		object.answer_title_b = this.#answer_title_b;
		object.answer_title_c = this.#answer_title_c;
		object.answer_title_d = this.#answer_title_d;
		object.right_answer = this.#right_answer;
		object.difficulty = this.#difficulty;
		object.online_exam_ids = this.#online_exam_ids;
		object.verified = this.#verified;
		return object;
	}

	get question_title () { return this.#question_title; };
	get id () { return this.#question_id; };
	get answer_title_a () { return this.#answer_title_a; };
	get answer_title_b () { return this.#answer_title_b; };
	get answer_title_c () { return this.#answer_title_c; };
	get answer_title_d () { return this.#answer_title_d; };
	get right_answer () { return this.#right_answer; };
	get online_exam_ids () { return this.#online_exam_ids; };
	get difficulty () { return this.#difficulty; };
	get verified () { return this.#verified; };

	set question_title (question_title) { this.#question_title = question_title; };
	set id (id) { this.#question_id = id; };
	set answer_title_a (answer_title_a) { this.#answer_title_a = answer_title_a; };
	set answer_title_b (answer_title_b) { this.#answer_title_b = answer_title_b; };
	set answer_title_c (answer_title_c) { this.#answer_title_c = answer_title_c; };
	set answer_title_d (answer_title_d) { this.#answer_title_d = answer_title_d; };
	set right_answer (right_answer) { this.#right_answer = right_answer; };
	set online_exam_ids (online_exam_ids) { this.#online_exam_ids = online_exam_ids; };
	set difficulty (difficulty) { this.#difficulty = difficulty; };
	set verified (verified) { this.#verified = verified; };
}

module.exports = Question;
