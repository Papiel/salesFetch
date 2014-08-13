'use strict';

var should = require('should');
var rarity = require('rarity');
var async = require('async');
var request = require('supertest');
var AnyFetch = require('anyfetch');

var config = require('../../config/configuration.js');
var app = require('../../app.js');

var cleaner = require('../hooks/cleaner');
var mock = require('../helpers/mock.js');
var requestBuilder = require('../helpers/login').requestBuilder;
var getOrganization = require('../helpers/login').getOrganization;

describe('<Company updates>', function() {
  var endpoint = '/app/documents';
  var context = {
    recordType: 'Contact',
    recordId: '003b000000LHOj3',
    templatedQuery: 'Walter White',
    templatedDisplay: 'Walter White'
  };

  var updatesCount = 0;
  var mockUpdate = function(req, res, next) {
    updatesCount += 1;
    res.send(200);
    next();
  };

  beforeEach(cleaner);
  beforeEach(function mountMock() {
    AnyFetch.server.override('/documents', mock.dir + '/get-documents.json');
    AnyFetch.server.override('POST', '/company/update', mockUpdate);

    updatesCount = 0;
  });
  after(mock.restore);

  it('should trigger an update when the org has not been updated for a while', function(done) {
    async.waterfall([
      function buildRequest(cb) {
        requestBuilder(endpoint, context, cb);
      },
      function sendRequest(url, cb) {
        request(app)
          .get(url)
          .expect(200)
          .expect(function() {
            updatesCount.should.eql(1);
          })
          .end(rarity.slice(1, cb));
      },
      function getTestOrganization(cb) {
        getOrganization(cb);
      },
      function checkLastUpdatedDate(org, cb) {
        should(org).be.ok;
        // The org should have been updated less than a second ago
        should(Date.now() - org.lastUpdated).be.lessThan(1000);
        cb();
      }
    ], done);
  });

  it('should not trigger an update otherwise', function(done) {
    var fakeDate = new Date(Date.now() - config.companyUpdateDelay / 2);

    async.waterfall([
      function buildRequest(cb) {
        requestBuilder(endpoint, context, cb);
      },
      function getTestOrganization(url, cb) {
        getOrganization(rarity.carry(url, cb));
      },
      function fakeUpdatedDate(url, org, cb) {
        org.lastUpdated = fakeDate;
        org.save(rarity.carryAndSlice([url], 2, cb));
      },
      function sendRequest(url, cb) {
        request(app)
          .get(url)
          .expect(200)
          .expect(function() {
            updatesCount.should.eql(0);
          })
          .end(rarity.slice(1, cb));
      },
      function getTestOrganization(cb) {
        getOrganization(cb);
      },
      function checkLastUpdatedDate(org, cb) {
        should(org).be.ok;
        // The org should keep its (recent) date
        org.should.have.property('lastUpdated', fakeDate);
        cb();
      }
    ], done);
  });

});
