class UserUpload {

	#user_id
	#course_id;
	#sentence;
	#img;
	#id_upload;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#id_upload = upload.id_upload;
			this.#course_id = upload.course_id;
			this.#sentence = upload.sentence;
			this.#user_id = upload.user_id;
			this.#img = upload.img;
		} else if (bddrow) {
			this.#id_upload = bddrow.id_upload;
			this.#course_id = bddrow.course_id;
			this.#sentence = bddrow.sentence;
			this.#user_id = bddrow.user_id;
			this.#img = bddrow.img;
		} else if (bodyjson) {
			this.#id_upload = bodyjson.id_upload;
			this.#course_id = bodyjson.course_id;
			this.#sentence = bodyjson.sentence;
			this.#img = bodyjson.img;
			if (bodyjson.user_id)
				this.#user_id = bodyjson.user_id;
		} else {
			this.#id_upload = null;
			this.#course_id = null;
			this.#sentence = null;
			this.#user_id = null;
			this.#img = null;
		}
		
		console.log(this.#id_upload)
		console.log(this.#course_id)
		console.log(this.#sentence)
		console.log(this.#user_id)
		console.log(this.#img)
	}

	toObject (incPwd, incId, incAu) {
		let object = {}
		if (incId === true) {
			object.user_id = this.#user_id;
		}
		object.id_upload = this.#id_upload,
		object.sentence = this.#sentence,
		object.img = this.#img
		if (incPwd === true) {
			object.course_id = this.#course_id;
		}
		return object;
	}
	
	get img () { return this.#img; };
	get course_id () { return this.#course_id; };
	get id_upload () { return this.#id_upload; };
	get sentence () { return this.#sentence; };
	get user_id () { return this.#user_id; };

	set id_upload (id_upload) { this.#id_upload = id_upload; };
	set course_id (course_id) { this.#course_id = course_id; };
	set sentence (sentence) { this.#sentence = sentence; };
	set user_id (id) { this.#user_id = id; };
	set img (img) { this.#img = img; };
}

module.exports = UserUpload;