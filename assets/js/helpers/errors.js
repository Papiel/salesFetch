'use strict';

/**
 * @file Error handling helper functions
 */

/**
  * Regexp => Error string
  * Regexp should be ordered from most precise to more generic
  */
// TODO: internationalize
var errorMessages = {
  'unprocessable entity': 'Missing aunthentication information',
  'template parameter is missing': 'Missing parameters: check your VisualForce page configuration (`templatedQuery` or `templatedDisplay`)',
  'salesfetch master key': 'Unable to authenticate your request, please check your SalesFetch master key'
};

/**
 * @param {Request object | String} res from an AJAX call or an error name directly
 * @return {String} The most precise error message we can display
 */
module.exports.getErrorMessage = function(res) {
  var err;
  if(res.responseJSON || res.responseText) {
    err = (res.responseJSON ? res.responseJSON.code + ': ' + res.responseJSON.message : res.responseText);
  }
  else if(res.status >= 300) {
    err = res.status + ' error';
  }
  else {
    err = res;
  }

  if(!err) {
    return 'Failed to reach the server';
  }

  // Allow to override server-sent error messages by human-friendly error messages
  for(var expression in errorMessages) {
    if(err.match(new RegExp(expression, 'gi'))) {
      return errorMessages[expression];
    }
  }

  return err;
};
