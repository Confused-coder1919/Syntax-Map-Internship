const NotepadDao = require('./NotepadDao');
const Notepad = require('./Notepad');

class NotepadService {

	#notepadDao = new NotepadDao();

	constructor () {
	}

	SELECT (criteria, callback) {
		if (criteria) {
		   this.#notepadDao.SELECT(criteria, callback);
		} else {
			this.#notepadDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	INSERT (bodyNewNotepad, callback) {
		if (bodyNewNotepad) {
			this.#notepadDao.INSERT(bodyNewNotepad, callback);
		} else {
			this.#notepadDao.ErrorHandling({
				'code': null
			}, callback);
		}
	}

	UPDATE (notepad, callback) {
		this.#notepadDao.UPDATE(notepad, callback);
	}

	DELETE (notepad, callback) {
		this.#notepadDao.DELETE(notepad, callback);
	}

}

module.exports = NotepadService;
