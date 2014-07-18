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

    it("should return an array of trusted providers", function(done) {
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
              providers.should.be.an.instanceOf(Array);
              providers.forEach(function(provider) {
                provider.should.have.property('trusted', true);
              });
            })
            .end(cb);
        }
      ], done);
    });
  });

  describe('POST /app/providers', function() {
    checkUnauthenticated(app, 'post', endpoint);

    it("should check for the presence of app_id", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(409)
            .expect(/app_id/)
            .end(cb);
        }
      ], done);
    });

    it("should redirect the user to the connection page", function(done) {
      var dropboxConnectEndpoint = endpoint + '?app_id=52bff114c8318c29e9000005';

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(dropboxConnectEndpoint, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(302)
            .expect('Location', /bearer=anyFetchToken/i)
            .end(cb);
        }
      ], done);
    });
  });
});
