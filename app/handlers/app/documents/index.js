'use strict';

var restify = require("restify");
var async = require("async");
var _ = require("lodash");
var moment = require("moment");

var anyfetchHelpers = require('../../../helpers/anyfetch.js');
var salesfetchHelpers = require('../../../helpers/salesfetch.js');

/**
 * Display Context page
 */
module.exports.get = function(req, res, next) {
  if(!req.data.context || !req.data.context.templatedQuery || !req.data.context.templatedDisplay) {
    return next(new restify.MissingParameterError('Check your context profiler configuration, a template is missing.'));
  }

  var params = {
    sort: '-creationDate',
    search: req.data.context.templatedQuery
  };

  var filters;
  if (req.query.filters) {
    filters = JSON.parse(req.query.filters);
    params = _.merge(params, filters);
  }

  if(req.query.start) {
    params.start = req.query.start;
  }

  async.waterfall([
    function updateDocuments(cb) {
      anyfetchHelpers.updateAccount(req.user, cb);
    },
    function retrieveDocument(res, cb) {
      anyfetchHelpers.findDocuments(params, req.user, cb);
    },
    function markPinned(documents, cb) {
      salesfetchHelpers.markIfPinned(req.data.context.recordId, documents, cb);
    }
  ], function(err, documents) {
    if(err) {
      return next(err);
    }

    var timeSlices = [{
      label: 'Today',
      maxDate: moment().startOf('day'),
      data: []
    }, {
      label: 'Earlier this Week',
      maxDate: moment().startOf('week'),
      data: []
    }, {
      label: 'Earlier this Month',
      maxDate: moment().startOf('month'),
      data: []
    }, {
      label: 'Earlier this Year',
      maxDate: moment().startOf('year'),
      data: []
    }, {
      label: 'Last Year',
      maxDate: moment().startOf('year').subtract('year', 1),
      data: []
    }, {
      label: 'Older',
      data: []
    }];

    documents.data.forEach(function(doc) {
      var creationDate = moment(doc.creation_date);
      var found = false;
      for (var i = 0; i < timeSlices.length && !found; i+=1) {
        if (i === 0 && creationDate.isAfter(timeSlices[i].maxDate)) {
          found = true;
          timeSlices[i].data.push(doc);
        }

        if(!found && (!timeSlices[i].maxDate || creationDate.isAfter(timeSlices[i].maxDate))) {
          found = true;
          timeSlices[i].data.push(doc);
        }
      }
    });
    documents.faceted = timeSlices;

    // If load more results
    if (req.query.start) {
      return res.send(documents);
    }

    res.send({ documents: documents, filters: filters });
  });
};
