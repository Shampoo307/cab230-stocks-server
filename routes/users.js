const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

router.post('/register', function(req, res, next) {
	const email = req.body.email;
	const password = req.body.password;
	
	// Verify body
	if (!email || !password) {
		res.status(400).json({
			error: true,
			message: `Request body incomplete - email and password needed`
		});
		return;
	}
	
	const queryUsers = req.db.from('users').select('*').where('email', '=', email);
	queryUsers
		.then((users) => {
			// User exists in database
			if (users.length > 0) {
				throw new Error('error');
			}
			// Insert user into DB
			const saltRounds = 10;
			const hash = bcrypt.hashSync(password, saltRounds);
			return req.db.from('users').insert({email, hash});
		})
		.then(() => {
			res.status(201).json({ success: true, message: "User created" });
		})
		.catch(error => {
			res.status(409).json({
				error: true,
				message: "User already exists"
			});
		});
});

router.post('/login', function(req, res, next) {
	// Retrieve email and password from req.body
	const email = req.body.email;
	const password = req.body.password;
	
	// Verify body
	if (!email || !password) {
		res.status(400).json({
			error: true,
			message: "Request body incomplete - email and password needed"
		});
		return;
	}
	
	// Determine if user exists
	const queryUsers = req.db.from('users').select('*').where('email', '=', email);
	queryUsers
		.then((users) => {
			if (users.length === 0) {
				throw new Error('error');
			}
			
			const user = users[0];
			return bcrypt.compare(password, user.hash);
		})
		.then((match) => {
			if (!match) {
				throw new Error('error');
			}
			
			// Create and return JWT token
			const secretKey = "secret key";
			const expires_in = 60 * 60 * 24 // 1 Day
			const exp = Date.now() + expires_in + 1000;
			const token = jwt.sign({ email, exp }, secretKey);
			res.json({ token_type: "Bearer", token, expires_in });
		})
		.catch(err => {
			res.status(401).json({
				error: true,
				message: "Incorrect email or password"
			})
		});
});

module.exports = router;
