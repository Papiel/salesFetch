"use strict";

var UAParser = require('ua-parser-js');


module.exports.contextSearch = function (req, res) {
  var deviceType;

  if (req.query.env === 'desktop') {
    deviceType = 'desktop';
  } else {
    var parser = new UAParser();
    var ua = req.headers['user-agent'];
    deviceType = parser.setUA(ua).getResult().device.type || 'tablet';
  }

  var template = 'mockups/layout-' + deviceType + '.html';
  console.log(template);

  return res.render(template);
};