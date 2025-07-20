class User {

	#user_id
	#user_name;
	#user_email_address;
	#user_password;
	#user_gender;
	#user_role;
	#last_session;
	#otp_code;
	#otp_expiry;
	#is_account_active;
	#user_email_verified;
	#login_attempts;
	#last_login_attempt;
	#account_locked_until;

	constructor (user, bddrow, bodyjson) {
		// Initialize all fields with null to ensure they always have a value
		this.#user_id = null;
		this.#user_name = null;
		this.#user_email_address = null;
		this.#user_password = null;
		this.#user_gender = null;
		this.#user_role = null;
		this.#last_session = null;
		this.#otp_code = null;
		this.#otp_expiry = null;
		this.#is_account_active = false;
		this.#user_email_verified = false;
		this.#login_attempts = 0;
		this.#last_login_attempt = null;
		this.#account_locked_until = null;
		
		if (user) {
			this.#user_email_address = user.user_email_address || null;
			this.#user_password = user.user_password || null;
			this.#user_name = user.user_name || null;
			this.#user_id = user.user_id || null;
			this.#user_gender = user.user_gender || null;
			this.#user_role = user.user_role || null;
			this.#last_session = user.last_session || null;
			this.#otp_code = user.otp_code || null;
			this.#otp_expiry = user.otp_expiry || null;
			this.#is_account_active = user.is_account_active || false;
			this.#user_email_verified = user.user_email_verified || false;
			this.#login_attempts = user.login_attempts || 0;
			this.#last_login_attempt = user.last_login_attempt || null;
			this.#account_locked_until = user.account_locked_until || null;
		} else if (bddrow) {
			this.#user_email_address = bddrow.user_email_address || null;
			this.#user_password = bddrow.user_password || null;
			this.#user_name = bddrow.user_name || null;
			this.#user_id = bddrow.user_id || null;
			this.#user_gender = bddrow.user_gender || null;
			this.#user_role = bddrow.user_role || null;
			this.#last_session = bddrow.last_session || null;
			this.#otp_code = bddrow.otp_code || null;
			this.#otp_expiry = bddrow.otp_expiry || null;
			this.#is_account_active = bddrow.is_account_active || false;
			this.#user_email_verified = bddrow.user_email_verified || false;
			this.#login_attempts = bddrow.login_attempts || 0;
			this.#last_login_attempt = bddrow.last_login_attempt || null;
			this.#account_locked_until = bddrow.account_locked_until || null;
		} else if (bodyjson) {
			this.#user_email_address = bodyjson.user_email_address || null;
			this.#user_password = bodyjson.user_password || null;
			this.#user_name = bodyjson.user_name || null;
			if (bodyjson.user_gender)
				this.#user_gender = bodyjson.user_gender;
			if (bodyjson.user_id)
				this.#user_id = bodyjson.user_id;
			
			// Handle both user_role and user_type fields
			if (bodyjson.user_role) {
				this.#user_role = bodyjson.user_role;
			} else if (bodyjson.user_type) {
				try {
					// Map user_type string to role ID
					 // 1 = admin, 2 = teacher, 3 = student, 4 = guest
					if (bodyjson.user_type === 'admin') {
						this.#user_role = 1;
					} else if (bodyjson.user_type === 'teacher') {
						this.#user_role = 2;
					} else if (bodyjson.user_type === 'student') {
						this.#user_role = 3;
					} else {
						this.#user_role = 4; // Default to guest role
					}
					console.log(`Setting user_role to ${this.#user_role} based on user_type: ${bodyjson.user_type}`);
				} catch (error) {
					console.error("Error setting user role:", error);
					// Default to guest role if there's an error
					this.#user_role = 4;
				}
			} else {
				// Default role if neither user_role nor user_type is provided
				this.#user_role = 4; // Default to guest role
			}
			
			this.#last_session = bodyjson.last_session || null;
			this.#otp_code = bodyjson.otp_code || null;
			this.#otp_expiry = bodyjson.otp_expiry || null;
			this.#is_account_active = bodyjson.is_account_active || false;
			this.#user_email_verified = bodyjson.user_email_verified || false;
			this.#login_attempts = bodyjson.login_attempts || 0;
			this.#last_login_attempt = bodyjson.last_login_attempt || null;
			this.#account_locked_until = bodyjson.account_locked_until || null;
		}
	}

	toObject (incPwd, incId, incAu) {
		let object = {}
		try {
			// CRITICAL: Always include user_id for role management functionality
			object.user_id = this.#user_id;
			
			object.user_email_address = this.#user_email_address;
			object.user_name = this.#user_name;
			object.user_gender = this.#user_gender;
			if (incPwd === true) {
				object.user_password = this.#user_password;
			}
			if (incAu === true) {
				object.user_role = this.#user_role;
			} else {
				// Always include user_role for proper UI display
				object.user_role = this.#user_role;
			}
			object.last_session = this.#last_session;
			object.user_email_verified = this.#user_email_verified;
			object.is_account_active = this.#is_account_active;
			object.login_attempts = this.#login_attempts;
			object.account_locked_until = this.#account_locked_until;
			
			// Only include OTP fields if password is included (for admin/internal use)
			if (incPwd === true) {
				object.otp_code = this.#otp_code;
				object.otp_expiry = this.#otp_expiry;
			}
			
			return object;
		} catch (error) {
			console.error("Error in toObject method:", error);
			// Return a minimal valid object if there's an error
			return { 
				user_id: this.#user_id, // Include ID even in error case
				user_email_address: this.#user_email_address || "",
				user_name: this.#user_name || "",
				user_role: this.#user_role || 4
			};
		}
	}
	
	// Getters and setters remain unchanged
	get user_gender () { return this.#user_gender; };
	get user_password () { return this.#user_password; };
	get user_email_address () { return this.#user_email_address; };
	get user_name () { return this.#user_name; };
	get user_id () { return this.#user_id; };
	get user_role () { return this.#user_role; };
	get last_session () { return this.#last_session; };
	get otp_code () { return this.#otp_code; };
	get otp_expiry () { return this.#otp_expiry; };
	get is_account_active () { return this.#is_account_active; };
	get user_email_verified () { return this.#user_email_verified; };
	get login_attempts () { return this.#login_attempts; };
	get last_login_attempt () { return this.#last_login_attempt; };
	get account_locked_until () { return this.#account_locked_until; };

	set user_email_address (user_email_address) { this.#user_email_address = user_email_address; };
	set user_password (user_password) { this.#user_password = user_password; };
	set user_name (user_name) { this.#user_name = user_name; };
	set user_id (id) { this.#user_id = id; };
	set user_gender (user_gender) { this.#user_gender = user_gender; };
	set user_role (user_role) { this.#user_role = user_role; };
	set last_session (last_session) { this.#last_session = last_session; };
	set otp_code (otp_code) { this.#otp_code = otp_code; };
	set otp_expiry (otp_expiry) { this.#otp_expiry = otp_expiry; };
	set is_account_active (is_account_active) { this.#is_account_active = is_account_active; };
	set user_email_verified (user_email_verified) { this.#user_email_verified = user_email_verified; };
	set login_attempts (login_attempts) { this.#login_attempts = login_attempts; };
	set last_login_attempt (last_login_attempt) { this.#last_login_attempt = last_login_attempt; };
	set account_locked_until (account_locked_until) { this.#account_locked_until = account_locked_until; };
}

module.exports = User;
