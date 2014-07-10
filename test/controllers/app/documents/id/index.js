"use strict";

var request = require('supertest');
var async = require('async');
var rarity = require('rarity');

var app = require('../../../../../app.js');
var cleaner = require('../../../../hooks/cleaner');
var salesfetchHelpers = require('../../../../../app/helpers/salesfetch.js');
var requestBuilder = require('../../../../helpers/login').requestBuilder;
var APIs = require('../../../../helpers/APIs');
var checkUnauthenticated = require('../../../../helpers/access').checkUnauthenticated;

describe('/app/documents/:id page', function() {
  var sampleUserId = '0000c57d9ba7bbbb265ffdc9';
  var sampleDocumentId = '5309c57d9ba7daaa265ffdc9';
  var sampleContext = {
    "templatedDisplay": "Chuck Norris",
    "templatedQuery": "Chuck Norris",
    "recordId": "0032000001DoV22AAF",
    "recordType": "Contact"
  };

  var endpoint = '/app/documents/' + sampleDocumentId;

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('fetchAPI', 'https://api.anyfetch.com', done);
  });


  describe('GET /app/documents/:id', function() {
    checkUnauthenticated(app, 'get', endpoint);

    it("should render the full template", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(function(res) {
              res.text.toLowerCase().should.containDeep("email");
              res.text.toLowerCase().should.containDeep("gmail");
              res.text.toLowerCase().should.containDeep("albert einstein");
            })
            .end(cb);
        }
      ], done);
    });

    it("should mark a pinned document as pinned", function(done) {
      async.waterfall([
        function addPin(cb) {
          var user = { id: sampleUserId };
          cb = rarity.slice(1, cb);
          salesfetchHelpers.addPin(sampleContext.recordId, sampleDocumentId, user, cb);
        },
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(function(res) {
              res.text.toLowerCase().should.containDeep("pinned");
            })
            .end(cb);
        }
      ], done);
    });
  });
});
