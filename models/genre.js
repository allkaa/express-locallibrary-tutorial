var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var genreSchema = new Schema(
  {
    name: {type: String, required: true, min: 3, max: 100} //, enum: ['Fiction', 'Non-fiction', 'Romance', 'Military history', 'Mixed'], default: 'Mixed'},
  }
);

// Virtual for genre's URL
genreSchema
.virtual('url')
.get(function () {
  return '/catalog/genre/' + this._id;
});

//Export model
module.exports = mongoose.model('Genre', genreSchema);