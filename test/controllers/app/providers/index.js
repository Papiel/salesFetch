'use strict';

var request = require('supertest');
var async = require('async');
var should = require('should');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner.js');
var mock = require('../../../helpers/mock.js');
var requestBuilder = require('../../../helpers/login.js').requestBuilder;
var checkUnauthenticated = require('../../../helpers/access.js').checkUnauthenticated;

describe('/app/providers page', function() {
  var endpoint = '/app/providers';

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('anyfetch', 'https://api.anyfetch.com', done);
  });

  describe('GET /app/providers', function() {
    beforeEach(function(done) {
      APIs.mount('manager', 'https://manager.anyfetch.com', done);
    });
    checkUnauthenticated(app, 'get', endpoint);

    it("should return all providers", function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, null, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok;
              res.body.should.have.keys('providers', 'connectedProviders');
              res.body.providers.should.be.an.instanceOf(Array);
              res.body.providers[0].should.have.property('name', 'Dropbox');
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
          requestBuilder(endpoint, null, null, cb);
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
          requestBuilder(dropboxConnectEndpoint, null, null, cb);
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
