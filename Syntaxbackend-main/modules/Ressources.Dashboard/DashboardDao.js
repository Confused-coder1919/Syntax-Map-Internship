// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const Dashboard = require('./Dashboard.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class DashboardDao extends InterfaceDao {

	constructor () {
		super()
	}

	// DASHBOARD DAO : Public methods

	INSERT (dashboard, callback) {
		console.log('DICTIONNARY_DAO')
		const resultId = "DEFAULT";//uuidv4()
		const values = [resultId, dashboard.total_question, dashboard.nb_good, dashboard.time_remaining, dashboard.time_per_question, dashboard.user_id, dashboard.course_id, dashboard.session_name];
		const qtext = `INSERT INTO resultat_batch(result_id, total_question, nb_good, time_remaining, time_per_question, user_id, course_id, session_name) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])}, ${this.dv(values[4])}, ${this.dv(values[5])}, ${this.dv(values[6])}, ${this.dv(values[7])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				dashboard.result_id = resultId;
				callback(dashboard);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (dashboard, callback) {
		const resultId = dashboard.result_id;
		const values = [resultId, dashboard.total_question, dashboard.nb_good, dashboard.time_remaining, dashboard.time_per_question, dashboard.user_id, dashboard.course_id];
		const qtext = `UPDATE resultat_batch SET total_question = ${this.dv(values[1])}, nb_good = ${this.dv(values[2])}, time_remaining = ${this.dv(values[3])}, time_per_question = ${this.dv(values[4])}, user_id = ${this.dv(values[5])}, course_id = ${this.dv(values[6])} WHERE result_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': resultId
					}, callback);
				callback(dashboard);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT resultat_batch.result_id as result_id, resultat_batch.total_question as total_question, resultat_batch.user_id as user_id, resultat_batch.course_id as course_id, resultat_batch.session_name as session_name, resultat_batch.nb_good as nb_good, resultat_batch.time_remaining as time_remaining, resultat_batch.time_per_question as time_per_question FROM resultat_batch'; // INNER JOIN HAS_RIGHT ON resultat_batch.result_id = has_right.result_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id);
		if (criteria.result_id)
			qtext = this.actq(qtext, 'result_id', criteria.result_id);
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let dashboards = [];
				res.rows.forEach(item =>
					dashboards.push(new Dashboard(null, item, null))
				)
				//console.log(res.rows);
				callback(dashboards);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (dashboard, callback) {
		const qtext = 'DELETE FROM resultat_batch WHERE result_id = $1';
		const resultId = dashboard.result_id;
		const values = [resultId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': resultId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// DASHBOARD DAO : private methods

}

module.exports = DashboardDao;