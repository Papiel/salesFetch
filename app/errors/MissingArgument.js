'use strict';

var express = require('express');
var util = require('util');

var errName = 'MissingArgument';

function MissingArgument(message) {
  this.name = errName;
  this.statusCode = 409;
  this.message = message;
}

util.inherits(MissingArgument, Error);
express.errors = express.errors || {};
express.errors[errName] = MissingArgument;
