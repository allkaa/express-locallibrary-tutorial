'use strict';

var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Default
// Display list of all Genre.
exports.genre_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre list');
};
*/

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find() // find all models Genre with all properties.
      //.sort([['family_name', 'ascending']])
      .exec(function (err, list_genres) {
        if (err) { return next(err); }
        // Successful, so render result array list_genres with models Genre found.
        res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
      });
};

/*
// Display detail page for a specific Genre.
exports.genre_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
};
*/

// Display detail page for a specific Genre.
// The ID of the required genre record is encoded at the end of the URL and extracted automatically based on the route definition in routes catalog.js (/genre/:id) e.g.:
// // GET request for one Genre.
// router.get('/genre/:id', genre_controller.genre_detail);
// Below req param is Node IncommingMessage, req.params is Object {id: "5beea91b8cfe0caf73ba65a3"}, req.params.id is "5beea91b8cfe0caf73ba65a3"
/*
You might get an error similar to this:
Cast to ObjectId failed for value " 5beea91b8cfe0caf73ba65a3" at path "_id" for model "Genre"
This is a mongoose error coming from the req.params.id. To solve this problem, first you need to require mongoose on the genreController.js page like this:
var mongoose = require('mongoose');
Then use mongoose.Types.ObjectId() to convert the id to a that can be used. For example:
exports.genre_detail = function(req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);  
    ...
*/
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id) // find genre by id.
              .exec(callback);
        },
        genre_books: function(callback) {
          Book.find({ 'genre': req.params.id }) // find all models Book with genre id.
          .exec(callback);
        },
    }, function(err, results) {  // callback function will be called thry callback param in exec after async genre and genre_books are done.
        if (err) { return next(err); }
        // results is object with two properties: model Genre and array of models Book.
        if (results.genre==null) { // No results = not found genre.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};

/*
// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre create GET');
};
*/

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {     
    res.render('genre_form', { title: 'Create Genre' });
  };

/*
// Handle Genre create on POST.
exports.genre_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre create POST');
};
*/

// Handle Genre create on POST.
exports.genre_create_post =  [
   
    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a genre object with escaped and trimmed data.
      var genre = new Genre(
        { name: req.body.name }
      );
  
      if (!errors.isEmpty()) {
        // There are errors. Render the form again with sanitized values/error messages.
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        // e.g. errors.array() -> Array(1) [Object] -> Array()[0] [Object] -> Object {location: "body", param: "name", value: "", msg: "Genre name required"}
      return;
      }
      else {
        // Data from form is valid.
        // Check if Genre with same name already exists.
        Genre.findOne({ 'name': req.body.name })
          .exec( function(err, found_genre) {
             if (err) { return next(err); }
             if (found_genre) {
               // Genre exists, redirect to its detail page.
               res.redirect(found_genre.url);
             }
             else {
               genre.save(function (err) {
                 if (err) { return next(err); }
                 // Genre saved. Redirect to genre detail page.
                 res.redirect(genre.url);
               });
             }
           });
      }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};