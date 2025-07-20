class Dictionnary {

	#word_id;
	#word;
	#user_id;
	#session_name;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#word_id = upload.word_id;
			this.#word = upload.word;
			this.#user_id = upload.user_id;
			this.#session_name = upload.session_name;
		} else if (bddrow) {
			this.#word_id = bddrow.word_id;
			this.#word = bddrow.word;
			this.#user_id = bddrow.user_id;
			this.#session_name = bddrow.session_name;
		} else if (bodyjson) {
			this.#word = bodyjson.word;
			this.#user_id = bodyjson.user_id;
			this.#session_name = bodyjson.session_name;
			if (bodyjson.word_id)
				this.#word_id = bodyjson.word_id;
		} else {
			this.#word_id = null;
			this.#word = null;
			this.#user_id = null;
			this.#session_name = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.word_id = this.#word_id;
		object.user_id = this.#user_id;
		object.word = this.#word;
		object.session_name = this.#session_name;
		return object;
	}

	get word () { return this.#word; };
	get word_id () { return this.#word_id; };
	get user_id () { return this.#user_id; };
	get session_name () { return this.#session_name; };

	set word_id (word_id) { this.#word_id = word_id; };
	set word (word) { this.#word = word; };
	set user_id (user_id) { this.#user_id = user_id; };
	set session_name (session_name) { this.#session_name = session_name; };
}

module.exports = Dictionnary;