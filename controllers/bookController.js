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
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres }); // no book at all.
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
            author: req.body.author, // book.author is ObjectID object.
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

/*
// Display book delete form on GET.
exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};
*/

// Display book delete form on GET.
//router.get('/book/:id/delete', book_controller.book_delete_get);
exports.book_delete_get = function(req, res) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).exec(callback)
        },
        book_bookinstances: function(callback) {
          BookInstance.find({ 'book': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/catalog/books');
        }
        // Successful, so render.
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_bookinstances: results.book_bookinstances } );
    });
};

// Handle book delete on POST.
//router.post('/book/:id/delete', book_controller.book_delete_post);
exports.book_delete_post = function(req, res) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.body.bookid).exec(callback) // find model Book by id got thru input#bookid.form-control(type='hidden', name='bookid', required='true', value=book._id)
        },
        book_bookinstances: function(callback) {
            BookInstance.find({ 'book': req.body.bookid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.book_bookinstances.length > 0) {
            // Book has booksinstances. Render in same way as for GET route.
            res.render('book_delete', { title: 'Delete Book', book: results.book, book_bookinstances: results.book_bookinstances } );
            return;
        }
        else {
            // Genre has no books. Delete object and redirect to the list of authors.
            Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/books')
            })
        }
    });
};

/*
// Display book update form on GET.
exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

// Handle book update on POST.
exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};
*/

// Display book update form on GET.
//router.get('/book/:id/update', book_controller.book_update_get);
exports.book_update_get = function(req, res, next) {
    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback); // all models Author.
        },
        genres: function(callback) {
            Genre.find(callback); // all models Genre.
        }},
        function(err, results, next) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected in book found genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true'; // add property .checked='true'
                    }
                }
            }
            res.render('book_form', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book }); //  book.author is an model Author object thru population.
        }
    );
};

// Handle book update on POST.
//router.post('/book/:id/update', book_controller.book_update_post);
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author, // book.author is ObjectID object.
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre
            //_id:req.params.id // NB! This is required, or a new ID will be assigned!
           });
        book._id = req.params.id  // NB! This is required, or a new ID will be assigned!

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback); // all models Author.
                },
                genres: function(callback) {
                    Genre.find(callback); // all models Genre.
                },
            }, function(err, results) {
                if (err) { return next(err); }
                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true'; // add property .checked='true'
                    }
                }
                res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() }); //book.author is ObjectID object.
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) { // book.author is ObjectID object.
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(thebook.url);
            });
        }
    }
];
