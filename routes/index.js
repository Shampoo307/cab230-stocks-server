const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'CAB230 Stocks Server Side',
			content: "This is the work of Thomas Crilly, n9960783. This is the base path of this Express based API. To see the docs, go to website:3001/" });
});

router.get("/symbols", function(req, res, next) {
	console.log(req.query);
	console.log(JSON.stringify(req.query));
	console.log(JSON.stringify(req.query) === '{}');
	// If no queries, return all
	if (JSON.stringify(req.query) === '{}') {
		req.db.from('stocks').distinct('name', 'symbol', 'industry')
			.then((rows) => {
				res.json(rows)
			})
			.catch((error) => {
				res.status(404).json({
					error : true,
					message : "Error executing MySQL Query"})
			});
		return;
	}
	
	// If query isn't 'industry, return error
	if (!req.query.industry) {
		res.status(400).json({ message : `Invalid query parameter: only 'industry' is permitted`});
		console.log(`empty object `, JSON.stringify(req.query))
		return;
	}
	
	const industryQuery = req.db.from('stocks').distinct('name', 'symbol', 'industry')
		.where('Industry', 'LIKE', '%' + req.query.industry + '%');
	
	industryQuery
		.then((stocks) => {
			if (stocks.length === 0) {
				throw new Error('error');
			}
			res.json(stocks);
		})
		.catch(error => {
			res.status(404).json({
				error : true,
				message : 'Industry sector not found'
			});
		});
});

const authorise = (req, res, next) => {
	const authorisation = req.headers.authorization
	let token = null;
	
	// Retrieve token
	if (authorisation && authorisation.split(" ").length === 2) {
		token = authorisation.split(" ")[1];
		console.log("Token: ", token);
	} else {
		res.status(403).json({
			error: true,
			message: "Authorisation header not found"
		});
		return;
	}
	
	// Verify JWT and check expiration date
	try {
		const decoded = jwt.verify(token, 'secret key');
		
		if (decoded.exp < Date.now()) {
			throw new Error('error');
		}
		
		// Permit user to advance to route
		next();
	} catch (err) {
		res.status(403).json({
			error: true,
			message: "Token is not valid"
		})
	}
	
}

router.get("/authed/:StockSymbol", authorise, function(req, res) {
	// If neither query present
	if (!req.query.from && !req.query.to) {
		req.db.from('stocks').select('*').where('Symbol', '=', req.params.StockSymbol)
			.then((rows) => {
				if (rows.length === 0) {
					throw new Error('error');
				}
				res.json(rows);
			})
			.catch(error => {
				res.status(400).json({
					error : true,
					message : "Stock symbol incorrect format - must be 1-5 capital letters"
				});
			});
	}
	// If from query present
	if (req.query.from && !req.query.to) {
		req.db.from('stocks').select('*').where('Symbol', '=', req.params.StockSymbol)
			.where('timestamp', '>=', req.query.from)
			.then((rows) => {
				if (rows.length === 0) {
					throw new Error('error');
				}
				res.json(rows);
			})
			.catch(error => {
				res.status(404).json({
					error : true,
					message : "No entries available for query symbol for supplied date range"
				});
			});
	}
	// If to query present
	if (!req.query.from && req.query.to) {
		req.db.from('stocks').select('*').where('Symbol', '=', req.params.StockSymbol)
			.where('timestamp', '<=', req.query.to)
			.then((rows) => {
				if (rows.length === 0) {
					throw new Error('error')
				}
				res.json(rows);
			})
			.catch(error => {
				res.status(404).json({
					error : true,
					message : "No entries available for query symbol for supplied date range"
				});
			});
	}
	// If both queries present
	if (req.query.from && req.query.to) {
		req.db.from('stocks').select('*').where('Symbol', '=', req.params.StockSymbol)
			.whereBetween('timestamp', [req.query.from, req.query.to])
			.then((rows) => {
				if (rows.length === 0) {
					throw new Error('error');
				}
				res.json(rows);
			})
			.catch(error => {
				res.status(404).json({
					error : true,
					message : "No entries available for query symbol for supplied date range"
				});
			});
	}
	else if (req.query !== '{}') {
		res.status(400).json({
			error : true,
			message : "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15"
		})
	}
	
});

router.get("/:StockSymbol", function(req, res, next) {	// MUST HAVE STOCK SYMBOL OR ERROR
	if (JSON.stringify(req.query) !== '{}') {
		res.status(400).json({
			error : true,
			message : "Date parameters only available on authenticated route /stocks/authed"
		});
		return;
	}
	
	const symbolQuery = req.db.from('stocks')
		.select('timestamp', 'symbol', 'name', 'industry', 'open', 'high', 'low', 'close', 'volumes')
		.where('Symbol', '=', req.params.StockSymbol)
		.where('timestamp', '=',
			req.db.from('stocks').where('Symbol', '=', req.params.StockSymbol)
				.max('timestamp'));
	symbolQuery
		.then((rows) => {
			if (rows.length === 0) {
				throw new Error('error');
			}
			res.json(rows[0]);
		})
		.catch((err) => {
			res.status(404).json({
				error : true,
				message : "No entry for symbol in stocks database"
			})
		});
});

module.exports = router;
