'use strict';

var async = require('async');
var AnyFetch = require('anyfetch');
var mongoose = require('mongoose');
var rarity = require('rarity');

var User = mongoose.model('User');
var config = require('../config/configuration.js');


module.exports = function deleteCompany(org, cb) {
  var master;

  if(!org) {
    return cb(new Error('The company cannot be ' + org));
  }

  async.parallel([
    function deleteAnyfetchCompany(cb) {
      master = new AnyFetch(config.fetchApiCreds);
      master.deleteSubcompanyById(org.anyfetchId, rarity.slice(1, cb));
    },
    function removeLocalUsers(cb) {
      User.remove({organization: org._id}, rarity.slice(1, cb));
    },
    function removeLocalOrg(cb) {
      org.remove(rarity.slice(1, cb));
    }
  ], rarity.slice(1, cb));
};
