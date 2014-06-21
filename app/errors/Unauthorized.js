'use strict';

var express = require('express');
var util = require('util');

var errName = 'Unauthorized';

function Unauthorized(message) {
  this.name = errName;
  this.statusCode = 401;
  this.message = message;
}

util.inherits(Unauthorized, Error);
express.errors = express.errors || {};
express.errors[errName] = Unauthorized;
