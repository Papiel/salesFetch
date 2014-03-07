/**
 * Salesfoce Canvas controller
 */
'use strict';

var async = require('async');
var Mustache = require('mustache');
var _ = require('lodash');
var mongoose = require('mongoose');

var anyfetchHelpers = require('../helpers/anyfetch.js');
var salesforceHelpers = require('../helpers/salesforce.js');
var Organization = mongoose.model('Organization');


/**
 * Display Context page
 */
module.exports.contextSearch = function(req, res) {
  var context = req.session.context;
  console.log(context);
  var record;

  async.waterfall([
    function retrieveContext(cb) {
      salesforceHelpers.loadObject(context.instance_url, context.oauth_token, context.params.record_type, context.params.record_id, cb);
    },
    function retrieveProfiler(_record, cb) {
      record = _record;
      Organization.findOne({_id: req.session.user.organization}, cb);
    },
    function retrieveContextProfiler(org, cb) {
      if (!org) {
        return cb(new Error("No matching organization"));
      }

      cb(null, org.contextProfilers);
    },
    function buildQuery(contextProfilers, cb) {
      var profiler = _.find(contextProfilers, {record_type: context.params.record_type});

      if (!profiler) {
        return cb(new Error('No contextProfilers for this object'));
      }

      var search = Mustache.render(profiler.query_template, record);
      context.context_display = Mustache.render(profiler.display_template, record);

      // Retrieve documents matching the query
      anyfetchHelpers.findDocuments({search: search}, cb);
    }
  ], function(err, datas) {
    if (err) {
      return res.send(500);
    }

    res.render('app/context.html', {
      context: context,
      documents: datas
    });
  });
};

/**
 * Show full document
 */
module.exports.documentDisplay = function(req, res) {
  anyfetchHelpers.findDocument(req.params.id, function(err, document) {
    if(err) {
      return res.send(500);
    }
    res.render('app/show.html', {
      document: document
    });
  });
};
