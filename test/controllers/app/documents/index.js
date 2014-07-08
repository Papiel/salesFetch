"use strict";

require('should');
var request = require('supertest');
var async = require('async');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner');
var requestBuilder = require('../../../helpers/login').requestBuilder;
var APIs = require('../../../helpers/APIs');
var checkUnauthenticated = require('../../../helpers/access').checkUnauthenticated;


describe.only('/app/documents page', function() {
  var endpoint = '/app/documents';

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('fetchAPI', 'https://api.anyfetch.com', done);
  });

  describe('GET /app/documents', function() {
    checkUnauthenticated(app, 'get', endpoint);

    it("should return contextual data", function(done) {
      var context = {
        recordType: 'Contact',
        recordId: '003b000000LHOj3',
        templatedQuery: 'Walter White',
        templatedDisplay: 'Walter White'
      };

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, context, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(function(res) {
              res.text.should.containDeep("Walter White");
              res.text.should.containDeep("/app/documents/5320a773bc2e51d7135f0c8f");
            })
            .end(cb);
        }
      ], done);
    });

    it("should return snippets for infinite scroll if there is a start query parameter", function(done) {

      var context = {
        recordType: 'Contact',
        recordId: '003b000000LHOj3',
        templatedQuery: 'Walter White',
        templatedDisplay: 'Walter White'
      };

      endpoint += '?start=1';

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, context, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(function(res) {
              res.text.should.containDeep("National Security");
              res.text.should.not.containDeep("<body>");
            })
            .end(cb);
        }
      ], done);
    });

    it("should display error if no template found", function(done) {

      var context = {
        recordType: 'Contact',
        recordId: '003b000000LHOj3',
        templatedDisplay: 'Walter White'
      };

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, context, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(409)
            .expect(function(res) {
              res.text.should.containDeep("a template is missing");
            })
            .end(cb);
        }
      ], done);
    });
  });
});
