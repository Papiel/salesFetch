"use strict";

module.exports.get = function get(req, res, next) {
  res.set('Location', 'http://salesfetch.anyfetch.com');
  res.send(302);
  next();
};
