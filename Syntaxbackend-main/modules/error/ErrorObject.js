class ErrorObject {

	#code;
	#errorMessage;

	constructor(code, errorMessage) {
		this.#code = (code) ? code : null;
		this.#errorMessage = (errorMessage) ? errorMessage : null;
	}

	get code() { return this.#code; };
	get errorMessage() { return this.#errorMessage; };

	set code(code) { this.#code = code; };
	set errorMessage(em) { this.#errorMessage = em; };
	
	// Method to convert the error to a plain object for JSON serialization
	toJSON() {
		return {
			code: this.#code,
			errorMessage: this.#errorMessage
		};
	}
}

module.exports = ErrorObject;
