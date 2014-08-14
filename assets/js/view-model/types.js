'use strict';

var Type = require('../models/Type.js');

/**
 * @file Handle types
 */

module.exports.setTypes = function(types) {
  var client = this;
  var tempTypes = [];
  types.forEach(function(type) {
    tempTypes.push(new Type(type, client));
  });
  client.types(tempTypes);
};
