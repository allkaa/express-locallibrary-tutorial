'use strict';
/*
var Book = require('../models/book');

exports.index = function(req, res) {
    res.send('NOT IMPLEMENTED: Site Home Page');
};
*/

var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.test = function(req, res) {
    res.send('NOT IMPLEMENTED: Book list');
};


exports.index = function(req, res) {   
    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books.
/* default
exports.book_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Book list');
};
*/

// Find all models Book as Array of models wth all properties.
exports.book_list = function(req, res, next) {
    Book.find() // Find all models Book as Array of models wth all properties.
    //Book.find({}, 'title author') // same as above line.
      .populate('author') // populate author_ID with author info.
      .exec(function (err, list_books) { // execure and then call callback function(err, result) where result as list_books will be Array of models Book wth all properties.
        if (err) { return next(err); }
        //Successful, so render result.
        res.render('book_list', { title: 'Book List', book_list: list_books }); // book_list.pug will be used with params title: and book_list as list_books Array of models Book wth all properties.
      });
      
  };

/*
// Display detail page for a specific book.
exports.book_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};
*/

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id) // find model Book with specific id if any.
              .populate('author') // populate with model author info.
              .populate('genre') // populate with model genre info.
              .exec(callback);
        },
        book_instance: function(callback) {
          // find model bookInstance where property book = req.params.id that got thru router.get('/book/:id', book_controller.book_detail);
          BookInstance.find({ 'book': req.params.id })
          .exec(callback);
        },
    }, function(err, results) { // callback function will be called after all parallel functions (book: and bool_instance) completes async
        // results will be Object with properties e.g. { book_instance: Array(2) [model, model], book: model }
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance } );
    });
};

/* Default
// Display book create form on GET.
exports.book_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};
*/

// Display book create form on GET.
exports.book_create_get = function(req, res, next) { 
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
};

/*
// Handle book create on POST.
exports.book_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};
*/

// Handle book create on POST.
exports.book_create_post = [
    // 1. Convert the genre to an array. If no genres selected req.body.genre will be undefinded.
    (req, res, next) => {
        // The instanceof operator tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object.
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next(); // goto next step 2.
    },

    // 0. Validate fields subs - are activated at initial starting of server.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),
  
    // 0. Sanitize ALL fields (using wildcard). This subs are activated at initial starting of server.
    sanitizeBody('*').trim().escape(),

    // 2. Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres in non-saved book (model Book) as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        // Current genre is selected. Add "checked" property for later rendering in book_form.pug
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
                //res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres }); - for GET request without book: and errors:
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];


// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};