/**
 * Salesfoce Canvas controller
 */
'use strict';

var anyfetchHelpers = require('../helpers/anyfetch.js');
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
      label: 'Earlier this Years',
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
      console.log();

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
      console.log();
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
 * Show pinned documents
 */
module.exports.pinned = function(req, res, next) {
  if(!req.reqParams || !req.reqParams.context || !req.reqParams.context.recordId) {
    return next(409, new Error('Missing context argument in querystring'));
  }

  var sfdcId = req.reqParams.context.recordId;
  anyfetchHelpers.findPins(sfdcId, req.user, function(err, pins) {
    if(err) {
      return next(err);
    }
    // TODO: render a proper template
    // res.render('app/context/' + req.deviceType + '.html', {
    //   data: req.reqParams,
    //   documents: pins
    // });
    res.send(200, pins);
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

  async.parallel([
    function(cb) {
      anyfetchHelpers.getProviders(cb);
    },
    function(cb) {
      anyfetchHelpers.getConnectedProviders(reqParams.anyFetchURL, req.user, cb);
    }
  ], function(err, data) {
    if (err) {
      return next(err);
    }

    res.render('app/providers.html', {
      data: reqParams,
      providers: data[0],
      connectProviders: data[1].body
    });
  });
};

/**
 * Redirect the user on the connection page
 */
module.exports.connectProvider = function(req, res, next) {
  if (!req.query.app_id) {
    return next(new Error('Missing app_id query string.'));
  }

  var connectUrl = 'http://settings.anyfetch.com/provider/connect?app_id=' + req.query.app_id + '&token=' + req.user.anyFetchToken;
  res.redirect(connectUrl);
};