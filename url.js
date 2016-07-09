var mongoose = require('mongoose');
var validate = require('url-validator');

var urlSchema = mongoose.Schema({
  raw: String,
  shortCode: { type: String, index: true }
});

urlSchema.statics.findRaw = function (raw, cb) {
  return this.findOne({raw: raw}, cb);
};

urlSchema.statics.findCode = function (shortCode, cb) {
  return this.findOne({shortCode: shortCode}, cb);
};

urlSchema.statics.genCode = function (cb) {
  var _this = this;
  var shortCode = Math.round(Math.random() * 1000000);
  function tryCode () {
    _this.findCode(shortCode, function (err, result) {
      if (err) {
        return cb(err);
      }
      if (result === null) {
        return cb(undefined, shortCode);
      } else {
        shortCode = Math.round(Math.random() * 1000000);
        tryCode();
      }
    });
  }
  tryCode();
};

urlSchema.statics.validate = validate;

var URL = mongoose.model('URL', urlSchema);

module.exports = URL;
