'use strict';

var opbeatClient = require('./vendors').opbeat;

/**
 * Called when an error occurs in the app.
 * Will be logged on the console and sent a third-party logging service.
 * The `extra` hash  can be used to store additional informations.
 */
module.exports.logError = function logError(err, extra, cb) {
  delete err.domain;
  delete err.domainThrown;
  console.warn(err, extra);

  opbeatClient.captureError(err, {extra: extra}, cb);
};
