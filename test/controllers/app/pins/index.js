"use strict";

var request = require('supertest');
var async = require('async');

var mongoose = require('mongoose');
var Pin = mongoose.model('Pin');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner');
var requestBuilder = require('../../../helpers/login').requestBuilder;
var APIs = require('../../../helpers/APIs');
var checkUnauthenticated = require('../../../helpers/access').checkUnauthenticated;


describe('/app/pins page', function() {
  var endpoint = '/app/pins';

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('fetchAPI', 'http://api.anyfetch.com', done);
  });

  var sampleDocumentId = '5309c57d9ba7daaa265ffdc9';
  var sampleContext = {
    "templatedDisplay": "Chuck Norris",
    "templatedQuery": "Chuck Norris",
    "recordId": "0032000001DoV22AAF",
    "recordType": "Contact"
  };

  describe('GET /app/pins', function() {
    checkUnauthenticated(app, 'get', endpoint);

    it("should be empty when there's no pin", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .end(cb);
        },
        function testNoContent(res, cb) {
          res.text.trim().should.be.empty;
          cb();
        }
      ], done);
    });

    it("should contain existing pins", function(done) {
      async.waterfall([
        function addPin(cb) {
          var pin = new Pin();
          pin.SFDCId = sampleContext.recordId;
          pin.anyFetchId = sampleDocumentId;

          pin.save(cb);
        },
        function buildRequest(pin, count, cb) {
          requestBuilder(endpoint, sampleContext, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .end(cb);
        },
        function testNoContent(res, cb) {
          res.text.should.containDeep("SecuringtheData");
          cb();
        }
      ], done);
    });
  });
});
