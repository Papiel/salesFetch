'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Log Schema
 */
var LogModel = new Schema ({
  created: {
    type: Date,
    default: Date.now
  },
  organization: {
    type: Schema.ObjectId,
    ref: 'Organization',
    required: true,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  recordType: {
    type: String
  },
  recordId: {
    type: String
  },
});

mongoose.model('Log', LogModel);
