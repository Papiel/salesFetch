'use strict';

/**
 * @param {String} url
 * @param {String} [options] Additional options to pass to jQuery's AJAX function
 * @param {Function} success
 * @param {Function} [error]
 */
module.exports = function call(url, options, success, error) {
  var defaultError = function(res, status, err) {
    console.log('Error when communicating with the server:', err);
    if(res.responseJSON && res.responseJSON.message) {
      console.log(res.responseJSON.message);
    }
    else {
      console.log(res.responseText);
    }
  };

  // `options` and `errorMessage` can be omitted
  error = error || defaultError;
  if(!success) {
    success = options;
    options = {};
  }

  url = $.salesFetchUrl + url + '?data=' + encodeURIComponent(JSON.stringify($.data));
  var params = {
    dataType: 'json',
    type: 'get',
    url: url,
    success: success,
    error: error
  };
  params = $.extend(params, options);

  $.ajax(params);
};
