'use strict';

var should = require('should');
var async = require('async');
var rarity = require('rarity');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');

var getSecureHash = require('../../app/helpers/get-secure-hash.js');
var cleaner = require('../hooks/cleaner');
var mock = require('../helpers/mock.js');
var authMiddleware  = require('../../app/middlewares/ensure-valid-user.js');

describe('<Authentication middleware>', function() {
  beforeEach(cleaner);
  after(mock.restore);

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

        user.save(rarity.carry([org], cb));
      },
      function makeCall(org, user, count, cb) {
        var data = {
          organization: {id: createdOrg.SFDCId},
          user: {id: user.SFDCId}
        };
        var hash = getSecureHash(data, createdOrg.masterKey);
        data.hash = hash;

        var req = {data: data, organization: org};
        authMiddleware(req, null, function(err) {
          should(err).not.be.ok;
          should(req).have.properties('user');
          req.user.should.have.property('SFDCId', user.SFDCId);
          req.data.should.have.keys('hash', 'user', 'organization');
          cb();
        });
      }
    ], done);
  });
});
