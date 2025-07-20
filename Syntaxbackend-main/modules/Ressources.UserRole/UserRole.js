class UserRole {
	#id;
	#user_id;
	#role;
	#created_at;
	#updated_at;
  
	constructor(userRole, dbRow, bodyJson) {
	  if (userRole) {
		this.#id = userRole.id;
		this.#user_id = userRole.user_id;
		this.#role = userRole.role;
		this.#created_at = userRole.created_at;
		this.#updated_at = userRole.updated_at;
	  } else if (dbRow) {
		this.#id = dbRow.id;
		this.#user_id = dbRow.user_id;
		this.#role = dbRow.role;
		this.#created_at = dbRow.created_at;
		this.#updated_at = dbRow.updated_at;
	  } else if (bodyJson) {
		this.#id = bodyJson.id;
		this.#user_id = bodyJson.user_id;
		this.#role = bodyJson.role;
		if (bodyJson.created_at) this.#created_at = bodyJson.created_at;
		if (bodyJson.updated_at) this.#updated_at = bodyJson.updated_at;
	  } else {
		this.#id = null;
		this.#user_id = null;
		this.#role = null;
		this.#created_at = null;
		this.#updated_at = null;
	  }
	}
  
	toObject() {
	  return {
		id: this.#id,
		user_id: this.#user_id,
		role: this.#role,
		created_at: this.#created_at,
		updated_at: this.#updated_at,
	  };
	}
  
	get id() { return this.#id; }
	get user_id() { return this.#user_id; }
	get role() { return this.#role; }
	get created_at() { return this.#created_at; }
	get updated_at() { return this.#updated_at; }
  
	set user_id(user_id) { this.#user_id = user_id; }
	set role(role) { this.#role = role; }
  }
  
  module.exports = UserRole;
  