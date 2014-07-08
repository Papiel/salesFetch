"use strict";

var colors = require('colors');

colors.setTheme({
  route: 'green',
  assets: 'blue'
});

module.exports = function(req, res, next) {
  var publicFolder = /img|js|lib|stylesheet/;
  var timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  var logFormat = "[%s] %s";

  if (publicFolder.test(req.url)) {
    console.log(timeStamp + " - " + logFormat.assets, req.method, req.route.path);
  } else {
    console.log(timeStamp + " - " + logFormat.route, req.method, req.route.path);
  }

  next();
};
