class UserUpload {

	#user_id
	#sentence;
	#img;
	#id_upload;
	#tense_id;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#id_upload = upload.id_upload;
			this.#sentence = upload.sentence;
			this.#user_id = upload.user_id;
			this.#img = upload.img;
			this.#tense_id = upload.tense_id;
		} else if (bddrow) {
			this.#id_upload = bddrow.id_upload;
			this.#sentence = bddrow.sentence;
			this.#user_id = bddrow.user_id;
			this.#img = bddrow.img;
			this.#tense_id = bddrow.tense_id;
			console.log('UserUpload created from DB row with img:', this.#img);
		} else if (bodyjson) {
			this.#id_upload = bodyjson.id_upload;
			this.#sentence = bodyjson.sentence;
			this.#img = bodyjson.img;
			this.#tense_id = bodyjson.tense_id;
			if (bodyjson.user_id)
				this.#user_id = bodyjson.user_id;
		} else {
			this.#id_upload = null;
			this.#sentence = null;
			this.#user_id = null;
			this.#img = null;
			this.#tense_id = null;
		}
		
		console.log('UserUpload properties:');
		console.log('id_upload:', this.#id_upload);
		console.log('sentence:', this.#sentence);
		console.log('user_id:', this.#user_id);
		console.log('img:', this.#img);
		console.log('tense_id:', this.#tense_id);
	}

	toObject (incPwd, incId, incAu) {
		let object = {}
		if (incId === true) {
			object.user_id = this.#user_id;
		}
		object.id_upload = this.#id_upload,
		object.sentence = this.#sentence,
		object.img = this.#img,
		object.tense_id = this.#tense_id
		console.log('toObject() returning:', object);
		return object;
	}
	
	get img () { return this.#img; };
	get id_upload () { return this.#id_upload; };
	get sentence () { return this.#sentence; };
	get user_id () { return this.#user_id; };
	get tense_id () { return this.#tense_id; };

	set id_upload (id_upload) { this.#id_upload = id_upload; };
	set sentence (sentence) { this.#sentence = sentence; };
	set user_id (id) { this.#user_id = id; };
	set img (img) { this.#img = img; };
	set tense_id (tense_id) { this.#tense_id = tense_id; };
}

module.exports = UserUpload;