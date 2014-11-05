#!/bin/env node
'use strict';
/*
 * Delete a company from salesfetch and anyfetch
 */

// Ensure app is loaded
require('../app.js');

var async = require('async');
var inquirer = require('inquirer');
var mongoose = require('mongoose');
var Organization = mongoose.model('Organization');

var isMongoId = require('../app/helpers/is-mongo-id.js');

var log = function(message, type) {
  var types = {
    info: {
      color: 36,
      symbol: 'i',
      console: 'info'
    },
    warning: {
      color: 33,
      symbol: '!',
      console: 'warn'
    },
    error: {
      color: 31,
      symbol: '✗',
      console: 'error'
    },
    success: {
      color: 32,
      symbol: '✓',
      console: 'log'
    }
  };
  if(!type || Object.keys(types).indexOf(type) === -1) {
    type = 'info';
  }
  message = '\x1b[' + types[type].color + 'm' + types[type].symbol + ' \x1b[39;1m' + message + '\x1b[0m';
  console[types[type].console](message);
};


if(process.argv.length < 3) {
  log('You have to provide a valid ObjectId', 'error');
  process.exit(1);
}

var orgId = process.argv[2];

if(!isMongoId(orgId)) {
  log('This does not look like a valid ObjectId', 'error');
  process.exit(1);
}

var deleteCompany = require('../script/delete-company.js');

async.waterfall([
  function getCompany(cb) {
    Organization.findOne({_id: mongoose.Types.ObjectId(orgId)}, cb);
  },
  function askUser(org, cb) {
    if(!org) {
      log('Organization not found.\n  Please not that the argument is the salesfetch Organization id, and not the anyfetch id.', 'error');
      return process.exit(1);
    }
    console.log('');
    console.log(org);
    console.log('');
    inquirer.prompt([
      {
        type: 'confirm',
        message: 'You are about te delete this company from salesfetch and anyfetch databases.\n  All documents will be lost, and this cannot be reverted.\n\n  Are you sure ?',
        default: false,
        name: 'confirm'
      }
    ], function(answers) {
      if(!answers.confirm) {
        log('Aborted.', 'info');
        return process.exit(0);
      }
      cb(null, org);
    });
  },
  deleteCompany
], function(err) {
  if(err) {
    throw err;
  }
  log('Done!', 'success');
  return process.exit(0);
});
