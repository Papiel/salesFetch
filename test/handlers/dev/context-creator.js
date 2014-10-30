'use strict';

var should = require('should');
var request = require('supertest');
var async = require('async');

var app = require('../../../app.js');
var config = require('../../../config/configuration');
var cleaner = require('../../hooks/cleaner');
var requestBuilder = require('../../helpers/login').requestBuilder;
var _ = require('lodash');

describe('/dev/context-creator (dev only)', function() {
  describe('GET /dev/context-creator', function() {
    var endpoint = '/dev/context-creator?token=anyfetchToken&code=' + config.code;

    before(cleaner);
    it('should return a valid context', function(done) {
      async.waterfall([
        function prepare(cb) {
          // This function instanciates a dummy org and user for us
          requestBuilder(endpoint, {}, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(endpoint)
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok.and.have.properties('prefix', 'url', 'json');
              var json = res.body.json;
              json.should.have.properties('user', 'organization', 'hash', 'context');
              json.user.should.have.properties('id');
              json.organization.should.have.properties('id');
            })
            .end(cb);
        }
      ], done);
    });

    after(cleaner);
  });

  describe('POST /dev/context-creator', function() {
    var endpoint = '/dev/context-creator?token=anyfetchToken&code=' + config.code;
    var dummyContext;
    var prefix = '/';

    before(function obtainContext(done) {
      async.waterfall([
        function prepare(cb) {
          // This function instanciates a dummy org and user for us
          requestBuilder(endpoint, {}, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(endpoint)
            .expect(200)
            .end(cb);
        },
        function extractContext(res, cb) {
          dummyContext = res.body.json;
          cb(null);
        }
      ], done);
    });

    it('should err on missing `data` key', function(done) {
      request(app)
        .post(endpoint)
        .send({prefix: prefix})
        .expect(409)
        .end(function(err, res) {
          should(res.body.message).be.ok.and.match(/missing `data` key/i);
          done();
        });
    });

    it('should err on missing `data.organization.id` key', function(done) {
      var context = _.merge({}, dummyContext);
      delete context.organization;

      request(app)
        .post(endpoint)
        .send({prefix: prefix, data: context})
        .expect(409)
        .end(function(err, res) {
          should(res.body.message).be.ok.and.match(/missing `data.organization` key/i);
          done();
        });
    });

    it('should err on invalid JSON', function(done) {
      var context = _.merge({}, dummyContext);
      delete context.organization;
      // Generate invalid JSON
      var string = JSON.stringify(context);
      string = string.slice(1);

      request(app)
        .post(endpoint)
        .send({prefix: prefix, data: string})
        .expect(422)
        .end(function(err, res) {
          should(res.body.message).be.ok.and.match(/invalid json/i);
          done();
        });
    });

    it('should err on nonexistant organization', function(done) {
      var context = _.merge({}, dummyContext);
      context.organization.id = 'nonexistant';

      request(app)
        .post(endpoint)
        .send({prefix: prefix, data: context})
        .expect(404)
        .end(function(err, res) {
          should(res.body.message).be.ok.and.match(/no org with sfdcid/i);
          done();
        });
    });

    it('should compute a hash for a valid context', function(done) {
      var context = _.merge({}, dummyContext);
      context.context.templatedQuery = 'Unicorns';
      context.context.templatedDisplay = '<u>Unicorns</u>';

      request(app)
        .post(endpoint)
        .send({prefix: prefix, data: context})
        .expect(200)
        .expect(function(res) {
          should(res.body).be.ok;
          should(res.body.json).have.properties('hash');
        })
        .end(done);
    });

    after(cleaner);
  });
});
