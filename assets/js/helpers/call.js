'use strict';

var loadFirstUsePage = function loadFirstUsePage() {
  if(!loadFirstUsePage.executed) {
    loadFirstUsePage.executed = true;
    var url = $.salesFetchUrl + '/init.html';
    var container = $('#salesfetch-container');
    $.ajax({
      url: url,
      contentType: 'html',
      success: function(html) {
        container.html(html);
      },
      error: function(res, status, err) {
        container.html(err);
      }
    });
  }
};

loadFirstUsePage.executed = false;

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

  // `error` can be omitted
  var errorHandler = function(res) {
    if(res.status === 401 &&
       ((res.responseJSON && res.responseJSON.message) || '') === 'User not created') {
      return loadFirstUsePage();
    }
    (error || defaultError).apply(this, arguments);
  };

  // `options` can be omitted
  if(!success) {
    success = options;
    options = {};
  }

  url = $.salesFetchUrl + url + '?data=' + encodeURIComponent(JSON.stringify($.clientData));
  var params = {
    dataType: 'json',
    type: 'get',
    url: url,
    success: success,
    error: errorHandler
  };
  params = $.extend(params, options);

  $.ajax(params);
};
