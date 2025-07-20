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
			
			// Parse course_data as JSON if it's a string
			if (typeof bddrow.course_data === 'string' && bddrow.course_data.trim()) {
				try {
					this.#course_data = JSON.parse(bddrow.course_data);
				} catch (e) {
					// If parsing fails, keep as string
					this.#course_data = bddrow.course_data;
				}
			} else {
				this.#course_data = bddrow.course_data;
			}
			
			this.#hide = bddrow.hide;
		} else if (bodyjson) {
			// Accept both prefixed and non-prefixed field names
			this.#course_item = bodyjson.course_item || bodyjson.item || '';
			this.#course_title = bodyjson.course_title || bodyjson.title || '';
			this.#course_image = bodyjson.course_image || bodyjson.image || '';
			
			// Handle data field - parse JSON if it's a string
			const dataValue = bodyjson.course_data || bodyjson.data || '';
			if (typeof dataValue === 'string' && dataValue.trim()) {
				try {
					this.#course_data = JSON.parse(dataValue);
				} catch (e) {
					// If parsing fails, keep as string
					this.#course_data = dataValue;
				}
			} else {
				this.#course_data = dataValue;
			}
			
			this.#hide = bodyjson.hide || false;
			if (bodyjson.course_id || bodyjson.id)
				this.#course_id = bodyjson.course_id || bodyjson.id;
		} else {
			this.#course_item = '';
			this.#course_title = '';
			this.#course_image = '';
			this.#course_id = null;
			this.#course_data = {};
			this.#hide = false;
		}

		// Add non-enumerable properties for console.log visibility
		Object.defineProperty(this, '_debug_info', {
			get: function() {
				return {
					course_id: this.#course_id,
					course_title: this.#course_title
				};
			},
			enumerable: true
		});
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

	// Add a toJSON method for proper serialization
	toJSON() {
		return this.toObject(true, true, true);
	}

	toString() {
		return JSON.stringify(this.toObject());
	}

	// Custom inspection for better console.log output
	[Symbol.for('nodejs.util.inspect.custom')]() {
		return this.toObject();
	}

	// Add public properties for direct access in JSON responses
	get _json() {
		return this.toObject();
	}

	get course_data () { return this.#course_data; };
	get course_title () { return this.#course_title; };
	get course_item () { return this.#course_item; };
	get course_image () { return this.#course_image; };
	get course_id () { return this.#course_id; }; // Added getter for course_id
	get id () { return this.#course_id; };
	get hide () { return this.#hide };

	set course_item (course_item) { this.#course_item = course_item; };
	set course_title (course_title) { this.#course_title = course_title; };
	set course_image (course_image) { this.#course_image = course_image; };
	set course_id (course_id) { this.#course_id = course_id; }; // Added setter for course_id
	set id (id) { this.#course_id = id; };
	set course_data (course_data) { this.#course_data = course_data; };
	set hide (hide) { this.#hide = hide; };
}

module.exports = Course;