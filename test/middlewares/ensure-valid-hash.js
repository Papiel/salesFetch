'use strict';

var should = require('should');
var async = require('async');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../../app/helpers/get-secure-hash.js');
var factories = require('../helpers/factories');
var cleaner = require('../hooks/cleaner');
var mock = require('../helpers/mock.js');
var ensureValidHashMiddleware  = require('../../app/middlewares/ensure-valid-hash');

describe('<EnsureValidHash middleware>', function() {
  beforeEach(cleaner);
  after(mock.restore);

  it('should err if no company has been found', function(done) {
    var data = {
      organization: {
        id: '00Db0000000dVoIEAU'
      }
    };

    var req = {data: data};
    ensureValidHashMiddleware(req, null, function(err) {
      should(err).be.ok;
      err.statusCode.should.equal(401);
      err.message.should.match(/Master Key/i);
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

        var req = {data: data};
        ensureValidHashMiddleware(req, null, function(err) {
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

        var req = {data: data};
        ensureValidHashMiddleware(req, null, function(err) {
          should(err).be.ok;
          err.statusCode.should.equal(401);
          err.message.should.match(/Master Key/i);
          cb();
        });
      }
    ], done);
  });

  it('should pass variables in `req` object', function(done) {
    var createdOrg;

    async.waterfall([
      function createCompany(cb) {
        var org = new Organization({
          name: "anyfetch",
          SFDCId: '1234'
        });
        org.save(cb);
      },
      function createUser(org, count, cb) {
        createdOrg = org;

        var user = new User({
          SFDCId: '5678',
          name: 'Walter White',
          email: 'walter.white@breaking-bad.com',
          organization: org.id
        });

        user.save(cb);
      },
      function makeCall(user, count, cb) {
        var data = {
          organization: {id: createdOrg.SFDCId},
          user: {id: user.SFDCId}
        };
        var hash = getSecureHash(data, createdOrg.masterKey);
        data.hash = hash;

        var req = {data: data};
        ensureValidHashMiddleware(req, null, function(err) {
          should(err).not.be.ok;
          should(req).have.properties('organization', 'data');
          req.data.should.have.keys('hash', 'user', 'organization');
          cb();
        });
      }
    ], done);
  });
});
