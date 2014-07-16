'use strict';

var _ = require('lodash');
var crypto = require('crypto');

var config = require('../../config/configuration.js');

/**
 * The hash is computed from params taken from the request and a secret key.
 * @param {Object} data The GET param describing the request (with `user`, `organization`, ...)
 * @param {String} masterKey The user's organization's master key
 * @return {String} The hashed string which uniquely identifies a request.
 */
module.exports = function getSecureHash(data, masterKey) {
  var usefulData = _.merge({}, data);
  delete usefulData.hash;

  var hash = JSON.stringify(usefulData) + masterKey + config.secretKey;
  return crypto.createHash('sha1').update(hash).digest("base64");
};
