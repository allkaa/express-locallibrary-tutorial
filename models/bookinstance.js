var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved', 'Undefinded'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
  }
);

// Virtual property url for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id;
});

// Virtual property due_back_formatted 
BookInstanceSchema
.virtual('due_back_formatted')
.get(function () {
  return moment(this.due_back).format('MMMM Do, YYYY');
});

// Virtual property dob_back_formatted 
AuthorSchema
.virtual('dueb')
.get(function () {
  return this.due_back ? moment(this.due_back).format('YYYY-MM-DD') : '';
});

//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);