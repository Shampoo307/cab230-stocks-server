const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
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
	
	
	
	
	
	// If industry query supplied, select one entry for each distinct
	// where industry contains any of query.industry
	// if (req.query) {
	
	// console.log("query: ", JSON.stringify(req.query));
	// console.log("query.industry", req.query.values);
	// console.log("=== {} : ", JSON.stringify(req.query) === '{}')
		
		
		// Check that the query supplied is 'industry'
		// if (req.query !== null && req.query !== 'industry') {
		// 	// next(createError(400));
		// 	// res.json({"Error" : true, "Message" : "Invalid query parameter: only 'industry' is permitted"})
		//
		// } else {
		// Return all stocks
		
		
		
		
	
	
		// if (industryQuery) {
		// 	req.db.from('stocks').distinct('name', 'symbol', 'industry')
		// 		.where('industry', 'LIKE', '%' + req.query.industry + '%')
		// 		.then((rows) => {
		//
		// 			res.json({"Error" : false, "Message" : "Success", "Stocks" : rows})
		// 		})
		// 		.catch((err) => {
		// 			res.json({"Error" : true, "Message" : "Error executing MySQL Query"})
		// 		});
		// }
		// else {
		// 	res.status(400).json({ message : `Invalid query parameter: only 'industry' is permitted`});
		// 	console.log(`Error on request query: `, JSON.stringify(req.query))
		// }
		
	// }
	// Else if no query supplied, return one entry for each distinct name, symbol, and industry
	
		
	// }
	


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
// ?from=2020-03-15T00%3A00%3A00.000Z&to=2020-03-20T00%3A00%3A00.000Z

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
	
	
	
	// let MINDATE;
	// let MAXDATE;
	//
	// const minDate = req.db.from('stocks').select('timestamp')
	// 	.where('Symbol', '=', req.params.StockSymbol)
	// 	.where('timestamp', '=',
	// 		req.db.from('stocks')
	// 			.where('Symbol', '=', req.params.StockSymbol)
	// 			.min('timestamp')
	// 	);
	//
	// minDate.then((rows) => {
	// 	if (rows.length === 0) {
	// 		throw new Error('error');
	// 	}
	// 	MINDATE.json(rows[0]);
	// })
	//
	// const maxDate = req.db.from('stocks').select('timestamp')
	// 	.where('Symbol', '=', req.params.StockSymbol)
	// 	.where('timestamp', '=',
	// 		req.db.from('stocks')
	// 			.where('Symbol', '=', req.params.StockSymbol)
	// 			.max('timestamp')
	// 	);
	//
	// maxDate.then((rows) => {
	// 	if (rows.length === 0) {
	// 		throw new Error('error');
	// 	}
	// 	MAXDATE.json(rows);
	// })
	// console.log('min date: ', MINDATE);
	// console.log('max date: ', MAXDATE);
	//
	// let toQuery;
	// let fromQuery;
	
	// if (req.query.to) {
	// 	if (req.query.to > maxDate) {
	// 		res.status(404).json({
	// 			error : true,
	// 			message : "No entries available for query symbol for supplied date range"
	// 		});
	// 		return;
	// 	}
	// 	toQuery = req.query.to;
	// } else {
	// 	toQuery = maxDate;
	// }
	// if (req.query.from) {
	// 	if (req.query.from < minDate) {
	// 		res.status(404).json({
	// 			error : true,
	// 			message : "No entries available for query symbol for supplied date range"
	// 		});
	// 		return;
	// 	}
	// 	fromQuery = req.query.from;
	// } else {
	// 	fromQuery = minDate;
	// }
	
	// req.db.from('stocks').select('*')
	// 	.where('symbol', '=', req.params.StockSymbol)
	// 	.whereBetween('timestamp', [fromQuery, toQuery])
	// 	.then((rows) => {
	// 		if (rows.length === 0) {
	// 			throw new Error('error');
	// 		}
	// 		res.json(rows);
	// 	})
	// 	.catch(error => {
	// 		res.status(404).json({
	// 			error : true,
	// 			message : "No entries available for query symbol for supplied date range"
	// 		})
	// 	});
	
	// Check stock symbol is valid
	// let validStockSymbol;
	// req.db.from('stocks').distinct('symbol')
	// 	.where('Symbol', '=', req.params.StockSymbol)
	// 	.then((rows) => {
	// 		if (rows.length === 0) {
	// 			throw new Error('error');
	// 		}
	// 		validStockSymbol = true;
	// 	})
	// 	.catch((err) => {
	// 		res.status(404).json({
	// 			error : true,
	// 			message : "Stock symbol incorrect format - must be 1-5 capital letters"
	// 		})
	// 	});
	// if (!validStockSymbol) {
	// 	return;
	// }
	
	// if (JSON.stringify(req.query) !== '{}') {
	// 		res.status(400).json({
	// 			error : true,
	// 			message : "Date parameters only available on authenticated route /stocks/authed"
	// 		});
	// 		return;
	// 	}
	
	
	
	
	// console.log(req.query);
	// console.log(req.query.from);
	// console.log(req.query.to);
	// console.log(JSON.stringify(req.query));
	// const fromQuery = req.query.from;
	// const toQuery = req.query.to;
	// console.log(fromQuery);
	// console.log(toQuery);
	//
	//
	//
	// const queries = JSON.stringify(req.query);
	//
	// // If no queries supplied, only stock symbol
	// if (queries === '{}') {
	// 	const symbolQuery = req.db.from('stocks').select('*')
	// 		.where('Symbol', '=', req.params.StockSymbol);
	//
	// 	symbolQuery
	// 		.then((rows) => {
	// 			if (rows.length === 0) {
	// 				throw new Error('error');
	// 			}
	// 			res.json(rows[0]);
	// 		})
	// 		.catch((err) => {
	// 			res.status(400).json({
	// 				error : true,
	// 				message : "Stock symbol incorrect format - must be 1-5 capital letters"
	// 			})
	// 		});
	// } else {
	// 	// Assign queries to vars
	// 	// const fromQuery = req.query.from;
	// 	// const toQuery = req.query.to;
	// 	// console.log('fromquery: ', fromQuery);
	// 	// console.log('toQuery: ', toQuery);
	//
	
	//
	// 	let fromFinal;
	// 	let toFinal;
	//
	// 	if (fromQuery < minDate || toQuery > maxDate) {
	// 		res.status(404).json({
	// 			error : true,
	// 			message : "No entries available for query symbol for supplied date range"
	// 		});
	// 		return;
	// 	}
	// 	if (fromQuery !== undefined) {
	// 		fromFinal = fromQuery;
	// 	} else {
	// 		fromFinal = minDate;
	// 	}
	// 	if (toQuery !== undefined) {
	// 		toFinal = toQuery;
	// 	} else {
	// 		toFinal = maxDate;
	// 	}
	//
	//
	// 	req.db.from('stocks').select('*').where('Symbol', '=', req.params.StockSymbol)
	// 		.havingBetween('timestamp', [fromFinal, toFinal])
	// 		.then((rows) => {
	// 			res.json(rows)
	// 		})
	// 		.catch((err) => {
	// 			res.status(400).json({
	// 				error : true,
	// 				message : "Error in last query"
	// 			})
	// 		});
	// }

		// Grab oldest and most recent date values
		// let minDate;
		// req.db.from('stocks')
		// 	.select('timestamp')
		// 	.where('Symbol', '=', req.params.StockSymbol)
		// 	.where('timestamp', '=',
		// 		req.db.from('stocks').where('Symbol', '=', req.params.StockSymbol)
		// 			.min('timestamp'))
		// 	.then((row) => minDate = JSON.stringify(row))
		// ;
		// let maxDate;
		// req.db.from('stocks')
		// 	.select('timestamp')
		// 	.where('Symbol', '=', req.params.StockSymbol)
		// 	.where('timestamp', '=',
		// 		req.db.from('stocks').where('Symbol', '=', req.params.StockSymbol)
		// 			.max('timestamp'))
		// 	.then((row) => maxDate = JSON.stringify(row))
		// ;

		// console.log('min date', minDate);
		// console.log('date given', fromQuery);
		// console.log('max date', maxDate);
		// console.log('date given', toQuery);
		// console.log('fromDate compare', fromQuery < minDate);
		// console.log('toDate compare: ', toQuery > maxDate);
		
		// Check dates
		// if (fromQuery < minDate || toQuery > maxDate ) {
		// 	res.status(404).json({
		// 		error : true,
		// 		message : "No entries available for query symbol for supplied date range"
		// 	});
		// 	return;
		// }
		// if (toQuery !== undefined && toQuery < minDate ) {
		// 	res.status(404).json({
		// 		error : true,
		// 		message : "No entries available for query symbol for supplied date range"
		// 	});
		// 	return;
		// }
		// { from: '2020-03-15T00:00:00.000Z', to: '2020-03-20T00:00:00.000Z' }
		// Vars to assign query values to depending on what was supplied
		// let fromFinal;
		// let toFinal;
		//
		// if (true) {
		// 	fromFinal = fromQuery;
		// } else {
		// 	fromFinal = minDate;
		// }
		//
		// if (toQuery !== undefined) {
		// 	toFinal = toQuery;
		// } else {
		// 	toFinal = maxDate;
		// }
		
		//
		// // Return range starting at From Query
		// if (fromQuery !== undefined && toQuery === undefined) {
		// 	fromFinal = fromQuery;
		// 	toFinal = maxDate;
		// }
		// // Return range until To Query
		// if (toQuery !== undefined && fromQuery === undefined) {
		// 	fromFinal = minDate;
		// 	toFinal = toQuery;
		// }
		// // Return two query range
		// if (fromQuery !== undefined && toQuery !== undefined) {
		// 	fromFinal = fromQuery;
		// 	toFinal = toQuery;
		// }
		
	
	
	

router.get("/:StockSymbol", function(req, res, next) {	// MUST HAVE STOCK SYMBOL OR ERROR
	if (JSON.stringify(req.query) !== '{}') {
		res.status(400).json({
			error : true,
			message : "Date parameters only available on authenticated route /stocks/authed"
		});
		return;
	}
	// if (JSON.stringify(req.params.StockSymbol) === '{}') {
	// 	res.status(404).json({
	// 		error : true,
	// 		message : 'No entry for symbol in stocks database'
	// 	});
	// 	return;
	// }
	
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

// router.get("/")
module.exports = router;
