'strict on';

console.log('This script checks populated some test books, authors, genres and bookinstances to your database.\nSpecified database as argument - e.g.: check_populated mongodb://your_username:your_password@your_dabase_url');
// node check_populatedb mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library

/*
// Get arguments passed on command line
let userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/

const async = require('async');
const Book = require('./models/book');
const Author = require('./models/author');
const Genre = require('./models/genre');
const BookInstance = require('./models/bookinstance');


const mongoose = require('mongoose');
//const mongoDB = userArgs[0];
const mongoDB = 'mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

//let book;
function findBook(title, cb) {
  Book.findOne({title: title})
  .populate('author') //This populates the author id with actual author information!
  .populate('genre') // Thie populates genre with actual info.
  .exec(function (err, book) {
    if (err) {
      console.log('ERROR during findOne Book: ' + title);
      cb(err, null);
      return;
    }
    if (book === null) {
      console.log('Not found => ' + title);
      //cb('Not found => ' + title, null); // callback as error case wlll stop async serie immediately.
      cb(null, 'Not found => ' + title); // callback as result case.
    }
    else {
      console.log('The title is %s', book.title); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
      console.log('The author is %s', book.author.name); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
      console.log('The genre is %s', book.genre[0].name); // use real property prints "Fantasy"
      //setTimeout(() => { mongoose.connection.close();}, 1000);
      cb(null, book);
      }
  });
}

let bookTitle = [`The Name of the Wind (The Kingkiller Chronicle, #1000)`, `The Wise Man's Fear (The Kingkiller Chronicle, #2)`];  
function findSomething(cb) {
  async.parallel([
    function(callback) {
        findBook(bookTitle[0], callback); // 'The Name of the Wind (The Kingkiller Chronicle, #1)'
    },
    function(callback) {
        findBook(bookTitle[1], callback); // 'The Name of the Wind (The Kingkiller Chronicle, #1)'
    }
  ],
  cb); // optional callback from asyn.series.
}

async.series([
  findSomething
],
// Optional callback after all parallel done.
function(err, results) { // results is array of populated books found.
  if (err) {
    console.log('<=== All done logged errors below: ===>');
    console.log('Error on find something: ' + err);
  }
  else {
    console.log('<=== All done logged results below: ===>');
    for (let i = 0; i < results[0].length; i++) {
      if (typeof results[0][i] === 'string') {
        console.log(`NB! ` + results[0][i]);
      }
      else {
        console.log(results[0][i].title);
        console.log(results[0][i].author.name);
      }
    }
  }
  // All done, disconnect from database
  console.log(`<=== Closing mongoose connection. ===>`)
  mongoose.connection.close();
});

// All done, disconnect from database.
// NB! We must close connection later manually otherwise connection will be closed BEFORE findOne() which is executed async after end of main script text.
//mongoose.connection.close();
console.log('End of main script text');