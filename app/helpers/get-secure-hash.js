'use strict';

var _ = require('lodash');
var crypto = require('crypto');

var config = require('../../config/configuration.js');

/**
 * SalesForce's URI encoding function strictly adheres to RFC 3986
 */
var strictUriEncode = function(str) {
  // Note that `replace` can be called with a function (similar to `map`)
  return encodeURIComponent(str).replace(/[!\'()\*]/g, escape);
};

/**
 * The hash is computed from params taken from the request and a secret key.
 * @param {Object} data The GET param describing the request (with `user`, `organization`, ...)
 * @param {String} masterKey The user's organization's master key
 * @return {String} The hashed string which uniquely identifies a request.
 */
module.exports = function getSecureHash(data, masterKey) {
  var usefulData = _.merge({}, data);
  usefulData.hash = null;

  var encoded = strictUriEncode(JSON.stringify(usefulData));
  var hash = encoded + masterKey + config.secretKey;
  return crypto.createHash('sha512').update(hash).digest("base64");
};
