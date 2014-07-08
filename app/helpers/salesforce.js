'use strict';

var jsforce = require('jsforce');

module.exports.salesforceConn = function(params) {
  return new jsforce.Connection({
    instanceUrl : params.instanceURL,
    accessToken : params.sessionId
  });
};