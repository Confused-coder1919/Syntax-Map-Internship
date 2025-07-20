const pool = require("../../config/db_connect");
const { v4: uuidv4 } = require("uuid");
const UserRole = require("./UserRole.js");
const InterfaceDao = require("../InterfaceDao.js");

class UserRoleDao extends InterfaceDao {
  constructor() {
    super();
  }



  INSERT(userRole, callback) {
    const id = uuidv4();
    const values = [id, userRole.user_id, userRole.role];
    const qtext = `INSERT INTO user_role_table (id, user_id, role) 
                   VALUES (${this.dv(values[0])}, ${this.dv(
      values[1]
    )}, ${this.dv(values[2])})`;

    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        console.log(res);
        userRole.id = id;
        callback(userRole);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  SELECT(criteria, callback) {
    const { user_id } = criteria;
    const qtext = `SELECT * FROM user_role_table WHERE user_id = ${this.dv(
      user_id
    )}`;

    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        const roles = res.rows.map((row) =>
          new UserRole(null, row, null).toObject()
        );
        console.log(res.rows, "User Role Example");
        callback(roles);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  UPDATE(userRole, callback) {
    const values = [userRole.role, userRole.id];
    const qtext = `UPDATE user_role_table SET role = ${this.dv(values[0])}, 
                   updated_at = NOW() WHERE id = ${this.dv(values[1])}`;

    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        if (res.rowCount === 0) {
          this.ErrorHandling({ code: "_1", id: userRole.id }, callback);
        }
        callback(userRole);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }

  DELETE(userRole, callback) {
    const qtext = `DELETE FROM user_role_table WHERE id = ${this.dv(
      userRole.id
    )}`;

    console.log(qtext);
    pool
      .query(qtext)
      .then((res) => {
        if (res.rowCount === 0) {
          this.ErrorHandling({ code: "_1", id: userRole.id }, callback);
        }
        callback(userRole);
      })
      .catch((err) => {
        this.ErrorHandling(err, callback);
      });
  }
}

module.exports = UserRoleDao;
