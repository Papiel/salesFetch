'use strict';

var should = require('should');
var request = require('supertest');
var async = require('async');
var rarity = require('rarity');

var mongoose = require('mongoose');
var Pin = mongoose.model('Pin');

var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner');
var requestBuilder = require('../../../helpers/login').requestBuilder;
var getUser = require('../../../helpers/login').getUser;
var APIs = require('../../../helpers/APIs');
var checkUnauthenticated = require('../../../helpers/access').checkUnauthenticated;

describe('/app/documents page', function() {
  var endpoint = '/app/documents';
  var context = {
    recordType: 'Contact',
    recordId: '003b000000LHOj3',
    templatedQuery: 'Walter White',
    templatedDisplay: 'Walter White'
  };

  beforeEach(cleaner);
  beforeEach(function(done) {
    APIs.mount('anyfetch', 'https://api.anyfetch.com', done);
  });

  describe('GET /app/documents', function() {
    checkUnauthenticated(app, 'get', endpoint);

    it('should return a list of documents', function(done) {
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, context, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok;
              res.body.should.have.keys('documents', 'filters');
              res.body.documents.should.have.properties('facets', 'data');
            })
            .end(cb);
        }
      ], done);
    });

    it('should return snippets for infinite scroll if there is a start query parameter', function(done) {
      var endpointWithStart = endpoint + '?start=1';

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpointWithStart, context, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok;
              res.body.should.have.properties('facets', 'data');
              res.text.should.containDeep('National Security');
            })
            .end(cb);
        }
      ], done);
    });

    it('should mark pinned documents as pinned', function(done) {
      var url;
      var pinnedId = '5320a773bc2e51d7135f0c8f';

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, context, null, cb);
        },
        function getTestUser(theUrl, cb) {
          url = theUrl;
          getUser(cb);
        },
        function addPin(user, cb) {
          var pin = new Pin({
            createdBy: user.id,
            SFDCId: context.recordId,
            anyFetchId: pinnedId
          });

          pin.save(rarity.slice(1, cb));
        },
        function sendRequest(cb) {
          should(url).be.ok;
          request(app)
            .get(url)
            .expect(200)
            .end(cb);
        },
        function checkPinnedDocument(res, cb) {
          should(res.body).be.ok;
          should(res.body.documents).be.ok;
          should(res.body.documents.data).be.ok;

          var docs = res.body.documents.data;
          var pinnedDoc;
          docs.forEach(function(doc) {
            if(doc.id === pinnedId) {
              pinnedDoc = doc;
            }
          });
          should(pinnedDoc).be.ok;
          pinnedDoc.should.have.properties({ pinned: true });
          cb();
        }
      ], done);
    });

    it('should apply filters', function(done) {
      var filters = {
        provider: '5320a682c8318cba94000040'
      };

      async.waterfall([
        function buildRequest(cb) {
          requestBuilder(endpoint, context, null, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .get(url)
            .query({ filters: filters })
            .expect(200)
            .end(cb);
        },
        function checkResponse(res, cb) {
          should(res.body).be.ok;
          res.body.should.have.keys('documents', 'filters');
          res.body.documents.should.have.property('data');

          var docs = res.body.documents.data;
          docs.should.not.be.empty;
          docs.forEach(function(doc) {
            doc.should.have.property('provider');
            doc.provider.should.have.properties({
              name: 'Dropbox'
            });
          });
          cb();
        }
      ], done);
    });

    it('should err if no template is found', function(done) {
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
            .expect(/a template is missing/i)
            .end(cb);
        }
      ], done);
    });
  });
});
