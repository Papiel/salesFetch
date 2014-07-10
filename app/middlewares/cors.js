'use strict';

module.exports = function(req, res, next) {
  var allowHeaders = ['Accept', 'Accept-Version', 'Authorization', 'Content-Type', 'Api-Version', 'X-Requested-With'];

  res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Origin', '*');

  return next();
};
