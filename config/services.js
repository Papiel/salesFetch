'use strict';

var opbeatClient = require('./vendors').opbeat;

/**
 * Called when an error occurs in the app.
 * Will be logged on the console and sent a third-party logging service.
 * The `extra` hash  can be used to store additional informations.
 */
module.exports.logError = function logError(err, req, extra) {
  // No logging on test or if err is undefined
  if(process.env.NODE_ENV === "test" || !err) {
    return;
  }

  if(!extra) {
    extra = req;
    req = null;
  }

  delete err.domain;
  delete err.domainThrown;

  if(err.__alreadyLogged) {
    console.warn("Skipping an error already sent to Opbeat: ", err.toString());
    return;
  }

  if(!opbeatClient) {
    var all = {
      details: err.toString(),
      err: err,
      extra: extra
    };

    try {
      all = JSON.stringify(all);
    }
    catch(e) {
      // Converting circular structure to JSON.
      // We can't do anything, let's log the raw object.
    }
    console.warn("LOG-ERROR-DETAILS", all);
  }
  else {
    var meta = {
      extra: extra
    };

    // Store the request when provided
    if(req) {
      meta.request = req;
      meta.extra.data = req.data;

      if(req.user) {
        meta.user = {
          is_authenticated: true,
          id: req.user.anyfetchId,
          username: req.user.anyfetchToken,
          email: req.user.anyfetchEmail,
        };
      }
    }

    opbeatClient.captureError(err, meta);
  }

  err.__alreadyLogged = true;
};
