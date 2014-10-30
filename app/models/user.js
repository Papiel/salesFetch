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
  anyfetchId: {
    type: String,
    unique: true
  },
  anyfetchEmail: {
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
  anyfetchToken: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

mongoose.model('User', UserModel);
