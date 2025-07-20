// UserInputService
const UserInputDao = require('./UserInputsDao');

class UserInputService {
  #userInputDao = new UserInputDao();

  INSERT(bodyNewUserInput, callback) {
    if (bodyNewUserInput) {
      this.#userInputDao.INSERT(bodyNewUserInput, callback);
    } else {
      this.#userInputDao.ErrorHandling({ code: null }, callback);
    }
  }

  UPDATE(userInput, callback) {
    this.#userInputDao.UPDATE(userInput, callback);
  }

  SELECT(criteria, callback) {
    if (criteria) {
      this.#userInputDao.SELECT(criteria, callback);
    } else {
      this.#userInputDao.ErrorHandling({ code: null }, callback);
    }
  }

  DELETE(userInput, callback) {
    this.#userInputDao.DELETE(userInput, callback);
  }
}

module.exports = UserInputService;