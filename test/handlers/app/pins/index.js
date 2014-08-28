"use strict";

var request = require('supertest');
var async = require('async');
var AnyFetch = require('anyfetch');

var mongoose = require('mongoose');
var Pin = mongoose.model('Pin');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner.js');
var mock = require('../../../helpers/mock.js');
var requestBuilder = require('../../../helpers/login.js').requestBuilder;
var checkUnauthenticated = require('../../../helpers/access.js').checkUnauthenticated;


describe('/app/pins page', function() {
  var endpoint = '/app/pins';

  beforeEach(cleaner);
  beforeEach(function mount() {
    AnyFetch.server.override('/document_types', mock.dir + '/get-document_types.json');
    AnyFetch.server.override('/providers', mock.dir + '/get-providers.json');
    AnyFetch.server.override('/documents', mock.dir + '/get-documents.json');
  });
  afterEach(mock.restore);

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
          requestBuilder(endpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .end(cb);
        },
        function testNoContent(res, cb) {
          res.body.should.have.properties({
            count: 0,
            data: []
          });
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
          requestBuilder(endpoint, sampleContext, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(/SecuringtheData/i)
            .end(cb);
        }
      ], done);
    });
  });
});
