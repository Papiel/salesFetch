"use strict";

var request = require('supertest');
var async = require('async');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner');
var requestBuilder = require('../../../helpers/login').requestBuilder;
var APIs = require('../../../helpers/APIs');
var checkUnauthenticated = require('../../../helpers/access').checkUnauthenticated;

describe('/app/providers page', function() {
  var endpoint = '/app/providers';

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('fetchAPI', 'http://api.anyfetch.com', done);
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
              res.text.toLowerCase().should.containDeep("dropbox");
              res.text.toLowerCase().should.containDeep("/providers/connect?app_id=52bff114c8318c29e9000005");
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
            .expect(function(res) {
              res.text.should.containDeep("app_id");
            })
            .end(cb);
        }
      ], done);
    });

    it("should redirect user to connection page", function(done) {
      var dropboxConnectEndpoint = endpoint + '?app_id=52bff114c8318c29e9000005';

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(dropboxConnectEndpoint, null, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(302)
            .expect(function(res) {
              res.text.should.containDeep("bearer=anyFetchToken");
              res.text.should.containDeep("52bff114c8318c29e9000005");
            })
            .end(cb);
        }
      ], done);
    });
  });
});
