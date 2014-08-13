'use strict';

var should = require('should');
var async = require('async');
var AnyFetch = require('anyfetch');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../../app/helpers/get-secure-hash.js');
var factories = require('../helpers/factories');
var cleaner = require('../hooks/cleaner');
var mock = require('../helpers/mock.js');
var authMiddleware  = require('../../app/middlewares/authorization').requiresLogin;

describe('<Authentication middleware>', function() {
  beforeEach(cleaner);
  after(mock.restore);

  it('should reject empty calls', function(done) {
    var req = { query: [] };
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/missing `data` query parameter/i);
      done();
    });
  });

  it('should err on missing organization id', function(done) {
    var params = {
      organization: {
        id: null
      }
    };

    var req = { query: { data: JSON.stringify(params) } };
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/missing organization id/i);
      done();
    });
  });

  it('should err if no company has been found', function(done) {
    var params = {
      organization: {
        id: '00Db0000000dVoIEAU'
      }
    };

    var req = { query: { data: JSON.stringify(params) } };
    authMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/no company matching this id/i);
      done();
    });
  });

  it("should reject call if the hash is missing the organization's master key", function(done) {
    async.waterfall([
      function createCompany(cb) {
        factories.initAccount(cb);
      },
      function makeCall(user, org, cb) {
        var data = {
          organization: {id: org.SFDCId},
          user: {id: user.SFDCId}
        };
        var invalidHash = getSecureHash(data, '');
        data.hash = invalidHash;

        var req = { query: { data: JSON.stringify(data) } };
        authMiddleware(req, null, function(err) {
          should(err).be.ok;
          err.statusCode.should.equal(401);
          err.message.should.match(/Master Key/i);
          cb();
        });
      }
    ], done);
  });

  it('should reject call if the request is tampered with', function(done) {
    async.waterfall([
      function createCompany(cb) {
        factories.initAccount(cb);
      },
      function makeCall(user, org, cb) {
        var data = {
          context: {
            templatedDisplay: 'Matthieu Bacconnier',
            templatedQuery: 'Matthieu Bacconnier',
            recordId: '0032000001DoV22AAF',
            recordType: 'Contact'
          },
          organization: {id: org.SFDCId},
          user: {id: user.SFDCId}
        };
        var initialHash = getSecureHash(data, org.masterKey);
        data.hash = initialHash;

        // Tamper with the request
        data.context.templatedQuery = 'Unicorns';

        var req = { query: { data: JSON.stringify(data) } };
        authMiddleware(req, null, function(err) {
          should(err).be.ok;
          err.statusCode.should.equal(401);
          err.message.should.match(/Master Key/i);
          cb();
        });
      }
    ], done);
  });

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

        var query = { data: JSON.stringify(data) };
        authMiddleware({ query: query }, null, cb);
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
          organization: {id: org.SFDCId },
          user: user
        };
        var hash = getSecureHash(data, org.masterKey);
        data.hash = hash;

        var query = { data: JSON.stringify(data) };
        authMiddleware({ query: query }, null, cb);
      }
    ], function expectError(err) {
      should(err).be.ok;
      err.statusCode.should.eql(401);
      err.message.should.match(/no admin for the company/i);
      done();
    });
  });

  it('should pass variables in `req` object', function(done) {
    var createdOrg;

    async.waterfall([
      function createCompany(cb) {
        var org = new Organization({
          name: "anyFetch",
          SFDCId: '1234'
        });

        org.save(cb);
      }, function createUser(org, _, cb) {
        createdOrg = org;

        var user = new User({
          SFDCId: '5678',
          name: 'Walter White',
          email: 'walter.white@breaking-bad.com',
          organization: org.id
        });

        user.save(cb);
      },function makeCall(user, _, cb) {
        var data = {
          organization: {id: createdOrg.SFDCId },
          user: { id: user.SFDCId }
        };
        var hash = getSecureHash(data, createdOrg.masterKey);
        data.hash = hash;

        var req = { query: { data: JSON.stringify(data) } };
        authMiddleware(req, null, function() {
          should(req).have.properties('user', 'data');
          req.user.should.have.property('SFDCId', user.SFDCId);
          req.data.should.have.keys('hash', 'user', 'organization');
          cb();
        });
      }
    ], done);
  });
});
