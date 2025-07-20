const UserRoleDao = require("./UserRoleDao.js");

class UserRoleService {
  #userRoleDao = new UserRoleDao();

  constructor() {}

  SELECT(criteria, callback) {
    if (criteria) {
      this.#userRoleDao.SELECT(criteria, callback);
    } else {
      this.#userRoleDao.ErrorHandling({ code: null }, callback);
    }
  }

  INSERT(bodyNewUserRole, callback) {
    if (bodyNewUserRole) {
      this.#userRoleDao.INSERT(bodyNewUserRole, callback);
    } else {
      this.#userRoleDao.ErrorHandling({ code: null }, callback);
    }
  }

  UPDATE(userRole, callback) {
    if (userRole) {
      this.#userRoleDao.UPDATE(userRole, callback);
    } else {
      this.#userRoleDao.ErrorHandling({ code: null }, callback);
    }
  }

  DELETE(userRole, callback) {
    if (userRole) {
      this.#userRoleDao.DELETE(userRole, callback);
    } else {
      this.#userRoleDao.ErrorHandling({ code: null }, callback);
    }
  }
}

module.exports = UserRoleService;
