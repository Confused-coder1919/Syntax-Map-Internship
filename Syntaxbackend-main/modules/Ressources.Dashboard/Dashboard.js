class Dashboard {

	#user_id;
	#total_question;
	#nb_good;
	#time_remaining;
	#time_per_question;
	#course_id;
	#result_id;
	#session_name;

	constructor (upload, bddrow, bodyjson) {
		if (upload) {
			this.#user_id =			  upload.user_id;
			this.#total_question =	  upload.total_question;
			this.#nb_good =			  upload.nb_good;
			this.#time_remaining =	  upload.time_remaining;
			this.#time_per_question = upload.time_per_question;
			this.#course_id =		  upload.course_id;
			this.#result_id =		  upload.result_id;
			this.#session_name =	  upload.session_name;
		} else if (bddrow) {
			this.#user_id =			  bddrow.user_id;
			this.#total_question =	  bddrow.total_question;
			this.#nb_good =			  bddrow.nb_good;
			this.#time_remaining =	  bddrow.time_remaining;
			this.#time_per_question = bddrow.time_per_question;
			this.#course_id =		  bddrow.course_id;
			this.#result_id =		  bddrow.result_id;
			this.#session_name =	  bddrow.session_name;
		} else if (bodyjson) {
			this.#user_id =			  bodyjson.user_id;
			this.#total_question =	  bodyjson.total_question;
			this.#nb_good =			  bodyjson.nb_good;
			this.#time_remaining =	  bodyjson.time_remaining;
			this.#time_per_question = bodyjson.time_per_question;
			this.#course_id =		  bodyjson.course_id;
			this.#result_id =		  bodyjson.result_id;
			this.#session_name =	  bodyjson.session_name;
		} else {
			this.#user_id =			  null;
			this.#total_question =	  null;
			this.#nb_good =			  null;
			this.#time_remaining =	  null;
			this.#time_per_question = null;
			this.#course_id =		  null;
			this.#result_id =		  null;
			this.#session_name =	  null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {};
		object.user_id =		this.#user_id;
		object.total_question =	this.#total_question;
		object.nb_good =		this.#nb_good;
		object.time_remaining =	this.#time_remaining;
		object.time_per_question = this.#time_per_question;
		object.course_id =		  this.#course_id;
		object.result_id =		 this.#result_id;
		object.session_name =		 this.#session_name;
		return object;
	}
	
	get user_id () { return this.#user_id; };
	get total_question () { return this.#total_question; };
	get nb_good () { return this.#nb_good; };
	get time_remaining () { return this.#time_remaining; };
	get time_per_question () { return this.#time_per_question; };
	get course_id () { return this.#course_id; };
	get result_id () { return this.#result_id; };
	get session_name () { return this.#session_name; };
	
	set user_id (user_id) { this.#user_id = user_id; };
	set total_question (total_question) { this.#total_question = total_question; };
	set nb_good (nb_good) { this.#nb_good = nb_good; };
	set time_remaining (time_remaining) { this.#time_remaining = time_remaining; };
	set time_per_question (time_per_question) { this.#time_per_question = time_per_question; };
	set course_id (course_id) { this.#course_id = course_id; };
	set result_id (result_id) { this.#result_id = result_id; };
	set session_name (session_name) { this.#session_name = session_name; };
}

module.exports = Dashboard;