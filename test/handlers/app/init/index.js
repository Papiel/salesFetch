'use strict';

var request = require('supertest');
var should = require('should');
var async = require('async');
var rarity = require('rarity');
var AnyFetch = require('anyfetch');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../../../../app/helpers/get-secure-hash.js');
var app = require('../../../../app.js');
var cleaner = require('../../../hooks/cleaner');
var mock = require('../../../helpers/mock.js');
var requestBuilder = require('../../../helpers/login').requestBuilder;

describe('/app/init', function() {

  beforeEach(cleaner);
  after(mock.restore);

  describe('POST /app/init', function() {
    it('should create a new user if not in DB', function(done) {
      var createdOrg;

      async.waterfall([
        function mount(cb) {
          AnyFetch.server.override('/token', mock.dir + '/get-token.json');
          AnyFetch.server.override('post', '/users', mock.dir + '/post-users.json');
          cb();
        },
        function createCompany(cb) {
          var org = new Organization({
            name: "anyFetch",
            SFDCId: '1234'
          });

          org.save(cb);
        },
        function createAdminUser(org, count, cb) {
          createdOrg = org;

          var user = new User({
            SFDCId: '5678',
            organization: org.id,
            anyFetchToken: 'anyfetchToken',
            isAdmin: true
          });

          user.save(cb);
        },
        function makeCall(user, count, cb) {
          var theUser = {
            id: 'newUser',
            name: 'Walter White',
            email: 'walter.white@breaking-bad.com'
          };

          var data = {
            organization: {id: createdOrg.SFDCId},
            user: theUser
          };
          var hash = getSecureHash(data, createdOrg.masterKey);
          data.hash = hash;

          request(app)
            .post('/app/init?data=' + encodeURIComponent(JSON.stringify(data)))
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok;
            })
            .end(rarity.slice(1, cb));
        },
        function checkUserValidity(cb) {
          User.findOne({name: 'Walter White'}, function(err, user) {
            user.should.have.property('email', 'walter.white@breaking-bad.com');
            user.should.have.property('SFDCId', 'newUser');
            user.should.have.property('anyFetchToken', 'mockedToken');
            cb();
          });
        }
      ], done);
    });

    it("should err if there's no admin in the company", function(done) {
      async.waterfall([
        function createCompany(cb) {
          var org = new Organization({
            name: "anyFetch",
            SFDCId: '1234'
          });

          org.save(cb);
        },
        // Do not create an admin for this org on purpose
        // (we want to provoke an error)
        function makeCall(org, count, cb) {
          var user = {
            id: 'newUser',
            name: 'Walter White',
            email: 'walter.white@breaking-bad.com'
          };

          var data = {
            organization: {id: org.SFDCId},
            user: user
          };
          var hash = getSecureHash(data, org.masterKey);
          data.hash = hash;

          request(app)
            .post('/app/init?data=' + encodeURIComponent(JSON.stringify(data)))
            .expect(401)
            .expect(function(res) {
              should(res.body).be.ok;
              res.body.message.should.match(/no admin for the company/i);
            })
            .end(cb);
        },
      ], done);
    });

    it('should let existing user through', function(done) {
      var context = {
        recordType: 'Contact',
        recordId: '003b000000LHOj3',
        templatedQuery: 'Walter White',
        templatedDisplay: 'Walter White'
      };
      async.waterfall([
        function buildRequest(cb) {
          requestBuilder('/app/init', context, cb);
        },
        function sendRequest(url, cb) {
          request(app)
            .post(url)
            .expect(200)
            .expect(function(res) {
              should(res.body).be.ok;
            })
            .end(cb);
        }
      ], done);
    });
  });
});
