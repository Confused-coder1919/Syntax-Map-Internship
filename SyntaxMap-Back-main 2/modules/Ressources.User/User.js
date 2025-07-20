class User {

	#user_id
	#user_name;
	#user_email_address;
	#user_password;
	#user_gender;
	#user_role;
	#last_session;

	constructor (user, bddrow, bodyjson) {
		if (user) {
			this.#user_email_address = user.user_email_address;
			this.#user_password = user.user_password;
			this.#user_name = user.user_name;
			this.#user_id = user.user_id;
			this.#user_gender = user.user_gender;
			this.#user_role = user.user_role;
			this.#last_session = user.last_session;
		} else if (bddrow) {
			this.#user_email_address = bddrow.user_email_address;
			this.#user_password = bddrow.user_password;
			this.#user_name = bddrow.user_name;
			this.#user_id = bddrow.user_id;
			this.#user_gender = bddrow.user_gender;
			this.#user_role = bddrow.user_role
			this.#last_session = bddrow.last_session;
		} else if (bodyjson) {
			this.#user_email_address = bodyjson.user_email_address;
			this.#user_password = bodyjson.user_password;
			this.#user_name = bodyjson.user_name;
			if (bodyjson.user_gender)
				this.#user_gender = bodyjson.user_gender;
			if (bodyjson.user_id)
				this.#user_id = bodyjson.user_id;
			if (bodyjson.user_role)
				this.#user_role = bodyjson.user_role;
			this.#last_session = bodyjson.last_session;
		} else {
			this.#user_email_address = null;
			this.#user_password = null;
			this.#user_name = null;
			this.#user_id = null;
			this.#user_gender = null;
			this.#user_role = null;
			this.#last_session = null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {}
		if (incId === true) {
			object.user_id = this.#user_id;
		}
		object.user_email_address = this.#user_email_address;
		object.user_name = this.#user_name;
		object.user_gender = this.#user_gender;
		if (incPwd === true) {
			object.user_password = this.#user_password;
		}
		if (incAu === true) {
			object.user_role = this.#user_role;
		}
		object.last_session = this.#last_session;
		return object;
	}
	
	get user_gender () { return this.#user_gender; };
	get user_password () { return this.#user_password; };
	get user_email_address () { return this.#user_email_address; };
	get user_name () { return this.#user_name; };
	get user_id () { return this.#user_id; };
	get user_role () { return this.#user_role; };
	get last_session () { return this.#last_session; };

	set user_email_address (user_email_address) { this.#user_email_address = user_email_address; };
	set user_password (user_password) { this.#user_password = user_password; };
	set user_name (user_name) { this.#user_name = user_name; };
	set user_id (id) { this.#user_id = id; };
	set user_gender (user_gender) { this.#user_gender = user_gender; };
	set user_role (user_role) { this.#user_role = user_role; };
	set last_session (last_session) { this.#last_session = last_session; };
}

module.exports = User;
