/**
 * Salesfoce Canvas controller
 */
'use strict';

var anyfetchHelpers = require('../helpers/anyfetch.js');
var salesfetchHelpers = require('../helpers/salesfetch.js');
var async = require("async");
var _ = require("lodash");
var moment = require("moment");

/**
 * Display Context page
 */
module.exports.contextSearch = function(req, res, next) {
  var reqParams = req.reqParams;

  if(!reqParams.context || !reqParams.context.templatedQuery || !reqParams.context.templatedDisplay) {
    return next(new Error('Check your context profiler configuration, a template is missing.'));
  }

  var params = {
    sort: '-creationDate',
    search: reqParams.context.templatedQuery
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
    // TODO: set the boolean `pinned` property on each document
    //function markPinned(docs, cb) {
    //  cb(null, docs);
    //}
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

        if(!timeSlices[i].maxDate || creationDate.isAfter(timeSlices[i].maxDate)) {
          found = true;
          timeSlices[i].data.push(doc);
        }
      }
    });
    documents.faceted = timeSlices;

    res.render('app/context/' + req.deviceType + '.html', {
      data: reqParams,
      documents: documents,
      filters: filters
    });
  });
};

/**
 * Show pinned documents (only the pins, not the surrounding interface)
 */
module.exports.pinned = function(req, res, next) {
  var sfdcId = req.reqParams.context.recordId;
  
  salesfetchHelpers.findPins(sfdcId, req.user, function(err, pins) {
    if(err) {
      next(err);
    }

    res.render('components/_pinned-list.html', { pins: pins });
  });
};

/**
 * Pin a document
 */
module.exports.addPin = function(req, res, next) {
  var sfdcId = req.reqParams.context.recordId;
  var anyFetchId = req.params.id;
  salesfetchHelpers.addPin(sfdcId, anyFetchId, req.user, function(err) {
    if(err) {
      if (err.name && err.name === 'MongoError' && err.code === 11000) {
        var e = new Error('InvalidArgument: the AnyFetch object ' + anyFetchId + ' is already pinned to the context ' + sfdcId);
        //e.status = 409;
        return next(e);
      }

      return next(err);
    }

    res.send(204);
  });
};

/**
 * Unpin a document
 */
module.exports.removePin = function(req, res, next) {
  var sfdcId = req.reqParams.context.recordId;
  var anyFetchId = req.params.id;
  salesfetchHelpers.removePin(sfdcId, anyFetchId, req.user, function(err) {
    if(err) {
      return next(err);
    }

    res.send(202);
  });
};

/**
 * Show full document
 */
module.exports.documentDisplay = function(req, res, next) {
  var reqParams = req.reqParams;

  anyfetchHelpers.findDocument(req.params.id, req.user, function(err, document) {
    if(err) {
      return next(err);
    }

    res.render('app/full/' + req.deviceType + '.html', {
      data: reqParams,
      document: document
    });
  });
};

/**
 * Display list of all providers
 */
module.exports.listProviders = function(req, res, next) {
  var reqParams = req.reqParams;
  async.parallel({
    providersInformation: function(cb) {
      anyfetchHelpers.getProviders(cb);
    },
    connectedProviders: function(cb) {
      anyfetchHelpers.getConnectedProviders(req.user, cb);
    }
  }, function(err, data) {
    if (err) {
      return next(err);
    }

    res.render('app/providers.html', {
      data: reqParams,
      providers: data.providersInformation,
      connectProviders: data.connectedProviders.body
    });
  });
};

/**
 * Redirect the user on the connection page
 */
module.exports.connectProvider = function(req, res, next) {
  if (!req.query.app_id) {
    var e = new Error('Missing app_id query string.');
    //e.status = 409;
    return next(e);
  }

  var connectUrl = 'https://manager.anyfetch.com/connect/' + req.query.app_id + '?bearer=' + req.user.anyFetchToken;
  res.redirect(connectUrl);
};
