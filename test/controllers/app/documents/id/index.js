"use strict";

var request = require('supertest');
var async = require('async');
var rarity = require('rarity');
var should = require('should');

var app = require('../../../../../app.js');
var cleaner = require('../../../../hooks/cleaner');
var salesfetchHelpers = require('../../../../../app/helpers/salesfetch.js');
var requestBuilder = require('../../../../helpers/login').requestBuilder;
var APIs = require('../../../../helpers/APIs');
var checkUnauthenticated = require('../../../../helpers/access').checkUnauthenticated;

describe('/app/documents/:id page', function() {
  var sampleUserId = '0000c57d9ba7bbbb265ffdc9';
  var sampleDocumentId = '5309c57d9ba7daaa265ffdc9';
  var inexistantId = '1234c57d9ba7daaa265f1234';
  var sampleContext = {
    "templatedDisplay": "Chuck Norris",
    "templatedQuery": "Chuck Norris",
    "recordId": "0032000001DoV22AAF",
    "recordType": "Contact"
  };

  var endpoint = '/app/documents/' + sampleDocumentId;

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('anyfetch', 'https://api.anyfetch.com', done);
  });

  describe('GET /app/documents/:id', function() {
    checkUnauthenticated(app, 'get', endpoint);

    it('should err on inexistant document', function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder('/app/documents/' + inexistantId, sampleContext, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(/document not found/i)
            .expect(404)
            .end(cb);
        }
      ], done);
    });

    it('should render the full template', function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(/email/i)
            .expect(/gmail/i)
            .expect(/albert einstein/i)
            .end(cb);
        }
      ], done);
    });

    it('should mark a pinned document as pinned', function(done) {
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
            .expect(200)
            .expect(function(res) {
              should(res).be.okay;
              should(res.body).be.okay;

              var doc = res.body;
              doc.should.have.properties({ pinned: true });
            })
            .end(cb);
        }
      ], done);
    });
  });
});
