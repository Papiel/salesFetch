'use strict';

var express = require('express');
var util = require('util');

var errName = 'InvalidArgument';

function InvalidArgument(message) {
  this.name = errName;
  this.statusCode = 409;
  this.message = message;
}

util.inherits(InvalidArgument, Error);
express.errors = express.errors || {};
express.errors[errName] = InvalidArgument;
