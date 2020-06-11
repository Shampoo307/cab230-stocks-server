var express = require('express');
const mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get("/stocks/symbols", function(req, res, next) {
	// If industry query supplied, select one entry for each distinct
	// where industry == industry
	if (req.query.industry) {
		req.db.from('stocks').distinct('name', 'symbol', 'industry')
			.where('industry', '=', req.query.industry)
			.then((rows) => {
				res.json({"Error" : false, "Message" : "Success", "Stocks" : rows})
			})
			.catch((err) => {
				res.json({"Error" : true, "Message" : "Error executing MySQL Query"})
			});
	}
	// Else if no query supplied, return one entry for each distinct name, symbol, and industry
	else {
		req.db.from('stocks').distinct('name', 'symbol', 'industry')
			.then((rows) => {
				res.json({"Error" : false, "Message" : "Success", "Stocks" : rows})
			})
			.catch((err) => {
				res.json({"Error" : true, "Message" : "Error executing MySQL Query"})
			});
	}
	
});

router.get("/stocks/authed/", function(req, res, next) {
	res.render('index', {title: "The /stocks/authed/ route"});
});

router.get("/stocks/:StockSymbol", function(req, res, next) {	// MUST HAVE STOCK SYMBOL OR ERROR
	// RETURNS SINGLE STOCK FROM LATEST TIMESTAMP
	req.db.from('stocks').select('*').where('Symbol', '=', req.params.StockSymbol)
		.where('timestamp', '=',
			req.db.from('stocks').where('Symbol', '=', req.params.StockSymbol)
				.max('timestamp'))
		.then((rows) => {
			res.json({"Error" : false, "Message" : "Success", "Stocks" : rows})
		})
		.catch((err) => {
			res.json({"Error" : true, "Message" : "Error executing MySQL Query"})
		});
});

// router.get("/")
module.exports = router;
