'use strict';
var express = require('express');
var router = express.Router();

// Require controller modules.
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookinstanceController');

/// TEST ROUTES ///

// GET test home page.
router.get('/', test.index);

/*
// GET users listing.
router.get('/', function(req, res, next) {
  res.send('GET request');
//router.get('/cool', function(req, res, next) {
  //  res.send("You're so cool");
});

// POST user listening. For test use e.g.:
// curl -d "post test" localhost:3000/users
router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express route for user POST' });
});
*/

module.exports = router;
