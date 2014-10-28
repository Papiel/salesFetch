'use strict';

/**
 * @param {Object} object
 * @return {String} string formatted with `object`
 */
String.prototype.format = function() {
  var self = this;
  for(var i = 0; i < arguments.length; i += 1) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    self = self.replace(reg, arguments[i]);
  }

  return self;
};

/*
 * @return {String} string with the first letter in upper case
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
