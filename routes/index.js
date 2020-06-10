var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get("/stocks", function(req, res, next) {
	res.render('index', {title: "The /stocks/ route"});
});

router.get("/stocks/symbols", function(req, res, next) {
	res.render('index', {title: "The /stocks/symbols route"});
});

router.get("/stocks/authed/", function(req, res, next) {
	res.render('index', {title: "The /stocks/authed/ route"});
});

// router.get("/")
module.exports = router;
