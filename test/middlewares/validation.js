'use strict';

require('should');
var request = require('supertest');
var async = require('async');

var app = require('../../app.js');
var cleaner = require('../hooks/cleaner.js');
var mock = require('../helpers/mock.js');
var requestBuilder = require('../helpers/login.js').requestBuilder;

describe('<Validation middleware>', function() {
  beforeEach(cleaner);
  after(mock.restore);

  it('should err on missing `context` argument', function(done) {
    var endpoint = '/app/documents';

    async.waterfall([
      function buildRequest(cb) {
        requestBuilder(endpoint, {}, null, cb);
      },
      function sendRequest(url, cb) {
        request(app)
          .get(url)
          .expect(409)
          .expect(/missing or incomplete `context`/i)
          .end(cb);
      }
    ], done);
  });

  it('should err on missing `id`', function(done) {
    var endpoint = '/app/documents/';

    async.waterfall([
      function buildRequest(cb) {
        requestBuilder(endpoint, { recordId: '0032000001DoV22AAF' }, null, cb);
      },
      function sendRequest(url, cb) {
        request(app)
          .get(url)
          .expect(409)
          .expect(/missing `id` parameter/i)
          .end(cb);
      }
    ], done);
  });
});
