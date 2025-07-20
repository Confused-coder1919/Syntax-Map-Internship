class Notepad {

	#note_id;
	#note;
	#user_id;
	#session_name;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#note_id = upload.note_id;
			this.#note = upload.note;
			this.#user_id = upload.user_id;
			this.#session_name = upload.session_name;
		} else if (bddrow) {
			this.#note_id = bddrow.note_id;
			this.#note = bddrow.note;
			this.#user_id = bddrow.user_id;
			this.#session_name = bddrow.session_name;
		} else if (bodyjson) {
			this.#session_name = bodyjson.session_name;
			this.#note = bodyjson.note;
			this.#user_id = bodyjson.user_id;
			if (bodyjson.note_id)
				this.#note_id = bodyjson.note_id;
		} else {
			this.#note_id = null;
			this.#note = null;
			this.#user_id = null;
			this.#session_name = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.session_name = this.#session_name;
		object.note_id = this.#note_id;
		object.user_id = this.#user_id;
		object.note = this.#note;
		return object;
	}

	get note () { return this.#note; };
	get note_id () { return this.#note_id; };
	get user_id () { return this.#user_id; };
	get session_name () { return this.#session_name; };

	set note_id (note_id) { this.#note_id = note_id; };
	set note (note) { this.#note = note; };
	set user_id (user_id) { this.#user_id = user_id; };
	set session_name (id) { this.#session_name = id; };
}

module.exports = Notepad;