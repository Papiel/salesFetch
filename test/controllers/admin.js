'use strict';

require("should");

var async = require('async');
var request = require('supertest');
var app = require('../../app.js');
var APIs = require('../helpers/APIs');
var cleaner = require('../hooks/cleaner');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Organization = mongoose.model('Organization');


describe('<Admin controller>', function() {

  describe('POST /admin/init', function() {
    var endpoint = '/admin/init';
    var SFDCinfos = {
      user: {
        name: 'Jessy Pinkman',
        id: '5678',
        email: 'jessy.pinkman@breaking-bad.com'
      },
      organization: {
        name: 'Breaking Bad',
        id: '1234'
      }
    };

    beforeEach(cleaner);
    beforeEach(function(done) {
      APIs.mount('fetchAPI', 'http://api.anyfetch.com', done);
    });

    it('should create a user and a company', function(done) {
      var generatedMasterKey;

      // Fake request
      request(app)
        .post(endpoint)
        .send(SFDCinfos)
        .expect(200)
        .end(function(err, res) {
          if(err) {
            throw err;
          }

          async.waterfall([
            function findCompany(cb) {
              Organization.find({}, cb);
            },
            function checkCompany(orgs, cb) {
              orgs.length.should.eql(1);

              var o = orgs[0];
              o.should.have.property('name', 'Breaking Bad');
              o.should.have.property('SFDCId', '1234');
              o.should.have.property('anyFetchId', '533d9161162215a5375d34d2');
              generatedMasterKey = o.masterKey;

              cb(null, o);
            },
            function findUser(org, cb) {
              User.find({}, function(err, users) {
                cb(err, org, users);
              });
            },
            function checkUsers(org, users, cb) {
              users.length.should.eql(1);

              var u = users[0];

              u.should.have.property('name','Jessy Pinkman');
              u.should.have.property('SFDCId', '5678');
              u.should.have.property('anyFetchId', '533d6b2a6355285e5563d005');
              u.should.have.property('email', 'jessy.pinkman@breaking-bad.com');
              u.should.have.property('anyFetchToken', 'mockedToken');
              u.should.have.property('organization', org._id);
              u.should.have.property('isAdmin', true);

              cb();
            },
            function compareMasterKeys(cb) {
              res.text.should.eql(generatedMasterKey);

              cb();
            }
          ], done);
        });
    });

    it('should return the same masterKey if package is reinstalled', function(done) {
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
            .post(endpoint)
            .send(SFDCinfos)
            .expect(function(res){
              res.text.should.eql(org.masterKey);
            })
            .end(cb);
        }
      ], done);
    });
  });

  describe('POST /admin/delete', function() {
    var endpoint = '/admin/delete';

    beforeEach(cleaner);

    it('should set the org to deleted', function(done) {
      var SFDCinfos = {
        organization: {
          name: 'Breaking Bad',
          id: '1234'
        }
      };

      async.waterfall([
        function createOrg(cb) {
          var org = new Organization({
            name: SFDCinfos.organization.name,
            SFDCId: SFDCinfos.organization.id
          });

          org.save(cb);
        },
        function deleteAccount(res, count, cb) {
          request(app)
            .post(endpoint)
            .send(SFDCinfos)
            .expect(204)
            .end(cb);
        },
        function retrieveOrg(res, cb){
          Organization.findOne({SFDCId: SFDCinfos.organization.id}, cb);
        },
        function checkIfDeleted(org, cb){
          org.should.have.property('deleted', true);
          cb();
        }
      ], done);
    });
  });
});
