'use strict';
var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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
        // //results will be Object with properties e.g. { author: model, authors_books: Array(2) [model, model]}
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books } );
    });
};

/* Default.
// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create GET');
};
*/

// Display Author create form on GET.
exports.author_create_get = function(req, res, next) {       
    res.render('author_form', { title: 'Create Author'}); // render author_form.pug with title.
};

/* Default:
// Handle Author create on POST.
exports.author_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author create POST');
};
*/

// Handle Author create on POST.
exports.author_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render author_form.pug with title and sanitized values/errors messages.
            res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if model Author with same name exists.
            Author.findOne({'first_name': req.body.first_name, 'family_name':  req.body.family_name})
            .exec((err, found_author) => {
                if (err) { return next(err); }
                if (found_author) {
                    res.redirect(found_autor.url)
                }
                else {
                    // Create an Author object with escaped and trimmed data.
                    var author = new Author(
                    {
                        first_name: req.body.first_name,
                        family_name: req.body.family_name,
                        date_of_birth: req.body.date_of_birth,
                        date_of_death: req.body.date_of_death
                    });
                    author.save(function (err) {
                        if (err) { return next(err); }
                        // Successful - redirect to new author record.
                        res.redirect(author.url);
                    });
                } // end of Create an Author object with escaped and trimmed data.
            }); // end of Author.findOne.exec(...).
        } // end of Data from from is valid.
    } // end of Process request after validation and sanitization..
]; // end of exports.author_create_post.

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