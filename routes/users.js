var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express route for user GET' });
//router.get('/cool', function(req, res, next) {
  //  res.send("You're so cool");
});

// POST user listening. For test use e.g.:
// curl -d "post test" localhost:3000/users
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express route for user POST' });
});

module.exports = router;
