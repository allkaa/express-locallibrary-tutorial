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


const mongoose = require('mongoose');
//const mongoDB = userArgs[0];
const mongoDB = 'mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

const async = require('async');
const Book = require('./models/book');
const Author = require('./models/author');
const Genre = require('./models/genre');
const BookInstance = require('./models/bookinstance');


function findBook(title, i, lengthArr) {
  Book.findOne({title: title}) // model Book .findOne will be executed async later so return value has no sense.
  .populate('author') //This populates the author id with actual author information!
  .populate('genre') // Thie populates genre with actual info.
  .exec(function (err, book) {
    if (err) {
      console.log('ERROR during findOne Book: ' + title);
      //return 'ERROR during findOne Book: ' + title;
    }
    else {
      if (book === null) {
        console.log('Not found => ' + title);
        //return null;
      }
      else {
        console.log('The title is %s', book.title); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
        console.log('The author is %s', book.author.name); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
        console.log('The genre is %s', book.genre[0].name); // use real property prints "Fantasy"
        //setTimeout(() => { mongoose.connection.close();}, 1000);
        //return book;
      }
    }
    if (i == lengthArr - 1) {
      setTimeout(() => {
        console.log(`<=== All done, disconnect from database. ==>`);
        mongoose.connection.close();
      }, 1000);
    }
  });
}

let bookTitle = [`The Name of the Wind (The Kingkiller Chronicle, #1000)`, `The Wise Man's Fear (The Kingkiller Chronicle, #2)`];  
 
for (let i = 0; i < bookTitle.length; i++) {
  let resp;
  resp = findBook(bookTitle[i], i, bookTitle.length); // returns undefined, starts async Book.findOne(...) that will be executed later.
  console.log(i, resp)
}

// All done, disconnect from database.
// NB! We must close connection later manually otherwise connection will be closed BEFORE findOne() which is executed async after end of main script text.
//mongoose.connection.close();
console.log('End of main script text');