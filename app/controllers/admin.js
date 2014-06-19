/**
 * Administration controller
 */
'use strict';

var async = require('async');
var mongoose =require('mongoose');
var Organization = mongoose.model('Organization');

var anyFetchHelper = require('../helpers/anyfetch');



/**
 * Create a subcompany and add an admin user
 * Called one time at package installation
 */
module.exports.init = function(req, res, next) {
  async.waterfall([
    function checkParams(cb) {
      var data = req.body;
      if (!data.user || !data.organization) {
        return cb(new Error('The init account should provide user and org informations'));
      }

      cb(null, data);
    },
    function initAccount(data, cb) {
      anyFetchHelper.initAccount(data, cb);
    }
  ], function(err, createdOrg) {
    if (err) {
      return next(err);
    }

    res.send(200, createdOrg.masterKey);
  });
};

/**
 * Save in database that the package has been uninstalled
 */
module.exports.delete = function(req, res, next) {
  var data = req.body;

  async.waterfall([
    function retrieveCompany(cb) {
      if (!data.organization.id) {
        return cb({message: "Bad Request", status: 401});
      }

      Organization.findOne({SFDCId: data.organization.id}, cb);
    },
    function setDeletedOnCOmpany(org, cb) {
      if (!org) {
        return cb({message: "Bad Request", status: 401});
      }

      org.deleted = true;
      org.save(cb);
    }
  ], function(err){
    if (err) {
      return next(err);
    }

    res.send(204);
  });
};
