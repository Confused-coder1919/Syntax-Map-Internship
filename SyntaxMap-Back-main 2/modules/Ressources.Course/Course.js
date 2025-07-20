class Course {

	#course_id;
	#course_title;
	#course_image;
	#course_data;
	#course_item;
	#hide;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#course_item = upload.course_item;
			this.#course_title = upload.course_title;
			this.#course_image = upload.course_image;
			this.#course_id = upload.course_id;
			this.#course_data = upload.course_data;
			this.#hide = upload.hide;
		} else if (bddrow) {
			this.#course_item = bddrow.course_item;
			this.#course_title = bddrow.course_title;
			this.#course_image = bddrow.course_image;
			this.#course_id = bddrow.course_id;
			this.#course_data = bddrow.course_data;
			this.#hide = bddrow.hide;
		} else if (bodyjson) {
			this.#course_item = bodyjson.course_item;
			this.#course_title = bodyjson.course_title;
			this.#course_image = bodyjson.course_image;
			this.#course_data = bodyjson.course_data;
			this.#hide = bodyjson.hide;
			if (bodyjson.course_id)
				this.#course_id = bodyjson.course_id;
		} else {
			this.#course_item = null;
			this.#course_title = null;
			this.#course_image = null;
			this.#course_id = null;
			this.#course_data = null;
			this.#hide = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.course_id = this.#course_id;
		object.course_item = this.#course_item;
		object.course_image = this.#course_image;
		object.course_data = this.#course_data;
		object.course_title = this.#course_title;
		object.hide = this.#hide;
		return object;
	}

	get course_data () { return this.#course_data; };
	get course_title () { return this.#course_title; };
	get course_item () { return this.#course_item; };
	get course_image () { return this.#course_image; };
	get id () { return this.#course_id; };
	get hide () { return this.#hide };

	set course_item (course_item) { this.#course_item = course_item; };
	set course_title (course_title) { this.#course_title = course_title; };
	set course_image (course_image) { this.#course_image = course_image; };
	set id (id) { this.#course_id = id; };
	set course_data (course_data) { this.#course_data = course_data; };
	set hide (hide) { this.#hide = hide; };
}

module.exports = Course;