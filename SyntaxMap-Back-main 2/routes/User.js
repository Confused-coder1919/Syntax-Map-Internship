require('dotenv').config()

const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db_connect.js');

//Get all users
router.get('/user', (req, res) =>{
	pool.query('select * from user_table')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Get a user from its name
router.get('/user/:name', (req, res) =>{
	pool.query('select * from user_table where user_name = \'' + req.params.name + '\'')
	.then(result => {
		console.log(result.rows);
		res.send(result.rows);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Connect to the app
router.post('/user/login', (req, res) =>{

	pool.query('select * from user_table where user_email_address = \'' + req.body.email + '\'')
	.then(result => {
		if (result.rows.length) {
			var hash = result.rows[0].user_password;
			var user = {
				user_name: result.rows[0].user_name,
				user_email_address: result.rows[0].user_email_address
			};
			bcrypt.compare(req.body.password, hash).then(function(result) {
				//add jstoken to the db
				if (result){
					var jstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expireIn:'3600s'});
					var rtoken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expireIn:'7200s'});
					/*pool.query('update user_table set user_jstoken = \'' + jstoken + '\', user_jstoken_refresh = \'' + rtoken +'\' where user_email_address = \'' + user.user_email_address + '\'');
					.then(resultat => {
						var ans = {
							jstoken: jstoken,
							rtoken: rtoken
						};
						res.send(ans);
					});*/
				}
				else {
					res.send({err:"Email or password wrong"});
				}
			});
		}
		else
			res.send({err:"Email or password wrong"});
	})
	.catch(err => {
		console.log(err);
	});
});

//Create a User
router.post('/user', (req, res) =>{
	//hash password
	bcrypt.hash(req.body.user_password, 10, function(err, hash) {
		//request sql
		pool.query('insert into user_table values (\'' + req.body.user_email_address + '\',\'' + hash + '\',DEFAULT,\'' + req.body.user_name + '\')')
		.then(result => {
			console.log(result);
			//nodemail ou sendgrid

			res.send(result);
		})
		.catch(err => {
			console.log(err);
			//callback(null);
		});
	});
});

//Modify a user from its id
router.put('/user/:id', (req, res)=>{
	pool.query('update user_table set user_name = \'' + req.body.user_name + '\',	user_gender = \'' + req.body.user_gender + '\', user_address = \'' + req.body.user_address + '\', user_password = \'' + req.body.user_password + '\', user_mobile_no = \'' + req.body.user_mobile_no + '\', user_email_address = \'' + req.body.user_email_address + '\', user_email_verified = \'' + req.body.user_email_verified + '\', user_verification_code = \'' + req.body.user_verification_code + '\', user_jstoken = \'' + req.body.user_jstoken + '\', user_jstoken_refresh =\'' + req.body.user_jstoken_refresh + '\', user_role = ' + req.body.user_role + ' where user_id = ' + req.params.id)
	.then(result => {
		console.log(result);
		res.send(result);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

//Delete a User from its id
router.delete('/user/:id', (req, res)=>{
	pool.query('delete from user_table where user_id = ' + req.params.id)
	.then(result => {
		console.log(result);
		res.send(result);
	})
	.catch(err => {
		console.log(err);
		//callback(null);
	});
});

module.exports = router