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

if(process.argv.length < 3) {
  console.warn("You have to provide a valid ObjectId");
  process.exit(1);
}

var orgId = process.argv[2];

if(!isMongoId(orgId)) {
  console.warn('This does not look like a valid ObjectId');
  process.exit(1);
}

var deleteCompany = require('../script/delete-company.js');

async.waterfall([
  function getCompany(cb) {
    Organization.findOne({_id: mongoose.Types.ObjectId(orgId)}, cb);
  },
  function askUser(org, cb) {
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
        console.log('Aborted.');
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
  console.log('Done!');
  return process.exit(0);
});
