'use strict';

var async = require('async');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');
var AnyFetch = require('anyfetch');

var cleaner = require('../hooks/cleaner');
var mock = require('../helpers/mock.js');
var deleteCompany = require('../../script/delete-company.js');

describe('Company delete script', function() {
  beforeEach(cleaner);
  after(mock.restore);

  it.only('should delete company on anyfetch', function(done) {
    var createdOrg;
    var isDeleted = false;

    async.waterfall([
      function mount(cb) {
        AnyFetch.server.override('/token', mock.dir + '/get-token.json');
        AnyFetch.server.override('get', '/subcompanies/533d9161162215a5375d34d2', mock.dir + '/get-subcompanies-by-id.json');
        AnyFetch.server.override('delete', '/subcompanies/533d9161162215a5375d34d2', function(req, res, next) {
          res.send(204);
          isDeleted = true;
          next();
        });
        cb();
      },
      function createCompany(cb) {
        var org = new Organization({
          name: "anyFetch",
          SFDCId: '1234',
          anyfetchId: '533d9161162215a5375d34d2'
        });

        org.save(cb);
      },
      function createAdminUser(org, count, cb) {
        createdOrg = org;

        var user = new User({
          SFDCId: '5678',
          organization: org.id,
          anyfetchToken: 'anyfetchToken',
          isAdmin: true
        });

        user.save(cb);
      },
      function execDeleteCompany(user, count, cb) {
        deleteCompany(createdOrg, cb);
      },
      function shouldBeDeletedAndGetLocalOrg(cb) {
        isDeleted.should.be.true;
        Organization.find({anyfetchId: '533d9161162215a5375d34d2'}, cb);
      },
      function shouldBeDeleted(orgs, cb) {
        orgs.should.have.lengthOf(0);
        cb();
      }
    ], done);
  });
});
