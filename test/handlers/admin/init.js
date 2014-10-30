'use strict';

require("should");

var async = require('async');
var request = require('supertest');
var AnyFetch = require('anyfetch');

var app = require('../../../app.js');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var cleaner = require('../../hooks/cleaner');
var mock = require('../../helpers/mock');
var config = require('../../../config/configuration');


describe('/admin/init endpoint', function() {
  var endpoint = '/admin/init';

  beforeEach(cleaner);
  before(function mount() {
    AnyFetch.server.override('/token', mock.dir + '/get-token.json');
    AnyFetch.server.override('post', '/users', mock.dir + '/post-users.json');
    AnyFetch.server.override('post', '/subcompanies', mock.dir + '/post-subcompanies.json');
  });
  after(mock.restore);

  describe('POST /admin/init', function() {
    var SFDCinfos = {
      user: {
        name: 'jessy.pinkman@breaking-bad.com',
        id: '5678',
        email: 'jessy.pinkman@breaking-bad.com'
      },
      organization: {
        name: 'Breaking Bad',
        id: '1234'
      }
    };

    it('should err on missing key', function(done) {
      var incompleteData = {
        user: null,
        organization: {
          name: 'Breaking Bad',
          id: '1234'
        }
      };

      async.waterfall([
        function pokeEndpoint(cb) {
          request(app)
            .post(endpoint)
            .send(incompleteData)
            .expect(401)
            .expect(/unknown secret key/i)
            .end(cb);
        }
      ], done);
    });

    it('should err on missing user parameter', function(done) {
      var incompleteData = {
        user: null,
        organization: {
          name: 'Breaking Bad',
          id: '1234'
        }
      };

      async.waterfall([
        function pokeEndpoint(cb) {
          request(app)
            .post(endpoint + '?secret_key=' + config.secretKey)
            .send(incompleteData)
            .expect(409)
            .expect(/should provide user/i)
            .end(cb);
        }
      ], done);
    });

    it('should create a user and a company', function(done) {
      var masterKey;
      var generatedMasterKey;

      async.waterfall([
        function pokeEndpoint(cb) {
          // Fake request to our app
          request(app)
            .post(endpoint + '?secret_key=' + config.secretKey)
            .send(SFDCinfos)
            .expect(200)
            .end(cb);
        },
        function findCompany(res, cb) {
          masterKey = res.body;
          Organization.find({}, cb);
        },
        function checkCompany(orgs, cb) {
          orgs.length.should.eql(1);

          var o = orgs[0];
          o.should.have.property('SFDCData').and.have.property('name', 'Breaking Bad');
          o.should.have.property('SFDCId', '1234');
          o.should.have.property('anyFetchId', '533d9161162215a5375d34d2');
          generatedMasterKey = o.masterKey;

          cb(null, o);
        },
        function findUsers(org, cb) {
          User.find({}, function(err, users) {
            cb(err, org, users);
          });
        },
        function checkUsers(org, users, cb) {
          users.length.should.eql(1);

          var u = users[0];
          u.should.have.property('SFDCData');
          u.SFDCData.should.have.property('name', 'jessy.pinkman@breaking-bad.com');
          u.SFDCData.should.have.property('email', 'jessy.pinkman@breaking-bad.com');
          u.should.have.property('SFDCId', '5678');
          u.should.have.property('anyFetchId', '533d6b2a6355285e5563d005');
          u.should.have.property('anyFetchToken', 'mockedToken');
          u.should.have.property('anyFetchEmail', '1414584211623@salesfetch.com');
          u.should.have.property('organization', org._id);
          u.should.have.property('isAdmin', true);

          cb();
        },
        function compareMasterKeys(cb) {
          masterKey.should.eql(generatedMasterKey);
          cb();
        }
      ], done);
    });

    it('should not return the masterKey if package is already installed', function(done) {
      async.waterfall([
        function initCompany(cb) {
          var org = new Organization({
            name: SFDCinfos.organization.name,
            SFDCId: SFDCinfos.organization.id
          });

          org.save(cb);
        },
        function checkKey(org, count, cb) {
          request(app)
            .post(endpoint + '?secret_key=' + config.secretKey)
            .send(SFDCinfos)
            .expect(403)
            .expect(/already exists/)
            .end(cb);
        }
      ], done);
    });
  });
});
