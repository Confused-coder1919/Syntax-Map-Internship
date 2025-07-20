class Notepad {

	#note_id;
	#user_id;
	#content_type;     // 'mistake', 'example', 'vocabulary', 'note'
	#content;          // Actual content (text, example sentence, vocab word)
	#created_at;
	#updated_at;
	#reference_id;     // ID of the related item (quiz question, tense, etc.)
	#reference_type;   // Type of the reference (quiz, tense, etc.)
	#is_reviewed;      // For mistakes: whether the student marked it as reviewed
	#is_learned;       // For vocabulary: whether the student marked it as learned
	#tags;             // Array of user-defined tags
	#pronunciation;    // For vocabulary: pronunciation info
	#meaning;          // For vocabulary: meaning/translation
	#category;         // Optional category for organization

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#note_id = upload.note_id;
			this.#user_id = upload.user_id;
			this.#content_type = upload.content_type || 'note';
			this.#content = upload.content;
			this.#created_at = upload.created_at || new Date().toISOString();
			this.#updated_at = upload.updated_at || new Date().toISOString();
			this.#reference_id = upload.reference_id;
			this.#reference_type = upload.reference_type;
			this.#is_reviewed = upload.is_reviewed || false;
			this.#is_learned = upload.is_learned || false;
			this.#tags = upload.tags ? (Array.isArray(upload.tags) ? upload.tags : JSON.parse(upload.tags)) : [];
			this.#pronunciation = upload.pronunciation;
			this.#meaning = upload.meaning;
			this.#category = upload.category;
		} else if (bddrow) {
			this.#note_id = bddrow.id || bddrow.note_id;
			this.#user_id = bddrow.user_id;
			this.#content_type = bddrow.content_type || 'note';
			this.#content = bddrow.content;
			this.#created_at = bddrow.created_at;
			this.#updated_at = bddrow.updated_at;
			this.#reference_id = bddrow.reference_id;
			this.#reference_type = bddrow.reference_type;
			this.#is_reviewed = bddrow.is_reviewed || false;
			this.#is_learned = bddrow.is_learned || false;
			this.#tags = bddrow.tags ? (typeof bddrow.tags === 'string' ? JSON.parse(bddrow.tags) : bddrow.tags) : [];
			this.#pronunciation = bddrow.pronunciation;
			this.#meaning = bddrow.meaning;
			this.#category = bddrow.category;
		} else if (bodyjson) {
			this.#user_id = bodyjson.user_id;
			this.#content_type = bodyjson.content_type || 'note';
			this.#content = bodyjson.content;
			this.#reference_id = bodyjson.reference_id;
			this.#reference_type = bodyjson.reference_type;
			this.#is_reviewed = bodyjson.is_reviewed || false;
			this.#is_learned = bodyjson.is_learned || false;
			this.#tags = bodyjson.tags || [];
			this.#pronunciation = bodyjson.pronunciation;
			this.#meaning = bodyjson.meaning;
			this.#category = bodyjson.category;

			// Optionally set the ID if provided
			if (bodyjson.note_id)
				this.#note_id = bodyjson.note_id;
				
			// Set timestamps for new items
			this.#created_at = bodyjson.created_at || new Date().toISOString();
			this.#updated_at = bodyjson.updated_at || new Date().toISOString();
		} else {
			this.#note_id = null;
			this.#user_id = null;
			this.#content_type = 'note';
			this.#content = null;
			this.#created_at = new Date().toISOString();
			this.#updated_at = new Date().toISOString();
			this.#reference_id = null;
			this.#reference_type = null;
			this.#is_reviewed = false;
			this.#is_learned = false;
			this.#tags = [];
			this.#pronunciation = null;
			this.#meaning = null;
			this.#category = null;
		}
	}

	componentDidMount() {
		fetch(process.env.REACT_APP_API_URL + "/userupload/user/" + this.props.course_id, {
			headers: { "Authorization": localStorage.getItem('jstoken') }
		})
		.then(res => res.json())  // This could also be failing
		.then((res) => { /* process uploads */ })
	}

	toObject() {
		return {
			note_id: this.#note_id,
			user_id: this.#user_id,
			content_type: this.#content_type,
			content: this.#content,
			created_at: this.#created_at,
			updated_at: this.#updated_at,
			reference_id: this.#reference_id,
			reference_type: this.#reference_type,
			is_reviewed: this.#is_reviewed,
			is_learned: this.#is_learned,
			tags: this.#tags,
			pronunciation: this.#pronunciation,
			meaning: this.#meaning,
			category: this.#category
		};
	}

	get note_id() { return this.#note_id; }
	get user_id() { return this.#user_id; }
	get content_type() { return this.#content_type; }
	get content() { return this.#content; }
	get created_at() { return this.#created_at; }
	get updated_at() { return this.#updated_at; }
	get reference_id() { return this.#reference_id; }
	get reference_type() { return this.#reference_type; }
	get is_reviewed() { return this.#is_reviewed; }
	get is_learned() { return this.#is_learned; }
	get tags() { return this.#tags; }
	get pronunciation() { return this.#pronunciation; }
	get meaning() { return this.#meaning; }
	get category() { return this.#category; }

	set note_id(id) { this.#note_id = id; }
	set user_id(id) { this.#user_id = id; }
	set content_type(type) { this.#content_type = type; }
	set content(content) { this.#content = content; }
	set created_at(date) { this.#created_at = date; }
	set updated_at(date) { this.#updated_at = date; }
	set reference_id(id) { this.#reference_id = id; }
	set reference_type(type) { this.#reference_type = type; }
	set is_reviewed(value) { this.#is_reviewed = value; }
	set is_learned(value) { this.#is_learned = value; }
	set tags(tagArray) { this.#tags = tagArray; }
	set pronunciation(value) { this.#pronunciation = value; }
	set meaning(value) { this.#meaning = value; }
	set category(value) { this.#category = value; }
}

module.exports = Notepad;