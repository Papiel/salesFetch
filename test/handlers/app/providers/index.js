'use strict';

var request = require('supertest');
var async = require('async');
var should = require('should');
var AnyFetch = require('anyfetch');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner.js');
var mock = require('../../../helpers/mock.js');
var requestBuilder = require('../../../helpers/login.js').requestBuilder;
var checkUnauthenticated = require('../../../helpers/access.js').checkUnauthenticated;

describe('/app/providers page', function() {
  var endpoint = '/app/providers';

  beforeEach(cleaner);
  beforeEach(function mount() {
    AnyFetch.server.override('/providers', mock.dir + '/get-providers.json');
  });
  afterEach(mock.restore);

  describe('GET /app/providers', function() {
    checkUnauthenticated(app, 'get', endpoint);

    it("should return all providers", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(function(res) {
              var providers = res.body;
              should(providers).be.ok;
              providers.should.have.keys('providers', 'connectedProviders');
              providers.providers.should.be.an.instanceOf(Array);
            })
            .end(cb);
        }
      ], done);
    });
  });

  describe('POST /app/providers/:id', function() {
    var dropboxConnectEndpoint = endpoint + '/52bff114c8318c29e9000005';
    checkUnauthenticated(app, 'post', dropboxConnectEndpoint);

    it("should err on invalid provider id", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint + '/not_a_mongo_id', null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(409)
            .expect(/is not a valid Mongo/i)
            .end(cb);
        }
      ], done);
    });

    it("should respond with the redirect URL containing return_to", function(done) {

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(dropboxConnectEndpoint, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(200)
            .expect(/url/i)
            .expect(/bearer=anyfetchToken/i)
            .expect(/return_to/i)
            .end(cb);
        }
      ], done);
    });
  });
});
