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

//let async = require('async');
let Book = require('./models/book');
let Author = require('./models/author');
let Genre = require('./models/genre');
let BookInstance = require('./models/bookinstance');


const mongoose = require('mongoose');
//const mongoDB = userArgs[0];
const mongoDB = 'mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

//let book;
Book.findOne({title: 'The Name of the Wind (The Kingkiller Chronicle, #1)'})
.populate('author') //This populates the author id with actual author information!
.populate('genre') // Thie populates genre with actual info.
.exec(function (err, book) {
  if (err) return console.log(err);
  console.log('The author is %s', book.author.name); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
  console.log('The genre is %s', book.genre[0].name); // use real property prints "Fantasy"
  setTimeout(() => {
    mongoose.connection.close();
  }, 1000);
});

// All done, disconnect from database
// We must close connection later manually otherwise connection will be closed BEFORE findOne() which is executed async after end of main script text.
//mongoose.connection.close();
console.log('End of main script text');