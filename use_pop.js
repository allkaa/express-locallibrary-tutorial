'strict on';

console.log('This script checks populated some test books, authors, genres and bookinstances to your database.\nSpecified database as argument - e.g.: check_populated mongodb://your_username:your_password@your_dabase_url');
// node check_populatedb mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library

/*
// Get arguments passed on command line as:
// process.argv[0] "/home/akaarna/.nvm/versions/node/v8.9.4/bin/node"
// process.argv[1] "/home/akaarna/express-locallibrary-tutorial/use_populated.js"
// process.argv[2] "mongodb://allkaa:himka123@ds024778.mlab.com:24778/local_library"
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

/*
function findBook(title, i, lengthArr) {
  Book.findOne({title: title}) // model Book .findOne will be executed async later so return value has no sense.
  .populate('author') //This populates the author._id (type: Schema.Types.ObjectId) with actual author information! Otherwise author.name is undefined
  .populate('genre') // Thie populates genre._id with actual info. Otherwise genre[i].name is undefined.
  .exec(function (err, book) {
    if (err) {
      console.log('ERROR during findOne Book: ' + title);
      //return 'ERROR during findOne Book: ' + title; // model Book .findOne will be executed async later so return value has no sense.
    }
    else {
      if (book === null) {
        console.log('Not found => ' + title);
        //return null; // model Book .findOne will be executed async later so return value has no sense.
      }
      else {
        console.log('The title is %s', book.title); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
        console.log('The author is %s', book.author.name); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
        console.log('The genre is %s', book.genre[0].name); // use real property prints "Fantasy"
        //setTimeout(() => { mongoose.connection.close();}, 1000);
        //return book; // model Book .findOne will be executed async later so return value has no sense.
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
*/

function bookCb(err, result) {
  if (err) {
    console.log('ERROR during find Book: ' + title);
    //return 'ERROR during findOne Book: ' + title; // model Book .findOne will be executed async later so return value has no sense.
  }
  else {
    if (result === null) {
      console.log('Documents Not found => ');
    }
    else {
      // result may be emptu Array(0) [] if nothing found.
      if (result.length === 0) {
        console.log('Documents Not found => ');
      }
      else {
        for (let i = 0; i < result.length; i++) {
          console.log('The title is %s', result[i].title); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
          console.log('The author is %s', result[i].author.name); // use virtual property `name`.  Prints "The author is Rothfuss, Patrick"
          console.log('The genre is %s', result[i].genre[0].name); // use real property prints "Fantasy"
        }
      }
    }
  }
  ///*
  setTimeout(() => {
    console.log(`<=== All done, disconnect from database. ==>`);
    mongoose.connection.close();
  }, 1000);
  //*/
}

//let genreId = `5beea91b8cfe0caf73ba65a9`; // wrong genre._id value (type: Schema.Types.ObjectId).
let genreId = `5beea91b8cfe0caf73ba65a3`;   // correct genre._id
let authorId = `5beea91b8cfe0caf73ba659e`;  // correct author._id
Book.
  find().
  populate('author'). //This populates the author._id (type: Schema.Types.ObjectId) with actual author information! Otherwise author.name is undefined
  populate('genre'). // Thie populates genre._id with actual info. Otherwise genre[i].name is undefined.
  where('genre').equals(genreId).    // Wrong Fantasy _id  //.gt(17).lt(50).  //Additional where query
  //where('genre').equals('5beea91b8cfe0caf73ba65a3').    // Fantasy _id  //.gt(17).lt(50).  //Additional where query
  where('author').equals(authorId).   // Patrick Rothfuss _id  //.gt(17).lt(50).  //Additional where query
  limit(25).
  sort({ title: 1 }). // Asc
  //sort({ title: -1 }). // Desc
  //select('autor title genre'). // not needed if selecting all properties (document fields)
  exec(bookCb); // where bookCb is the name of callback function.


/*
var Athlete = mongoose.model('Athlete', yourSchema);

Athlete.
  find().
  where('sport').equals('Tennis').
  where('age').gt(17).lt(50).  //Additional where query
  limit(5).
  sort({ age: -1 }).
  select('name age').
  exec(callback); // where callback is the name of our callback function.

// All callbacks in Mongoose use the pattern callback(error, result). If an error occurs executing the query, the error parameter will contain an error document,
// and result will be null. If the query is successful, the error parameter will be null, and the result will be populated with the results of the query.

*/




// All done, disconnect from database.
// NB! We must close connection later manually otherwise connection will be closed BEFORE findOne() which is executed async after end of main script text.
//mongoose.connection.close();
console.log('End of main script text');