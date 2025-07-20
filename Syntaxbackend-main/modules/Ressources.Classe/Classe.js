class Classe {

	#classe_id;
	#classe_name;
	#professor_id;
	#students_id;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#classe_id = upload.classe_id;
			this.#classe_name = upload.classe_name;
			this.#professor_id = upload.professor_id;
			this.#students_id = upload.students_id;
		} else if (bddrow) {
			this.#classe_id = bddrow.classe_id;
			this.#classe_name = bddrow.classe_name;
			this.#professor_id = bddrow.professor_id;
			this.#students_id = bddrow.students_id;
		} else if (bodyjson) {
			this.#students_id = bodyjson.students_id;
			this.#classe_name = bodyjson.classe_name;
			this.#professor_id = bodyjson.professor_id;
			if (bodyjson.classe_id)
				this.#classe_id = bodyjson.classe_id;
		} else {
			this.#classe_id = null;
			this.#classe_name = null;
			this.#professor_id = null;
			this.#students_id = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.students_id = this.#students_id;
		object.classe_id = this.#classe_id;
		object.professor_id = this.#professor_id;
		object.classe_name = this.#classe_name;
		return object;
	}

	get classe_name () { return this.#classe_name; };
	get classe_id () { return this.#classe_id; };
	get professor_id () { return this.#professor_id; };
	get students_id () { return this.#students_id; };

	set classe_id (classe_id) { this.#classe_id = classe_id; };
	set classe_name (classe_name) { this.#classe_name = classe_name; };
	set professor_id (professor_id) { this.#professor_id = professor_id; };
	set students_id (id) { this.#students_id = id; };
}

module.exports = Classe;