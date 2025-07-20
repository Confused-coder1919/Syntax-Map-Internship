// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const Classe = require('./Classe.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class ClasseDao extends InterfaceDao {

	constructor () {
		super()
	}

	// NOTEPAD DAO : Public methods

	INSERT (classe, callback) {
		console.log('NOTEPAD_DAO')
		const classeId = "DEFAULT";//uuidv4()
		const values = [classeId, getSyntaxe(classe.classe_name), classe.professor_id, classe.students_id];
		const qtext = `INSERT INTO classe_table(classe_id, classe_name, professor_id, students_id) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				classe.classe_id = classeId;
				callback(classe);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (classe, callback) {
		const classeId = classe.classe_id;
		const values = [classeId, getSyntaxe(classe.classe_name), classe.professor_id,classe.students_id];
		const qtext = `UPDATE classe_table SET classe_name = ${this.dv(values[1])}, professor_id = ${this.dv(values[2])}, students_id = ${this.dv(values[3])} WHERE classe_id = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': classeId
					}, callback);
				callback(classe);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT classe_table.classe_id as classe_id, classe_table.classe_name as classe_name, classe_table.professor_id as professor_id, classe_table.students_id as students_id FROM classe_table '; // INNER JOIN HAS_RIGHT ON classe_table.classe_id = has_right.classe_id INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.professor_id)
			qtext = this.actq(qtext, 'professor_id', criteria.professor_id);
		qtext = qtext + " ORDER BY students_id ASC";
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let dictionnaries = [];
				res.rows.forEach(item =>
					dictionnaries.push(new Classe(null, item, null))
				)
				//console.log(res.rows);
				callback(dictionnaries);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (classe, callback) {
		const qtext = 'DELETE FROM classe_table WHERE classe_id = $1';
		const classeId = classe.classe_id;
		const values = [classeId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': classeId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// NOTEPAD DAO : private methods

}

module.exports = ClasseDao;