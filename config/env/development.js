'use strict';

var fs = require('fs');
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  mongo_url: 'mongodb://localhost/salesfetch-dev',

  // SSL certificates used for development
  certificates: {
    key: fs.readFileSync(rootPath + '/config/certificates/ssl-key.pem'),
    cert: fs.readFileSync(rootPath + '/config/certificates/ssl-cert.pem')
  },

  // Disable template caching
  swig: {
    cache: false
  },

  // Disable caching on less middleware
  less: {
    cache: false
  }
};