'use strict';

var express = require('express');
var util = require('util');

var errName = 'Forbidden';

function Forbidden(message) {
  this.name = errName;
  this.statusCode = 403;
  this.message = message;
}

util.inherits(Forbidden, Error);
express.errors = express.errors || {};
express.errors[errName] = Forbidden;
