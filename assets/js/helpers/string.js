'use strict';

/**
 * @param {Object} object
 * @return {String} string formatted with `object`
 */
String.prototype.format = function() {
  var s = this;
  for (var i = 0; i < arguments.length; i+=1) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i]);
  }

  return s;
};


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
