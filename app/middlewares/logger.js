"use strict";

var colors = require('colors');

colors.setTheme({
  route: 'green',
  assets: 'blue'
});

module.exports = function(req, res, next) {
  var publicFolder = /img|js|lib|stylesheet/;
  var timeStamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

  var logFomat = "[%s] %s";

  if (publicFolder.test(req.url)) {
    console.log(timeStamp + " - " + logFomat.assets, req.method, req._parsedUrl.pathname);
  } else {
    console.log(timeStamp + " - " + logFomat.route, req.method, req._parsedUrl.pathname);
  }

  next();
};
