'use strict';

var should = require('should');
var request = require('supertest');
var async = require('async');

var app = require('../../../app.js');
var cleaner = require('../../hooks/cleaner');
var requestBuilder = require('../../helpers/login').requestBuilder;

describe('/context-creator (dev only)', function() {

  beforeEach(cleaner);

  describe('GET /', function() {
    var endpoint = '/';

    it('should redirect to /context-creator', function(done) {
      request(app)
        .get(endpoint)
        .expect(302)
        .expect('Location', '/context-creator')
        .end(done);
    });
  });

  describe('GET /context-creator', function() {
    var endpoint = '/context-creator';

    it('should return a valid context', function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, {}, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(endpoint)
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok;
              res.body.should.have.properties('user', 'organization', 'hash', 'context', 'url');
              res.body.user.should.have.properties('id');
              res.body.organization.should.have.properties('id');
            })
            .end(cb);
        }
      ], done);
    });
  });
});
