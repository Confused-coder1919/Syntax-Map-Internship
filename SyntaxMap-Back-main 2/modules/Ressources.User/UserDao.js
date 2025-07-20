// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const User = require('./User.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

class UserDao extends InterfaceDao {

	constructor () {
		super()
	}

	// USER DAO : Public methods

	INSERT (user, callback) {
		console.log('USER_DAO')
		const userId = "DEFAULT";//uuidv4()
		const values = [userId, user.user_name, user.user_email_address, 3];
		const qtext = `INSERT INTO user_table(user_id, user_name, user_email_address, user_role) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				user.user_id = userId;
				callback(user);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (user, callback) {
		const userId = user.user_id;
		const values = [userId, user.user_name, user.user_email_address, user.user_password, user.user_gender, user.last_session];
		const qtext = `UPDATE user_table SET user_name = ${this.dv(values[1])}, user_email_address = ${this.dv(values[2])}, user_password = ${this.dv(values[3])}, user_gender = ${this.dv(values[4])}, last_session = ${this.dv(values[5])} WHERE user_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': userId
					}, callback);
				callback(user);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	UPDATE_password (user, callback) {
		const values = [user.user_email_address, user.user_password];
		const qtext = `UPDATE user_table SET user_password = ${this.dv(values[1])}, user_email_verified = true WHERE user_email_address = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_3',
						'email': user.user_email_address
					}, callback);
				callback(user);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}
	
	UPDATE_last_session (user, callback) {
		const userId = user.user_id;
		const values = [userId, user.last_session];
		const qtext = `UPDATE user_table SET last_report = ${this.dv(values[1])} WHERE user_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': userId
					}, callback);
				callback(user);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}
	/*UPDATE_right (user, callback) {
		const userId = user.user_id;
		const values = [userId, user.user_role];
		const qtext = `WITH a AS (SELECT authorizationId FROM DBAUTHORIZATION WHERE name = ${this.dv(values[1])})`
		+ `\nUPDATE HAS_RIGHT SET authorizationId = (select authorizationId from a) WHERE has_right.user_id = ${this.dv(values[0])}`;
		//console.log(values);
		pool.query(qtext)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': userId
					}, callback);
				callback(user);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}*/

	SELECT (criteria, callback) {
		let qtext = 'SELECT user_table.user_id as user_id, user_table.user_name as user_name, user_table.user_email_address as user_email_address, user_table.user_gender as user_gender, user_table.user_role as user_role, user_table.user_password as user_password, user_table.last_report as last_session FROM user_table'; // INNER JOIN HAS_RIGHT ON user_table.user_id = has_right.user_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.user_name)
			qtext = this.actq(qtext, 'user_name', criteria.user_name);
		if (criteria.userId)
			qtext = this.actq(qtext, 'user_id', criteria.userId, 'user_table.user_id');
		if (criteria.user_email_address)
			qtext = this.actq(qtext, 'user_email_address', criteria.user_email_address);
		if (criteria.user_gender)
			qtext = this.actq(qtext, 'user_gender', criteria.user_gender);
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let users = [];
				res.rows.forEach(item =>
					users.push(new User(null, item, null))
				)
				//console.log(res.rows);
				callback(users);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (user, callback) {
		const qtext = 'DELETE FROM user_table WHERE user_id = $1';
		const userId = user.user_id;
		const values = [userId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': userId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// USER DAO : private methods

}

module.exports = UserDao;
