class MistakeQuestion {

	#mistake_id;
	#questions_wrong_id;
	#user_id;
	#session_name;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#mistake_id = upload.mistake_id;
			this.#questions_wrong_id = upload.questions_wrong_id;
			this.#user_id = upload.user_id;
			this.#session_name = upload.session_name;
		} else if (bddrow) {
			this.#mistake_id = bddrow.mistake_id;
			this.#questions_wrong_id = bddrow.questions_wrong_id;
			this.#user_id = bddrow.user_id;
			this.#session_name = bddrow.session_name;
		} else if (bodyjson) {
			this.#session_name = bodyjson.session_name;
			this.#questions_wrong_id = bodyjson.questions_wrong_id;
			this.#user_id = bodyjson.user_id;
			if (bodyjson.mistake_id)
				this.#mistake_id = bodyjson.mistake_id;
		} else {
			this.#mistake_id = null;
			this.#questions_wrong_id = null;
			this.#user_id = null;
			this.#session_name = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.session_name = this.#session_name;
		object.mistake_id = this.#mistake_id;
		object.user_id = this.#user_id;
		object.questions_wrong_id = this.#questions_wrong_id;
		return object;
	}

	get questions_wrong_id () { return this.#questions_wrong_id; };
	get mistake_id () { return this.#mistake_id; };
	get user_id () { return this.#user_id; };
	get session_name () { return this.#session_name; };

	set mistake_id (mistake_id) { this.#mistake_id = mistake_id; };
	set questions_wrong_id (questions_wrong_id) { this.#questions_wrong_id = questions_wrong_id; };
	set user_id (user_id) { this.#user_id = user_id; };
	set session_name (id) { this.#session_name = id; };
}

module.exports = MistakeQuestion;