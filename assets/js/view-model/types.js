'use strict';

var Type = require('../models/Type.js');

/**
 * @file Handle providers
 */

module.exports.setTypes = function(client, types) {
  var tempTypes = [];
  types.forEach(function(type) {
    tempTypes.push(new Type(type));
  });
  client.types(tempTypes);
};
