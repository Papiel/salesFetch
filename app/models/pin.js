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
    unique: true
  },
  anyFetchId: {
    type: String,
    unique: true
  }
});

mongoose.model('Pin', PinModel);
