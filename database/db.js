const mysql = require('mysql');

const connection = mysql.createConnection({
	host		: 'localhost',
	user		: 'root',
	password	: 'Grimaldus40k',
	database	: 'stocks'
});

connection.connect(function(err) {
	if (err) throw err;
});

module.exports = (req, res, next) => {
	req.db = connection;
	next();
}