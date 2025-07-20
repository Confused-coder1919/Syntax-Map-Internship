// import postgresql client -> 'pool'
const pool = require('../../config/db_connect');

//import uuid module
const { v4: uuidv4 } = require('uuid');

// import user ressources
const UserUpload = require('./UserUpload.js');

//import Interface Dao
const InterfaceDao = require('../InterfaceDao.js')

// import syntaxe
const getSyntaxe = require("../../parser/syntaxePostgres.js")

class UserUploadDao extends InterfaceDao {

	constructor () {
		super()
	}

	// USER UPLOAD DAO : Public methods

	INSERT (upload, callback) {
		console.log('USER_UPLOAD_DAO')
		console.log(upload.user_id);
		const uploadId = "DEFAULT";//uuidv4()
		const values = [uploadId, getSyntaxe(upload.sentence), upload.img, upload.user_id, upload.course_id];
		const qtext = `INSERT INTO user_upload(id_upload, sentence, image_path, user_id, course_id) VALUES (${this.dv(values[0])}, ${this.dv(values[1])}, ${this.dv(values[2])}, ${this.dv(values[3])}, ${this.dv(values[4])})`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				upload.upload_id = uploadId;
				callback(upload);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//callback(null);
			});
	}

	UPDATE (upload, callback) {
		const uploadId = upload.upload_id;
		const values = [uploadId, getSyntaxe(upload.sentence), upload.img, upload.user_id, upload.course_id];
		const qtext = `UPDATE user_upload SET sentence = ${this.dv(values[1])}, image_path = ${this.dv(values[2])}, user_id = ${this.dv(values[3])}, course_id = ${this.dv(values[4])} WHERE id_upload = ${this.dv(values[0])}`;
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				console.log(res);
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': uploadId
					}, callback);
				callback(upload);
			})
			.catch(err => {
				this.ErrorHandling(err, callback);
				//console.log(err);
				//callback(null);
			});
	}

	SELECT (criteria, callback) {
		let qtext = 'SELECT user_upload.id_upload as id_upload, user_upload.sentence as sentence, user_upload.image_path as img, user_upload.course_id as course_id, user_upload.user_id as user_id FROM user_upload'; // INNER JOIN HAS_RIGHT ON user_upload.id_upload = has_right.id_upload INNER JOIN DBAUTHORIZATION ON has_right.authorizationId = dbauthorization.authorizationId
		if (criteria.sentence)
			qtext = this.actq(qtext, 'sentence', criteria.sentence);
		/*if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id);*/
		if (criteria.img)
			qtext = this.actq(qtext, 'image_path', criteria.img);
		if (criteria.course_id)
			qtext = this.actq(qtext, 'course_id', criteria.course_id);
		if (criteria.user_id)
			qtext = this.actq(qtext, 'user_id', criteria.user_id.toString());
		console.log(qtext)
		pool.query(qtext)
			.then(res => {
				let uploads = [];
				res.rows.forEach(item =>
					uploads.push(new UserUpload(null, item, null))
				)
				//console.log(res.rows);
				callback(uploads);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	DELETE (upload, callback) {
		const qtext = 'DELETE FROM user_upload WHERE id_upload = $1';
		const uploadId = upload.upload_id;
		const values = [uploadId];
		console.log(values);
		pool.query(qtext, values)
			.then(res => {
				if (res.rowCount === 0)
					this.ErrorHandling({
						'code': '_1',
						'id': uploadId
					}, callback);
				callback(res);
			})
			.catch(err => {
				//console.log(err);
				//callback(null);
				this.ErrorHandling(err, callback);
			});
	}

	// USER UPLOAD DAO : private methods

}

module.exports = UserUploadDao;
