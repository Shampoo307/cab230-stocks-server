var express = require('express');
const mysql = require('mysql');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get("/stocks", function(req, res, next) {
	// res.render('index', {title: "The /stocks/ route"});
	
	req.db.from('stocks').distinct('name', 'symbol', 'industry')
		.then((rows) => {
			res.json({"Error" : false, "Message" : "Success", "Stocks" : rows})
		})
		.catch((err) => {
			console.log(err);
			res.json({"Error" : true, "Message" : "Error in MySQL Query"})
		});


});

router.get("/stocks/symbols", function(req, res, next) {
	// parse request - filter & add selection to sql query
	// if request == /stocks/symbols ..........
	// if request == /stocks/_____ then () => {}
	res.render('index', {title: "The /stocks/symbols route"});
});

router.get("/stocks/authed/", function(req, res, next) {
	res.render('index', {title: "The /stocks/authed/ route"});
});

// router.get("/")
module.exports = router;
