'use strict';

/**
 * Extract the parameter `name` from the current URL location
 */
module.exports = function getUrlParameter(name) {
  var querystring = window.location.search.substring(1);
  var variables = querystring.split('&');
  for(var i = 0; i < variables.length; i += 1) {
    var param = variables[i].split('=');
    if(param[0] === name) {
      return param[1];
    }
  }
};
