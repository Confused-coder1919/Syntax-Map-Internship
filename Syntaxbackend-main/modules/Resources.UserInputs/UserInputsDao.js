// UserInputDao
const pool = require("../../config/db_connect");
const UserInput = require("./UserInputs");
const InterfaceDao = require("../InterfaceDao");
const getSyntaxe = require("../../parser/syntaxePostgres");
const { v4: uuidv4 } = require("uuid");

class UserInputDao extends InterfaceDao {
  constructor() {
    super();
  }

  INSERT(userInput, callback) {
    const inputId = uuidv4();
    console.log(userInput, "Getting here");
    const values = [
      inputId,
      userInput.tense_id,
      userInput.user_id,
      getSyntaxe(userInput.user_example),
      userInput.evaluation,
    ];
    const qtext = `INSERT INTO user_inputs_table(id, tense_id, user_id, user_example, evaluation) VALUES (${this.dv(
      values[0]
    )}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(
      values[3]
    )}, ${this.dv(values[4])}) RETURNING *`;
    pool
      .query(qtext)
      .then((res) => {
        console.log(res);
        userInput.id = inputId;
        callback(userInput);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  UPDATE(userInput, callback) {
    const values = [
      userInput.id,
      userInput.tense_id,
      userInput.user_id,
      getSyntaxe(userInput.user_example),
      userInput.evaluation,
    ];
    const qtext = `UPDATE user_inputs_table SET tense_id = ${this.dv(
      values[1]
    )}, user_id = ${this.dv(values[2])}, user_example = ${this.dv(
      values[3]
    )}, evaluation = ${this.dv(
      values[4]
    )}, updated_at = NOW() WHERE id = ${this.dv(values[0])}`;
    pool
      .query(qtext)
      .then((res) => callback(userInput))
      .catch((err) => this.ErrorHandling(err, callback));
  }

  SELECT(criteria, callback) {
    let qtext = `SELECT * FROM user_inputs_table`;

    if (criteria.tense_id)
      qtext = this.actq(qtext, "tense_id", criteria.tense_id);
    if (criteria.user_id) qtext = this.actq(qtext, "user_id", criteria.user_id);

    pool
      .query(qtext)
      .then((res) => {
        callback(res.rows);
      })
      .catch((err) => this.ErrorHandling(err, callback));
  }

  DELETE(userInput, callback) {
    const qtext = `DELETE FROM user_inputs_table WHERE id = $1`;
    const values = [userInput.id];
    pool
      .query(qtext, values)
      .then((res) => callback(res))
      .catch((err) => this.ErrorHandling(err, callback));
  }
}

module.exports = UserInputDao;
