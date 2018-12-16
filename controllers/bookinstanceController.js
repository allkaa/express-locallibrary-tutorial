'use strict';
var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* defalult.
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance list');
};
*/

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find() // find all models of BookInstance.
      .populate('book') // populate with book info.
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render result array list_bookinstances with models BookInstance found.
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
};

/* Default.
// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance detail: ' + req.params.id);
};
*/

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id) // find model BookInstance by id got from router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      // result as bookinstance will be model BookInstance populated with model Book
      res.render('bookinstance_detail', { title: 'Book:', bookinstance:  bookinstance});
    })
};

/*
// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance create GET');
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance create POST');
};
*/

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       
    Book.find({},'title') // find all models Book with ALL properties.
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books, status: 'Undefinded'});
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
    
    // Sanitize fields.
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (bookinstance.status === undefined)
        {
            bookinstance.status = 'Undefinded';
        }

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book._id , errors: errors.array(), bookinstance:bookinstance, status: bookinstance.status });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

/*
// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};
*/

// Display BookInstance delete form on GET.
// router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);
exports.bookinstance_delete_get = function(req, res) {
    BookInstance.findById(req.params.id) // find model BookInstance by id got from router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
        res.redirect('/catalog/bookinstances');
      }
      // Successful, so render.
      // result as bookinstance will be model BookInstance populated with model Book
      res.render('bookinstance_delete', { title: 'BookInstance:', bookinstance:  bookinstance});
    })
};

// Handle BookInstance delete on POST.
// router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);
exports.bookinstance_delete_post = function(req, res) {
    BookInstance.findById(req.body.bookinstanceid) // find model BookInstance by id got from input#bookinstanceid.form-control(type='hidden', name='bookinstanceid', required='true', value=bookinstance._id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
        res.redirect('/catalog/bookinstances');
      }
      // Successful, so render.
      // result as bookinstance will be model BookInstance populated with model Book
      BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
        if (err) { return next(err); }
        // Success - go to author list
        res.redirect('/catalog/bookinstances')
      })
    })
};


// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};