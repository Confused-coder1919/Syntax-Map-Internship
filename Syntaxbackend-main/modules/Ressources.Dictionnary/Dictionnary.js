class Dictionnary {

	#word_id;
	#word;
	#definition;
	#part_of_speech;
	#pronunciation;
	#user_id;
	#session_name;
	#learned;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#word_id = upload.word_id;
			this.#word = upload.word;
			this.#definition = upload.definition;
			this.#part_of_speech = upload.part_of_speech;
			this.#pronunciation = upload.pronunciation;
			this.#user_id = upload.user_id;
			this.#session_name = upload.session_name;
			this.#learned = upload.learned !== undefined ? upload.learned : false;
		} else if (bddrow) {
			this.#word_id = bddrow.word_id;
			this.#word = bddrow.word;
			this.#definition = bddrow.definition;
			this.#part_of_speech = bddrow.part_of_speech;
			this.#pronunciation = bddrow.pronunciation;
			this.#user_id = bddrow.user_id;
			this.#session_name = bddrow.session_name;
			this.#learned = bddrow.learned !== undefined ? bddrow.learned : false;
		} else if (bodyjson) {
			this.#word = bodyjson.word;
			this.#definition = bodyjson.definition;
			this.#part_of_speech = bodyjson.part_of_speech;
			this.#pronunciation = bodyjson.pronunciation;
			this.#user_id = bodyjson.user_id;
			this.#session_name = bodyjson.session_name;
			this.#learned = bodyjson.learned !== undefined ? bodyjson.learned : false;
			if (bodyjson.word_id)
				this.#word_id = bodyjson.word_id;
		} else {
			this.#word_id = null;
			this.#word = null;
			this.#definition = null;
			this.#part_of_speech = null;
			this.#pronunciation = null;
			this.#user_id = null;
			this.#session_name = null;
			this.#learned = false;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.word_id = this.#word_id;
		object.user_id = this.#user_id;
		object.word = this.#word;
		object.definition = this.#definition;
		object.part_of_speech = this.#part_of_speech;
		object.pronunciation = this.#pronunciation;
		object.session_name = this.#session_name;
		object.learned = this.#learned;
		return object;
	}

	get word () { return this.#word; };
	get word_id () { return this.#word_id; };
	get definition () { return this.#definition; };
	get part_of_speech () { return this.#part_of_speech; };
	get pronunciation () { return this.#pronunciation; };
	get user_id () { return this.#user_id; };
	get session_name () { return this.#session_name; };
	get learned () { return this.#learned; };

	set word_id (word_id) { this.#word_id = word_id; };
	set word (word) { this.#word = word; };
	set definition (definition) { this.#definition = definition; };
	set part_of_speech (part_of_speech) { this.#part_of_speech = part_of_speech; };
	set pronunciation (pronunciation) { this.#pronunciation = pronunciation; };
	set user_id (user_id) { this.#user_id = user_id; };
	set session_name (session_name) { this.#session_name = session_name; };
	set learned (learned) { this.#learned = learned; };
}

module.exports = Dictionnary;