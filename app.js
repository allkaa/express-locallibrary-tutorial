var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site.
var pugtestRouter = require('./routes/pugtest');  //Import routes for "catalog" area of site.

var app = express();

// Set up mongoose connection
// Creating the default connection to the database and binds to the error event (so that errors will be printed to the console). 
var mongoose = require('mongoose');
var mongoDB = 'mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter); // e.g. http://localhost:3000/ url
app.use('/users', usersRouter); // e.g. http://localhost:3000/users url
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.
app.use('/pugtest', pugtestRouter);  // Add catalog routes to middleware chain.
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send('Error 404 - Page not found!');
  //next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
