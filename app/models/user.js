'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserModel = new Schema ({
  created: {
    type: Date,
    default: Date.now
  },
  anyFetchId: {
    type: String,
    unique: true
  },
  anyFetchEmail: {
    type: String,
    unique: true
  },
  SFDCData: {
    type: Object,
    required: true,
    default: {},
  },
  SFDCId: {
    type: String,
    unique: true
  },
  organization: {
    type: Schema.ObjectId,
    ref: 'Organization'
  },
  anyFetchToken: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

mongoose.model('User', UserModel);
