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

//let book; - not needed!!!
function findBook(title, cb) {
  Book.findOne({title: title})
  .populate('author') //This populates the author id with actual author information!
  .populate('genre') // Thie populates genre id with actual info.
  .exec(function (err, book) {
    if (err) {
      console.log('ERROR during findOne Book: ' + title);
      cb(err, null); // callback as error case.
      return;
    }
    if (book === null) {
      console.log('Not found => ' + title);
      //cb('Not found => ' + title, null); // callback as error case wlll stop async serie immediately.
      cb(null, 'Not found => ' + title); // callback as result case with not found message.
    }
    else {
      console.log('The title is %s', book.title); // use property `title`.  Prints "he Name of the Wind (The Kingkiller Chronicle, #1)"
      console.log('The author is %s', book.author.name); // use populated property `author` virtual property `name`.  Prints "The author is Rothfuss, Patrick"
      console.log('The genre is %s', book.genre[0].name); // use populated array property `genre[0]` property `name` prints "Fantasy"
      //setTimeout(() => { mongoose.connection.close();}, 1000);
      cb(null, book); // callback as result case.
      }
  });
}

// Test array or book titles to found.
let bookTitle = [`The Name of the Wind (The Kingkiller Chronicle, #1000)`, `The Wise Man's Fear (The Kingkiller Chronicle, #2)`];  
function findSomething(cb) { // parameter cb refers to async.series optional callback
  async.parallel([
    function(callback) {
        findBook(bookTitle[0], callback); // 'The Name of the Wind (The Kingkiller Chronicle, #1)'
    },
    function(callback) {
        findBook(bookTitle[1], callback); // 'The Name of the Wind (The Kingkiller Chronicle, #1)'
    }
  ],
  cb // calling async.series optional callback
  // or use parallel optional callback.
  /*
  // optional callback with arrayl of results when all parallel async finished.
  function(err, results) { // results is array of populated books found.
   if (err) {
     console.log('<=== All parallel done logged errors below: ===>');
     console.log('Error on find something: ' + err);
    }
   else {
     console.log('<=== All parallel done logged results below: ===>');
     for (let i = 0; i < results.length; i++) {
       if (typeof results[i] === 'string') {
         console.log(`NB! ` + results[0]);
        }
        else {
          console.log(results[i].title);
          console.log(results[i].author.name);
        }
      }
    }
    // All done, disconnect from database
    console.log(`<=== Closing mongoose connection. ===>`)
    mongoose.connection.close();
  }
  */
  );
}


async.series([
    findSomething
  ],
  // Optional callback after all series done.
  function(err, results) { // results is array of populated books found.
   if (err) {
     console.log('<=== All series done logged errors below: ===>');
     console.log('Error on find something: ' + err);
    }
   else {
     console.log('<=== All series done logged results below: ===>');
     for (let i = 0; i < results.length; i++) { // series results loop.
       for (let j = 0; j < results[i].length; j++) { // parallel reslults loop.
        if (typeof results[i][j] === 'string') {
          console.log(`NB! ` + results[i][j]);
         }
         else {
           console.log(results[i][j].title);
           console.log(results[i][j].author.name);
         }
       }  // end of parallel reslults loop.
      } // end of series results loop.
    }
    // All done, disconnect from database
    console.log(`<=== Closing mongoose connection. ===>`)
    mongoose.connection.close();
  }
);

// All done, disconnect from database.
// NB! We must close connection later manually otherwise connection will be closed BEFORE findOne() which is executed async after end of main script text.
//mongoose.connection.close();
console.log('End of main script text');