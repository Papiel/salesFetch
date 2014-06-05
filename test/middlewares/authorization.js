'use strict';

require("should");
var async = require('async');
var mongoose = require('mongoose');
var crypto = require('crypto');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var APIs = require('../helpers/APIs');
var factories = require('../helpers/factories');
var cleaner = require('../hooks/cleaner');
var authMiddleware  = require('../../app/middlewares/authorization').requiresLogin;

var secureKey = require('../../config/configuration.js').secureKey;

describe('<Authentication middleware>', function() {

  beforeEach(cleaner);

  it('should reject empty calls', function(done) {
    var res;
    var req = {
      query: []
    };

    authMiddleware(req, res, function(next) {
      next.status.should.eql(401);
      done();
    });
  });

  it('should send message if no company has been found', function(done) {
    var res;
    var req = {
      query: {}
    };

    var params = {
      organization: {
        id: '00Db0000000dVoIEAU'
      }
    };

    req.query.data = JSON.stringify(params);

    authMiddleware(req, res, function(next) {
      next.status.should.eql(401);
      next.message.should.match(/company/);
      done();
    });
  });


  it('should reject call if the hash doesn\'t match', function(done) {

    async.waterfall([
      function createCompany(cb) {
        factories.initAccount(cb);
      },
      function makeCall(user, org, cb) {
        var hash = org.SFDCId + user.SFDCId + secureKey;
        hash = crypto.createHash('sha1').update(hash).digest("base64");

        var authObj = {
          hash: hash,
          organization: {id: org.SFDCId},
          user: {id: user.userId}
        };

        var req = {
          query: {
            data: JSON.stringify(authObj)
          }
        };

        authMiddleware(req, null, function(next) {
          next.status.should.eql(401);
          next.message.should.match(/Master Key/);
          cb();
        });
      }
    ], done);
  });

  it('should create a new user if not in DB', function(done) {
    var createdOrg;

    async.waterfall([
      function mountAPI(cb) {
        APIs.mount('fetchAPI', 'http://api.anyfetch.com', cb);
      },
      function createCompany(api, cb) {
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
        var hash = createdOrg.SFDCId + 'newUser' + createdOrg.masterKey + secureKey;
        hash = crypto.createHash('sha1').update(hash).digest("base64");

        var authObj = {
          hash: hash,
          organization: {id: createdOrg.SFDCId},
          user: {
            id: 'newUser',
            name: 'Walter White',
            email: 'walter.white@breaking-bad.com'
          }
        };

        var req = {
          query: {
            data: JSON.stringify(authObj)
          }
        };

        authMiddleware(req, null, cb);
      }, function CheckUserValidity(cb) {
        User.findOne({name: 'Walter White'}, function(err, user) {
          user.should.have.property('email', 'walter.white@breaking-bad.com');
          user.should.have.property('SFDCId', 'newUser');
          user.should.have.property('anyFetchToken', 'mockedToken');
          cb();
        });
      }
    ], done);
  });

  it('should pass variable in request', function(done) {
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
        var hash = createdOrg.SFDCId + user.SFDCId + createdOrg.masterKey + secureKey;
        hash = crypto.createHash('sha1').update(hash).digest("base64");

        var authObj = {
          hash: hash,
          organization: {id: createdOrg.SFDCId},
          user: {id: user.SFDCId}
        };

        var req = {
          query: {
            data: JSON.stringify(authObj)
          }
        };

        authMiddleware(req, null, function() {
          req.user.should.have.property('SFDCId', user.SFDCId);
          req.reqParams.should.have.keys('hash', 'user', 'organization');
          cb();
        });
      }
    ], done);
  });
});
