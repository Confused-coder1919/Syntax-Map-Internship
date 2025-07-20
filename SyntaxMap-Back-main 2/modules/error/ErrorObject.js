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

}

module.exports = ErrorObject;
