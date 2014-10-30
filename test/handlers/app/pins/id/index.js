"use strict";

var request = require('supertest');
var should = require('should');
var async = require('async');
var rarity = require('rarity');
var AnyFetch = require('anyfetch');

var mongoose = require('mongoose');
var Pin = mongoose.model('Pin');

var app = require('../../../../../app.js');
var cleaner = require('../../../../hooks/cleaner.js');
var mock = require('../../../../helpers/mock.js');
var requestBuilder = require('../../../../helpers/login.js').requestBuilder;
var getUser = require('../../../../helpers/login.js').getUser;
var checkUnauthenticated = require('../../../../helpers/access.js').checkUnauthenticated;


describe('/app/pins/:id page', function() {
  var sampleUserId = '0000c57d9ba7bbbb265ffdc9';
  var sampleDocumentId = '5309c57d9ba7daaa265ffdc9';
  var sampleContext = {
    "templatedDisplay": "Chuck Norris",
    "templatedQuery": "Chuck Norris",
    "recordId": "0032000001DoV22AAF",
    "recordType": "Contact"
  };

  var invalidEndpoint = '/app/pins/aze';
  var endpoint = '/app/pins/' + sampleDocumentId;

  beforeEach(cleaner);
  beforeEach(function mount() {
    AnyFetch.server.override('/document_types', mock.dir + '/get-document_types.json');
    AnyFetch.server.override('/providers', mock.dir + '/get-providers.json');
    AnyFetch.server.override('/documents', mock.dir + '/get-documents.json');
  });
  afterEach(mock.restore);

  describe('POST /app/pins/:id', function() {
    checkUnauthenticated(app, 'post', endpoint);

    it("should err on invalid document ID", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(invalidEndpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(409)
            .end(cb);
        }
      ], done);
    });

    it("should add a pin", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(204)
            .end(cb);
        },
        function searchMongo(res, cb) {
          var hash = {
            SFDCId: sampleContext.recordId,
            anyfetchId: sampleDocumentId
          };
          Pin.findOne(hash, cb);
        },
        function pinShouldExist(pin, cb) {
          should(pin).be.ok;
          cb(null);
        }
      ], done);
    });

    it("should err on duplicate pin", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(204)
            .end(rarity.carry([url], cb));
        },
        function sendRequestAgain(url, res, cb) {
          request(app)
            .post(url)
            .expect(409)
            .expect(/already pinned/i)
            .end(cb);
        }
      ], done);
    });
  });

  describe('DELETE /app/pins/:id', function() {
    checkUnauthenticated(app, 'del', endpoint);

    it("should err on invalid document ID", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(invalidEndpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .del(url)
            .expect(409)
            .end(cb);
        }
      ], done);
    });

    it("should remove an existing pin", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, cb);
        },
        function getUserId(url, cb) {
          getUser(rarity.carry([url], cb));
        },
        function addPinByHand(url, user, cb) {
          var hash = {
            SFDCId: sampleContext.recordId,
            anyfetchId: sampleDocumentId,
            createdBy: user._id
          };
          var pin = new Pin(hash);
          pin.save(function(err) {
            cb(err, url, hash);
          });
        },
        function sendRequest(url, hash, cb) {
          request(app)
            .del(url)
            .expect(202)
            .end(rarity.carryAndSlice([hash], 1, cb));
        },
        function searchMongo(hash, cb) {
          Pin.findOne(hash, cb);
        },
        function checkDeleted(pin, cb) {
          should(pin).not.be.ok;
          cb();
        }
      ], done);
    });

    it("should err on non-existing pin", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .del(url)
            .expect(404)
            .expect(/not pinned/i)
            .end(cb);
        }
      ], done);
    });

    it("should err when trying to remove someone else's pin", function(done) {
      async.waterfall([
        function addPinByHand(cb) {
          // Fake pin added by someone else
          var hash = {
            SFDCId: sampleContext.recordId,
            anyfetchId: sampleDocumentId,
            createdBy: sampleUserId
          };
          var pin = new Pin(hash);
          pin.save(rarity.slice(1, cb));
        },
        function buildRequest(cb) {
          requestBuilder(endpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .del(url)
            .expect(403)
            .expect(/cannot delete/i)
            .end(cb);
        }
      ], done);
    });
  });
});
