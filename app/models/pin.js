'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Pin Schema
 */
var PinModel = new Schema ({
  created: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  SFDCId: {
    type: String,
  },
  anyfetchId: {
    type: String,
  }
});

// The pair `(SFDCId, anyfetchId)` must be unique
PinModel.index({SFDCId: 1, anyfetchId: 1}, {unique: true});

mongoose.model('Pin', PinModel);
