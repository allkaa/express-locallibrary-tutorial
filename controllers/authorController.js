'use strict';
var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');

/* Default
// Display list of all Authors.
exports.author_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Author list');
};
*/

// Display list of all Authors.
exports.author_list = function(req, res, next) {
    Author.find() // find all models Author with all properties.
      .sort([['family_name', 'ascending']])
      .exec(function (err, list_authors) {
        if (err) { return next(err); }
        // Successful, so render result array list_authors with models Author found.
        res.render('author_list', { title: 'Author List', author_list: list_authors });
      });
};

/* Default
// Display detail page for a specific Author.
exports.author_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Author detail: ' + req.params.id);
};
*/

// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id) // find model Author for specific author id got thru router.get('/author/:id', author_controller.author_detail);
              .exec(callback)
        },
        authors_books: function(callback) {
          Book.find({ 'author': req.params.id },'title summary') // find all models Book having specific author id.
          .exec(callback)
        },
    }, function(err, results) { // callback function will be called after all parallel functions (author: and authors_book) completes async
        if (err) { return next(err); } // Error in API usage.
        if (results.author==null) { // No results.
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        // //results will be Object with properties e.g. { authors_books: Array(2) [model, model], author: model }
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create GET');
};

// Handle Author create on POST.
exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};

// Display Author delete form on GET.
exports.author_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST');
};