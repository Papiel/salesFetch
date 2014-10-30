'use strict';

var async = require('async');
var AnyFetch = require('anyfetch');
var mongoose = require('mongoose');

var User = mongoose.model('User');


module.exports = function deleteCompany(org, cb) {
  var anyfetchAdmin;

  async.waterfall([
    function retrieveAdminToken(cb) {
      User.findOne({organization: org._id, isAdmin: true}, cb);
    },
    function getAnyfetchCompany(adminUser, cb) {
      if(!adminUser) {
        return cb(new Error('No admin for the company has been found'));
      }
      anyfetchAdmin = new AnyFetch(adminUser.anyfetchToken);
      anyfetchAdmin.getSubcompanyById(mongoose.Types.ObjectId(org.anyfetchId), cb);
    },
    function deleteAnyfetchCompany(company, cb) {
      anyfetchAdmin.deleteSubcompanyById(mongoose.Types.ObjectId(org.anyfetchId), cb);
    },
    function(res, cb) {
      org.remove(function(err) {
        cb(err);
      });
    }
  ], cb);
};
